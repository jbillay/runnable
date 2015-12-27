/**
 * Created by jeremy on 09/04/15.
 */
'use strict';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Page  = require('../../server/objects/page');
var settings = require('../../conf/config');

describe('Test of Page object', function () {
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of page over !');
    });

    it('Get page list', function (done) {
        var page = new Page();
        page.getList(function (err, thePage) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(thePage.length, 2);
			return done();
        });
    });

    it('Get page by tag', function (done) {
        var page = new Page();
        page.getByTag('test', function (err, thePage) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(thePage.id, 1);
            assert.equal(thePage.title, 'Page de test');
            assert.equal(thePage.tag, 'test');
            assert.equal(thePage.content, 'HTML TEXT');
			return done();
        });
    });

    it('Create a new Page', function (done) {
        var page = new Page(),
            newPage = {
                title: 'Test during unit test',
                tag: 'test-during-unit-test',
                content: 'Test during unit test HTML CONTENT'
            };
        page.set(newPage);
        var tmp = page.get();
        assert.equal(tmp.title, 'Test during unit test');
        assert.equal(tmp.tag, 'test-during-unit-test');
        assert.equal(tmp.content, 'Test during unit test HTML CONTENT');
        assert.equal(tmp.is_active, true);
        page.save(tmp, function (err, createdPage) {
            if (err) return done(err);
            assert.isNull(err);
            page.getByTag('test-during-unit-test', function (err, thePage) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(thePage.title, 'Test during unit test');
                assert.equal(thePage.tag, 'test-during-unit-test');
                assert.equal(thePage.content, 'Test during unit test HTML CONTENT');
                assert.equal(thePage.is_active, true);
                return done();
            });
        });
    });
	
	it('Save a modified Page', function (done) {
		var page = new Page();
        page.getByTag('test', function (err, thePage) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(thePage.id, 1);
            assert.equal(thePage.title, 'Page de test');
            assert.equal(thePage.tag, 'test');
            assert.equal(thePage.content, 'HTML TEXT');
			thePage.content = '<div>test</div>';
			thePage.title = 'Page de modification';
			page.save(thePage, function (err, modifiedPage) {
				if (err) return done(err);
				assert.isNull(err);
				assert.equal(modifiedPage.id, 1);
				assert.equal(modifiedPage.title, 'Page de modification');
				assert.equal(modifiedPage.tag, 'test');
				assert.equal(modifiedPage.content, '<div>test</div>');
				return done();
			});
        });
	});
});