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
    controller('AppRun', function ($scope, $cookies) {
        'use strict';
        $scope.page = 'Run';
        $scope.user = angular.fromJson($cookies.user);
    });