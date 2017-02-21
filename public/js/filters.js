/**
 * Created by jeremy on 04/01/2014.
 */

/* Filters */

'use strict';

angular.module('runnable.filters', []).
	filter('capitalize', function() {
		return function(input) {
			return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
		};
	}).
    filter('paypalAmount', function () {
        return function(input) {
            return (!!input) ? input.replace('.', ',') : '';
        };
    }).
    filter('paypalPointAmount', function () {
        return function(input) {
            return (!!input) ? input.replace(',', '.') : '';
        };
    }).
    filter('showInPercentage', function () {
        return function(input) {
            return (!!input) ? '' + (_.toNumber(input) * 100).toFixed(0) + '%' : '-';
        };
    }).
    filter('showAll', function () {
        return function(input) {
            return (!!input) ? input : '*';
        };
    }).
    filter('showRun', function () {
        return function(input) {
            return (!!input) ? input.name : '*';
        };
    }).
    filter('showUser', function () {
        return function(input) {
            return (!!input) ? input.firstname + ' ' + input.lastname : '*';
        };
    }).
    filter('showInfinite', function () {
        return function(input) {
            return (!!input) ? input : '∞';
        };
    }).
    filter('joinAdmin', function() {
        return function(items, flags) {
            var filtered = [];

            angular.forEach(items, function(item) {
                angular.forEach(flags, function(value, key) {
                    if (item.Invoice.status === key.toLowerCase() && value === true) {
                        filtered.push(item);
                    }
                });
            });
            return filtered;
        };
    }).
    filter('runname', function () {
        return function (items, search) {
            if (!search) {
                return items;
            }
            var reg = new RegExp(search, 'gi');
            return items.filter(function (element) {
                var flag = false;
                if (reg.test(element.Run.name)) {
                    flag = true;
                }
                return flag;
            });
        };
    });