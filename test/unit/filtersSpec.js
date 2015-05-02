'use strict';

/* jasmine specs for filters go here */

describe('filter', function() {

    beforeEach(module('runnable.filters'));

    describe('capitalize', function() {

        it('should capitalize the word in parameter',
            inject(function(capitalize) {
                expect(capitalize('good')).toBe('Good');
                expect(capitalize('BONJOUR')).toBe('Bonjour');
            }));
    });
});