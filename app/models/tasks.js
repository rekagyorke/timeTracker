var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var bcrypt 		 = require('bcrypt-nodejs');
var User         = require('../models/user');
var Project      = require('../models/projects');

// project schema
var taskSchema   = new Schema({
    user_id : { type: mongoose.Schema.ObjectId, ref: 'User'},
    project_id : { type: mongoose.Schema.ObjectId, ref: 'Project'},
    start_time :{ type : Date, default : Date.now },
    end_time : Date,
    task : String

});

module.exports = mongoose.model('Task', taskSchema);
