//imports
const express = require('express');
const securityRoutes = express.Router();
const cors = require("cors");
const domainModel = require('../models/domainModel');

// use cors
securityRoutes.use(cors());

//serve static files, like css files
securityRoutes.use('/public', express.static('public'));

//check domain
//on get, renders the domain-form page in check mode
securityRoutes.get('/', function (req, res) {
  res.render("domain-form", { page: "check" });
})
//in post, gets domain variable from request
//checks for validation
//if the domain doesn't exist, adds it to db and renders the domain-form page in check mode with appropriate message
//if it exists but hasn't been checked yet (doesn't have results from either test), renders the domain-form page in check mode with appropriate message
//if it exists and has been checked, renders the domain-form page in check mode and sends the domain data
securityRoutes.post('/', function (req, res) {
  if (req.body.domain) var domain = req.body.domain;
  else var domain = "";

  if (domain == '' || domain == null || !validateDomain(domain)) {
    res.render("domain-form", { page: "check", domain:domain, error: "Please enter a domain in the correct format." });
  }
  else {
    domainModel.findOne({ domain: domain }, function (err, dom) {
      if (!dom) {
        var newDomain = new domainModel({ domain: domain });
        newDomain.save(function (err, ndom) {
          if (!err) {
            res.render("domain-form", { page: "check", domain:domain, success: "Domain doesn't exist, added to our database. Please check back for results later." });
          }
          else {
            res.render("domain-form", { page: "check", domain:domain, error: err });
          }
        })
      }
      else if (!JSON.stringify(dom).includes("nvtRes") || !JSON.stringify(dom).includes("whoisCheck")) {
        res.render("domain-form", { page: "check" ,domain:domain, success: "Domain is currently being checked, please check back in later."});
      }
      else {
        res.render("domain-form", { page: "check" ,domain:domain, domainData:dom});
      }

    })
  }

})

//add domain
//on get, renders the domain-form page in add mode
securityRoutes.get('/addDomain', function (req, res) {
  res.render("domain-form", { page: "add" });
})
//in post, gets domain variable from request
//checks for validation
//if the domain exists,  renders the domain-form page in add mode with appropriate message
//if it doesn't exist, adds the domain to db and renders the domain-form page in add mode with appropriate message
securityRoutes.post('/addDomain', function (req, res) {
  if (req.body.domain) var domain = req.body.domain;
  else var domain = "";

  if (domain == '' || domain == null || !validateDomain(domain)) {
    res.render("domain-form", { page: "add", domain:domain, error: "Please enter a domain in the correct format." });
  }
  else {
    domainModel.findOne({ domain: domain }, function (err, dom) {
      if (dom) {
        res.render("domain-form", { page: "add", domain:domain, error: "Domain already exists." });
      }
      else {
        var newDomain = new domainModel({ domain: domain });
        newDomain.save(function (err, ndom) {
          if (!err) {
            res.render("domain-form", { page: "add", domain:domain, success: "Domain successfully added!" });
          }
          else {
            res.render("domain-form", { page: "add", domain:domain, error: err });
          }
        })

      }

    })


  }
})
//exports router
module.exports = securityRoutes;
//----
//using regex to validate domain
const validateDomain = (domain) => {
  return domain.match(
    /^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})$/
  );
};