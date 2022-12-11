let mongoose = require('mongoose');

// Log schema
// uses date.now to set when's value as the current time
let log_schema = new mongoose.Schema({
    method:{type:String,  required: true},
    when:{type:Date,  required: true, default:Date.now()},
    path:{type:String,  required: true}
}, {collection:'logs'});

// creates mongoose model for logs from schema
const log_model = mongoose.model('log_model',log_schema);

// exports model
module.exports = log_model;
        
