/**declaration of controller, using vm (ViewModel) a capture variable*/
(function() {

    'use strict';

    angular
        .module('app' )
        .controller('TimeEntry', TimeEntry);

    function TimeEntry(time, projects, UserService, $scope, $routeParams, $rootScope) {
        //alert($routeParams.id);
        // vm is our capture variable
        var vm = this;

        initController();

        function initController() {
            loadCurrentUser();
        }

        function loadCurrentUser() {
            UserService.GetByUsername($rootScope.globals.currentUser.username)
                .then(function (user) {
                    vm.user = user.data;
                    // Grab all the time entries saved in the database
                    getTimeEntries();
                });
        }


        vm.project = null;
        projects.getProject($routeParams.id).then(function (results) {
            console.log(results);
            vm.project = results.data;
            console.log(vm.project);
        }, function (error) {
            console.log(error);
        });

        vm.timeentries = [];
        vm.totalTime = {};

        // Initialize the clockIn and clockOut times to the current time.
        vm.clockIn = moment();
        vm.clockOut = moment();




        // Fetches the time entries and puts the results
        // on the vm.timeentries array
        function getTimeEntries() {
            time.getTime($routeParams.id, vm.user._id, vm.user.job).then(function (results) {
                vm.timeentries = results;
                updateTotalTime(vm.timeentries);
                console.log(vm.timeentries);
            }, function (error) {
                console.log(error);
            });
        }

        // Updates the values in the total time box by calling the
        // getTotalTime method on the time service
        function updateTotalTime(timeentries) {
            vm.totalTime = time.getTotalTime(timeentries);
        }

        // Submit the time entry that will be called
        // when we click the "Log Time" button
        vm.logNewTime = function () {

            // Make sure that the clock-in time isn't after
            // the clock-out time!
            if (vm.clockOut < vm.clockIn) {
                alert("You can't clock out before you clock in!");
                return;
            }

            // Make sure the time entry is greater than zero
            if (vm.clockOut - vm.clockIn === 0) {
                alert("Your time entry has to be greater than zero!");
                return;
            }

            // Call to the saveTime method on the time service
            // to save the new time entry to the database
            time.saveTime({
                "user_id":vm.user._id,
                "project_id": vm.project._id,
                "start_time": vm.clockIn,
                "end_time": vm.clockOut,
                "task": vm.task
            }).then(function (success) {
                getTimeEntries();
                console.log(success);
            }, function (error) {
                console.log(error);
            });

            getTimeEntries();

            // Reset clockIn and clockOut times to the current time
            vm.clockIn = moment();
            vm.clockOut = moment();

            // Clear the comment field
            vm.task = "";

            // Deselect the user
            vm.timeEntryUser = "";

        }


        vm.updateTimeEntry = function (timeentry) {

            // Collect the data that will be passed to the updateTime method
            var updatedTimeEntry = {
                "id": timeentry._id,
                "start_time": timeentry.start_time,
                "end_time": timeentry.end_time,
                "task": timeentry.task
            }

            // Update the time entry and then refresh the list
            time.updateTime(updatedTimeEntry).then(function (success) {
                getTimeEntries();
                $scope.showEditDialog = false;
                console.log(success);
            }, function (error) {
                console.log(error);
            });
        }

        // Specify the time entry to be deleted and pass it to the deleteTime method on the time service
        vm.deleteTimeEntry = function (timeentry) {
            var id = timeentry._id;

            time.deleteTime(id).then(function (success) {
                getTimeEntries();
                console.log(success);
            }, function (error) {
                console.log(error);
            });
        }
    }
})();

