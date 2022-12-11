//imports
const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
mongoose = require('mongoose');
const domainModel = require('./models/domainModel');
const securityRoutes = require('./routes/securityRouter');

// setting up node virustotal
const nvt = require('node-virustotal');
const defaultTimedInstance = nvt.makeAPI();
const theSameKey = defaultTimedInstance.setKey('226bd9581fc15a6032458c87dd064e847c0a28fea1ad66ad91305432e20ba8a6');

// setting up whois
const whois = require('whois-json');

// sets express, cors and bodyparser
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// connects to mongodb database
mongoose.connect('mongodb://localhost:27017/securityDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("DB connected");
}).catch(err => {
  console.log("Database not connected" + err)
});

// uses cors
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//sets render engine
app.set('view engine', 'ejs');

// require the log model from models folder to use it in the middleware log function
const LogModel = require('./models/logModel');

// setting a middleware function to create a log and save it
// in the log collection.
var doLog = async function (req, res, next) {

  let method = req.method;
  let path = req.path;

  let log = new LogModel({ method: method, path: path });

  await log.save(function (err, log) {
    // setting this as an async function that awaits on log.save() (the promise in this case)
    // will make it so that until the save function doesn't finish working the rest of the
    // code won't be run.
    if (!err) {
      console.log(log)
      next();
      // if adding the new log object was successful, 
      // Calling next() so the server will do the 'next' function after doLog.
    }
    else {
      console.log("couldn't save log.", err);
    }
  });
}

// Using the middleware log function on /
// so it'll work on every server request.
app.use('/', doLog);

//uses router
app.use('/', securityRoutes)


// ---
//checking domains
//using setInterval, will perform check on all domains every month
//first finds all domains in db,
//then using async function will check every domain with nvt check and whois check
//once checks are complete, will update the domains in db

setInterval(
  () => {
    domainModel.find({}, function (err, domains) {
      if (!err) {
        async function checkDomain() {
          for (const domain of domains) {


            const nvtCheck = theSameKey.domainLookup(domain.domain, async function (err, res) {
              if (err) {
                console.log(err);
                return;
              }
              const nvtRes = JSON.parse(res);
              const whoisCheck = await whois(domain.domain);
              const checkResult = {
                nvtRes,
                whoisCheck
              }

              var updateQuery = { $set: checkResult };
              domainModel.collection.updateOne({_id:domain._id}, updateQuery, { new: true }, function (err, updatedDomain) {
                if (!err) {
                  console.log(updatedDomain);
                }
                else {
                  console.log(err);
                }
              })

              return;
            });
            nvtCheck;



          }
        }
        checkDomain()
      }
      else {
        console.log(err);
      }
    })
  },
  2.628e+6 * 1000
);

//-----

//listens on port 8080
app.listen(process.env.PORT || 8080, () => {
  console.log('server running');
});