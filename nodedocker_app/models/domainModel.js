let mongoose = require('mongoose'); // requires mongodb


// domain schema
//only domain is required
const domain_schema = new mongoose.Schema({
    domain:{type:String, required:true},
}, {collection:'domains'}, {strict: false});

// creates mongoose model for domains from schema
const domain_model = mongoose.model('domain_model',domain_schema);

// exports model
module.exports = domain_model;