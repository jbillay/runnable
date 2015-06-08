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