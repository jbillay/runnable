/**
 * Created by jeremy on 04/01/2014.
 */

/* Filters */

angular.module('runnable.filters', []).
    filter('interpolate', function (version) {
        'use strict';
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        };
    });