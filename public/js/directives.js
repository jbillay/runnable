/**
 * Created by jeremy on 04/01/2014.
 */

'use strict';

angular.module('runnable.directives', []).
	directive('compareTo', function () {
		return {
			require: 'ngModel',
			scope: {
				otherModelValue: '=compareTo'
			},
			link: function(scope, element, attributes, ngModel) {

				ngModel.$validators.compareTo = function(modelValue) {
					return modelValue === scope.otherModelValue;
				};

				scope.$watch('otherModelValue', function() {
					ngModel.$validate();
				});
			}
		};
	}).
    directive('ngFileSelect', function() {
        return {
            link: function($scope, el) {
                el.bind('change', function(e){
                    $scope.file = (e.srcElement || e.target).files[0];
                    $scope.getFile($scope.file);
                });
            }
        };
    }).
    directive('awDatepickerPattern',function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope,elem,attrs,ngModelCtrl) {
                var dRegex = new RegExp(attrs.awDatepickerPattern);
                // TODO : build a date if format not compliant with new Date
                ngModelCtrl.$parsers.unshift(function(value) {
                    if (typeof value === 'string') {
                        var valueDate = new Date(value);
                        var isValid = dRegex.test(valueDate);
                        ngModelCtrl.$setValidity('date', isValid);
                        if (!isValid) {
                            return undefined;
                        }
                    }
                    return value;
                });

            }
        };
    }).
    directive('ngFormCommit', [function(){
        return {
            require:'form',
            link: function($scope, $el, $attr, $form) {
                $form.commit = function() {
                    $el[0].submit();
                };
            }
        };
    }]);