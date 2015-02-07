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
    filter('runname', function () {
        "use strict";
        return function (items, search) {
            if (!search) {
                return items;
            }
            var reg = new RegExp(search, "gi");
            return items.filter(function (element) {
                var flag = false;
                if (reg.test(element.Run.name)) {
                    flag = true;
                }
                return flag;
            });
        };
    }).
    filter('interpolate', function (version) {
        'use strict';
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        };
    });