/**declaration of controller, using vm (ViewModel) a capture variable*/
(function() {

    'use strict';

    angular
        .module('app')
        .controller('projectController', projectController);

   projectController.$inject = ['projects', 'time','UserService', '$rootScope'];
    function projectController(projects, time, UserService, $rootScope) {

        // vm is our capture variable
        var vm = this;

        vm.projects = [];


        initController();

        function initController() {
            loadCurrentUser();

        }

        function loadCurrentUser() {
            UserService.GetByUsername($rootScope.globals.currentUser.username)
                .then(function (user) {
                    vm.user = user.data;
                   // console.log(vm.user);
                    getAllProjects();
                });
        }


        // Fetches the time entries from the static JSON file
        // and puts the results on the vm.projects array
       function getAllProjects() {

           projects.getProjects().then(function (results) {
               vm.projects = results;
               angular.forEach(vm.projects, function(value, key){

                   time.getTime(value._id, vm.user._id, vm.user.job).then(function (results) {
                        vm.projects[key].timeentries = results;
                        vm.projects[key].totalTime = time.getTotalTime(results);
                        if (typeof results[0] !== 'undefined')
                            vm.projects[key].lastUpdate = results[0].end_time;
                        else
                            vm.projects[key].lastUpdate = '-';
                   }, function (error) {
                       console.log(error);
                   });

               });
               console.log(vm.projects);
           }, function (error) { // Check for errors
               console.log(error);
           });
       }


        // Submit the project that will be called
        // when we click the "Submit" button
        vm.submitProject = function () {

            projects.saveProjects({
                "projectname": vm.project_name,
                "user_id": vm.user._id
            }).then(function (success) {
                getAllProjects();
                //console.log(success);
            }, function (error) {
                console.log(error);
            });

            getAllProjects();

            vm.project_name = "";
        }

    }

})();
