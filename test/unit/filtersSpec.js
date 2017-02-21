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
    describe('paypalPointAmount', function() {
        it('should modify the amount from , to .',
            inject(function(paypalPointAmountFilter) {
                expect(paypalPointAmountFilter('good')).toBe('good');
                expect(paypalPointAmountFilter('9,13')).toBe('9.13');
                expect(paypalPointAmountFilter('10.76')).toBe('10.76');
                expect(paypalPointAmountFilter('')).toBe('');
            }));
    });
    describe('showInPercentage', function() {
        it('should show amount in %  or - if nothing',
            inject(function(showInPercentageFilter) {
                expect(showInPercentageFilter('')).toBe('-');
                expect(showInPercentageFilter('0.1')).toBe('10%');
                expect(showInPercentageFilter('0.56')).toBe('56%');
                expect(showInPercentageFilter('1')).toBe('100%');
            }));
    });
    describe('showAll', function() {
        it('should show the value or * if nothing',
            inject(function(showAllFilter) {
                expect(showAllFilter('')).toBe('*');
                expect(showAllFilter('Jeremy Billay')).toBe('Jeremy Billay');
                expect(showAllFilter('10')).toBe('10');
                expect(showAllFilter('10%')).toBe('10%');
            }));
    });
    describe('showRun', function() {
        it('should show run name or * if nothing',
            inject(function(showRunFilter) {
                expect(showRunFilter({name: 'test'})).toBe('test');
                expect(showRunFilter('')).toBe('*');
            }));
    });
    describe('showUser', function() {
        it('should show user firstname and lastname or * if nothing',
            inject(function(showUserFilter) {
                expect(showUserFilter({firstname: 'Jeremy', lastname: 'Billay'})).toBe('Jeremy Billay');
                expect(showUserFilter('')).toBe('*');
            }));
    });
    describe('showInfinite', function() {
        it('should show the value or * if nothing',
            inject(function(showInfiniteFilter) {
                expect(showInfiniteFilter('')).toBe('∞');
                expect(showInfiniteFilter('Jeremy Billay')).toBe('Jeremy Billay');
            }));
    });
    describe('joinAdmin', function() {
        it('should filter list based on flags',
            inject(function(joinAdminFilter) {
                var items = [
                        { Invoice: {status: 'completed'} },
                        { Invoice: {status: 'pending'} },
                        { Invoice: {status: 'cancelled'} },
                        { Invoice: {status: 'completed'} }
                    ],
                    flags_complete = {
                        completed: true,
                        pending: false,
                        cancelled: false
                    },
                    flags_all = {
                        completed: true,
                        pending: true,
                        cancelled: true
                    },
                    flags_pending = {
                        completed: false,
                        pending: true,
                        cancelled: false
                    };
                expect(joinAdminFilter(items, flags_complete).length).toBe(2);
                expect(joinAdminFilter(items, flags_pending).length).toBe(1);
                expect(joinAdminFilter(items, flags_all).length).toBe(4);
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