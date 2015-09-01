(function() {

    'use strict';

    angular
        .module('app')
        .factory('projects', projects);

    function projects($resource, $http, $rootScope){

        // ngResource call to the API with id as a paramaterized URL
        var Projects = $resource('api/projects', {}, {
            update:{
                method: 'PUT'
            }
        });


        function getProjects(){
            // $promise.then allows us to intercept the results
            // which we will use later
            return Projects.query({}).$promise.then(function(results){
                return results;
            },
            function(error){ //check errors
                console.log(error);
            });
        }

        function getProject(id){
            // $promise.then allows us to intercept the results
            // which we will use later
            return $http.get('/api/project/' + id).then(function(result){
                    return result;
                },
                function(error){ //check errors
                    console.log(error);
                });
        }
        // Grab data passed from the view and send
        // a POST request to the API to save the data
        function saveProjects(data){
            return Projects.save(data).$promise.then(function(success) {
                console.log(success);
            }, function(error) {
                    console.log(error);
                });
        }
        return {
            getProjects : getProjects,
            saveProjects : saveProjects,
            getProject : getProject
        }
    }

})();
