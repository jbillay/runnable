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
    });

