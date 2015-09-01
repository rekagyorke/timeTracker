var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var bcrypt 		 = require('bcrypt-nodejs');
var User         = require('../models/user');
//var autoIncrement = require("mongodb-autoincrement");

// project schema
var projectSchema   = new Schema({
    projectname: String,
    user_id : { type: mongoose.Schema.ObjectId, ref: 'User'}
});
//projectSchema.plugin(autoIncrement.mongoosePlugin);
module.exports = mongoose.model('Project',projectSchema);

