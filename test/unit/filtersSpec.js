'use strict';

/* jasmine specs for filters go here */

describe('filter', function() {

    beforeEach(module('runnable.filters'));

    describe('capitalize', function() {
        it('should capitalize the word in parameter',
            inject(function(capitalizeFilter) {
                expect(capitalizeFilter('good')).toBe('Good');
                expect(capitalizeFilter('BONJOUR')).toBe('Bonjour');
                expect(capitalizeFilter('')).toBe('');
            }));
    });
    describe('paypalAmount', function() {
        it('should modify the amount from . to ,',
            inject(function(paypalAmountFilter) {
                expect(paypalAmountFilter('good')).toBe('good');
                expect(paypalAmountFilter('9.10')).toBe('9,10');
                expect(paypalAmountFilter('10,56')).toBe('10,56');
                expect(paypalAmountFilter('')).toBe('');
            }));
    });
    describe('runname', function() {
        it('should filter name of run',
            inject(function(runnameFilter) {
                expect(runnameFilter(
                    [{Run: {name: 'toto'}}, {Run: {name: 'jeremy'}}, {Run: {name: 'titi'}}, {Run: {name: 'test'}}], 't'))
                .toEqual(
                    [{Run: {name: 'toto'}}, {Run: {name: 'titi'}}, {Run: {name: 'test'}}]
                );
                expect(runnameFilter(
                    [{Run: {name: 'TOTO'}}, {Run: {name: 'jeremy'}}, {Run: {name: 'titi'}}, {Run: {name: 'test'}}], 't'))
                    .toEqual(
                    [{Run: {name: 'TOTO'}}, {Run: {name: 'titi'}}, {Run: {name: 'test'}}]
                );
                expect(runnameFilter(
                    [{Run: {name: 'toto'}}, {Run: {name: 'jeremy'}}, {Run: {name: 'titi'}}, {Run: {name: 'test'}}], ''))
                    .toEqual(
                    [{Run: {name: 'toto'}}, {Run: {name: 'jeremy'}}, {Run: {name: 'titi'}}, {Run: {name: 'test'}}]
                );
                expect(runnameFilter(
                    [{Run: {name: 'toto'}}, {Run: {name: 'jeremy'}}, {Run: {name: 'titi'}}, {Run: {name: 'test'}}], 'a'))
                    .toEqual(
                    []
                );
            }));
    });
});