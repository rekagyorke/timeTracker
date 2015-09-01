var bodyParser      = require('body-parser'); 	// get body-parser
var User            = require('../models/user');
var Project         = require('../models/projects');
var Task            = require('../models/tasks');
var jwt             = require('jsonwebtoken');
var config          = require('../../config');

// super secret for creating tokens
var superSecret = config.secret;

module.exports = function(app, express) {

    var apiRouter = express.Router();

    // route to generate sample user
    /*   apiRouter.post('/sample', function(req, res) {

     // look for the user named chris
     User.findOne({ 'username': 'chris' }, function(err, user) {

     // if there is no chris user, create one
     if (!user) {
     var sampleUser = new User();

     sampleUser.name = 'Chris';
     sampleUser.username = 'chris';
     sampleUser.password = 'supersecret';

     sampleUser.save();
     } else {
     console.log(user);

     // if there is a chris, update his password
     user.password = 'supersecret';
     user.save();
     }

     });

     });*/

    // route to authenticate a user (POST http://localhost:8080/api/authenticate)
    apiRouter.post('/authenticate', function (req, res) {

        // find the user
        User.findOne({
            username: req.body.username
        }).select('name username password').exec(function (err, user) {

            if (err) throw err;

            // no user with that username was found
            if (!user) {
                res.json({
                    success: false,
                    message: 'Authentication failed. User not found.'
                });
            } else if (user) {

                // check if password matches
                var validPassword = user.comparePassword(req.body.password);
                if (!validPassword) {
                    res.json({
                        success: false,
                        message: 'Authentication failed. Wrong password.'
                    });
                } else {

                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign({
                        name: user.name,
                        username: user.username
                    }, superSecret, {
                        expiresInMinutes: 1440 // expires in 24 hours
                    });

                    // return the information including token as JSON
                    res.json({
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });
                }

            }

        });
    });

    // test route to make sure everything is working
    // accessed at GET http://localhost:8080/api
    apiRouter.get('/', function (req, res) {
        res.json({message: 'hooray! welcome to our api!'});
    });

    // on routes that end in /users
    // ----------------------------------------------------
    apiRouter.route('/users')

        // create a user (accessed at POST http://localhost:8080/users)
        .post(function (req, res) {

            var user = new User();		// create a new instance of the User model
            user.first_name = req.body.first_name;  // set the users name (comes from the request)
            user.last_name = req.body.last_name;  // set the users name (comes from the request)
            user.username = req.body.username;  // set the users username (comes from the request)
            user.password = req.body.password;  // set the users password (comes from the request)
            user.job = req.body.job;            //set the users function (user/admin)

            user.save(function (err) {
                if (err) {
                    // duplicate entry
                    if (err.code == 11000)
                        return res.json({success: false, message: 'A user with that username already exists. '});
                    else
                        return res.send(err);
                }

                // return a message
                res.json({success: true, message: 'User created!'});
            });

        })

        // get all the users (accessed at GET http://localhost:8080/api/users)
        .get(function (req, res) {

            User.find({}, function (err, users) {
                if (err) res.send(err);

                // return the users
                res.json(users);
            });
        });

    // on routes that end in /users/:user_id
    // ----------------------------------------------------
    apiRouter.route('/users/:user_id')
        // get the user with that id
        .get(function (req, res) {
            //console.log(req);
            User.findOne({'username': req.params.user_id}, function (err, user) {

                if (err) res.send(err);

                // return that user
                res.json(user);

            });
        });

    /*  // update the user with this id
     .put(function(req, res) {
     User.findById(req.params.user_id, function(err, user) {

     if (err) res.send(err);

     // set the new user information if it exists in the request
     if (req.body.name) user.name = req.body.name;
     if (req.body.username) user.username = req.body.username;
     if (req.body.password) user.password = req.body.password;

     // save the user
     user.save(function(err) {
     if (err) res.send(err);

     // return a message
     res.json({ message: 'User updated!' });
     });

     });
     })*/

    /*// delete the user with this id
     .delete(function(req, res) {
     User.remove({
     _id: req.params.user_id
     }, function(err, user) {
     if (err) res.send(err);

     res.json({ message: 'Successfully deleted' });
     });
     });
     */

    // api endpoint to get user information
    apiRouter.get('/me', function (req, res) {
        res.send(req.decoded);
    });


    apiRouter.route('/projects')

        // create a projects (accessed at POST http://localhost:8080/projects)
        .post(function (req, res) {
            var project = new Project();		// create a new instance of the Project model
            project.projectname = req.body.projectname;  // set the project name (comes from the request)
            project.user_id = req.body.user_id;  // set the project owner (comes from the request)

            project.save(function (err) {
                if (err) {
                    // duplicate entry
                    if (err.code == 11000)
                        return res.json({success: false, message: 'This project already exists!'});
                    else
                        return res.send(err);
                }

                // return a message
                res.json({success: true, message: 'Project created!'});

            });
        })

        // get all the projects (accessed at GET http://localhost:8080/projects)
        .get(function (req, res) {
            Project.find({}, function (err, projects) {
                if (err) res.send(err);

                // return projects
                res.json(projects);
            });
        });

    apiRouter.route('/project/:id')
        // get the user with that id
        .get(function (req, res) {
            //console.log(req);
            Project.findOne({'_id': req.params.id}, function (err, project) {

                if (err) res.send(err);

                // return that project
                res.json(project);

            });
        });

    apiRouter.route('/tasks')

        .post(function (req, res) {
            var task = new Task();
            task.user_id = req.body.user_id;
            task.project_id = req.body.project_id;
            task.start_time = req.body.start_time;
            task.end_time = req.body.end_time;
            task.task = req.body.task;

            task.save(function (err) {
                if (err) {
                    return res.send(err);
                }

                res.json({success: true, message: 'Task created!'});
            });
        })

        .get(function (req, res) {
            //console.log(req.query.project_id);
            if (req.query.user_id){
                Task
                    .find({'project_id': req.query.project_id, 'user_id': req.query.user_id})
                    .populate('user_id') // only return the Persons name
                    .sort({end_time: 'desc'})
                    .exec(function (err, task) {
                        console.log(task.user_id);
                        if (err) res.send(err);

                        //return tasks
                        res.json(task);
                    });
                /*Task.find({'project_id': req.query.project_id, 'user_id': req.query.user_id}, function (err, task) {
                    if (err) res.send(err);

                    //return tasks
                    res.json(task);
                });*/
            }else {
                Task
                    .find({'project_id': req.query.project_id})
                    .populate('user_id') // only return the Persons name
                    .sort({end_time: 'desc'})
                    .exec(function (err, task) {
                        console.log(task.user_id);
                        if (err) res.send(err);

                        //return tasks
                        res.json(task);
                    });
                /*Task.find({'project_id': req.query.project_id}, function (err, task) {
                    if (err) res.send(err);

                    //return tasks
                    res.json(task);
                });*/
            }

        })

    // on routes that end in /tasks/:task_id
    // ----------------------------------------------------
    apiRouter.route('/tasks/:id')
        // get the task with that id
        .get(function (req, res) {
            Task.findById(req.params.id, function (err, task) {

                if (err) res.send(err);

                // return that user
                res.json(task);

            });
        })

        // update the user with this id
        .put(function(req, res) {
            Task.findById(req.params.id, function(err, task) {

                if (err) res.send(err);

                // set the new user information if it exists in the request
                if (req.body.start_time) task.start_time = req.body.start_time;
                if (req.body.end_time) task.end_time = req.body.end_time;
                if (req.body.task) task.task = req.body.task;

                // save the user
                task.save(function(err) {
                    if (err) res.send(err);

                    // return a message
                    res.json({ message: 'Task updated!' });
                });

            });
        })

        // delete task with this id
        .delete(function(req, res) {
            Task.remove({
                _id: req.params.id
            }, function(err, task) {
                if (err) res.send(err);

                res.json({ message: 'Successfully deleted' });
             });
        })

        apiRouter.route('/admin')
        // get all the projects (accessed at GET http://localhost:8080/admin)
        .get(function (req, res) {
            Project.find({}, function (err, projects) {
                if (err) res.send(err);

                // return projects
                res.json(projects);
            });
        });


    apiRouter.route('/admin_calc/:id')
        // get a project with all users (accessed at GET http://localhost:8080/admin_calc/:id)
        .get(function (req, res) {
            User.findOne({'_id': req.params.id}, function (err, projects) {
                if (err) res.send(err);

                // return projects
                res.json(projects);
            });
        });
    return apiRouter;

}
