/**
 * Created by jeremy on 04/01/2014.
 */

/* Filters */

angular.module('runnable.filters', []).
	filter('capitalize', function() {
		return function(input, all) {
			return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
		}
	}).
    filter('interpolate', function (version) {
        'use strict';
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        };
    });