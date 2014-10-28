/**
 * Created by jeremy on 04/01/2014.
 */

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('runnable.services', ['ngResource']).
    factory('UserInfo', function ($resource) {
        'use strict';
        return $resource('/get/user/:id', {id: '@_id.$oid'},
            {'query':  {method: 'GET', isArray: false}});
    }).
    factory('Run', function ($q, $http) {
        'use strict';
        return {
            getActiveList: function () {
                var deferred = $q.defer();
                $http({method: "GET", url: "/run/list"}).
					success(function (result) {
						console.log('Result : ' + result);
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
            }
        };
    });

