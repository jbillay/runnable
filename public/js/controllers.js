/**
 * Created by jeremy on 04/01/2014.
 */

/* Controllers */

/*jshint undef:true */

angular.module('runnable.controllers', []).
    controller('AppIndex', function ($scope) {
        'use strict';
        $scope.page = 'Index';
    }).
    controller('AppHome', function ($scope, $cookies) {
        'use strict';
        $scope.page = 'Home';
        $scope.user = angular.fromJson($cookies.user);
    }).
    controller('AppRun', function ($scope, $cookies, $q, $http, Run) {
        'use strict';
        $scope.page = 'Run';
        $scope.user = angular.fromJson($cookies.user);
        $scope.getLocation = function(val) {
            return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: val,
                    sensor: false
                }
            }).then(function(response){
                return response.data.results.map(function(item){
                    return item.formatted_address;
                });
            });
        };
		var runPromise = Run.getActiveList(),
            all = $q.all([runPromise]);
        all.then(function (res) {
			$scope.listRun = res[0];
		});
    });