/**
 * Created by jeremy on 04/01/2014.
 */

'use strict';

/* Directives */

/*
 <pagination total-items="bigTotalItems" page="bigCurrentPage" max-size="maxSize"
 class="pagination-sm" boundary-links="true" rotate="false" num-pages="numPages"></pagination>
*/

angular.module('runnable.directives', []).
    directive('paginator', function () {
        var pageSizeLabel = "Nb element";
        return {
            priority: 0,
            restrict: 'A',
            scope: {items: '&'},
            template: '<button ng-disabled="isFirstPage()" ng-click="firstPage()">' +
                      '<span class="glyphicon glyphicon-fast-backward"></span></button>' +
                      '<button ng-disabled="isFirstPage()" ng-click="decPage()">' +
                      '<span class="glyphicon glyphicon-step-backward"></span></button>' +
                      '<strong> {{paginator.currentPage+1}} / {{numberOfPages()}} </strong>' +
                      '<button ng-disabled="isLastPage()" ng-click="incPage()">' +
                      '<span class="glyphicon glyphicon-step-forward"></span></button>' +
                      '<button ng-disabled="isLastPage()" ng-click="lastPage()">' +
                      '<span class="glyphicon glyphicon-fast-forward"></span></button>' +
                      '<div class="pull-right"><dl class="dl-horizontal"><dt><span>' +
                      pageSizeLabel + '</span></dt><dd>' +
                      '<select ng-model="paginator.pageSize" ng-options="size for size in pageSizeList">' +
                      '</select></dd></dl></div>',
            replace: false,
            compile: function compile() {
                return {
                    pre: function preLink(scope) {
                        scope.pageSizeList = [10, 20, 50, 100];
                        scope.paginator = {
                            pageSize: 10,
                            currentPage: 0
                        };
                        scope.isFirstPage = function () {
                            return scope.paginator.currentPage === 0;
                        };
                        scope.isLastPage = function () {
                            if (scope.items()) {
                                return scope.paginator.currentPage >= Math.ceil(scope.items().length / scope.paginator.pageSize - 1);
                            }
                            return 0;
                        };
                        scope.incPage = function () {
                            if (!scope.isLastPage()) {
                                scope.paginator.currentPage += 1;
                            }
                        };
                        scope.decPage = function () {
                            if (!scope.isFirstPage()) {
                                scope.paginator.currentPage -= 1;
                            }
                        };
                        scope.lastPage = function () {
                            if (scope.items()) {
                                scope.paginator.currentPage = Math.ceil(scope.items().length / scope.paginator.pageSize - 1);
                            }
                            return 0;
                        };
                        scope.firstPage = function () {
                            scope.paginator.currentPage = 0;
                        };
                        scope.numberOfPages = function () {
                            if (scope.items()) {
                                return Math.ceil(scope.items().length / scope.paginator.pageSize);
                            }
                            return 0;
                        };
                        scope.$watch('paginator.pageSize', function (newValue, oldValue) {
                            if (newValue !== oldValue) {
                                scope.firstPage();
                            }
                        });

                        // ---- Functions available in parent scope -----

                        scope.$parent.firstPage = function () {
                            scope.firstPage();
                        };
                        scope.$parent.lastPage = function () {
                            scope.lastPage();
                        };
                        // Function that returns the reduced items list, to use in ng-repeat
                        scope.$parent.pageItems = function () {
                            if (scope.items()) {
                                var start = scope.paginator.currentPage * scope.paginator.pageSize,
                                    limit = scope.paginator.pageSize;
                                return scope.items().slice(start, start + limit);
                            }
                            return 0;
                        };
                    },
                    post: function postLink(scope, iElement, iAttrs, controller) {}
                };
            }
        };
    }).
    directive('appVersion', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    });