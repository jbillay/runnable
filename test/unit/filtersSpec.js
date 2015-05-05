'use strict';

/* jasmine specs for filters go here */

describe('filter', function() {

    beforeEach(module('runnable.filters'));

    describe('capitalize', function() {

        it('should capitalize the word in parameter',
            inject(function(capitalizeFilter) {
                expect(capitalizeFilter('good')).toBe('Good');
                expect(capitalizeFilter('BONJOUR')).toBe('Bonjour');
            }));
    });
});