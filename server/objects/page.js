/**
 * Created by jeremy on 09/04/15.
 */

var models = require('../models');
var _ = require('lodash');

function page() {
    'use strict';
	this.title = null;
	this.tag = null;
	this.content = null;
	this.is_active = true;
}

page.prototype.get = function () {
    'use strict';
    return this;
};

page.prototype.set = function (page) {
    'use strict';
	if (page.title) {
		this.title = page.title;
	}
	if (page.tag) {
		this.tag = page.tag;
	}
	if (page.content) {
		this.content = page.content;
	}
	if (page.is_active) {
		this.is_active = page.is_active;
	} else {
		this.is_active = true;
	}
};

page.prototype.save = function (page, done) {
    'use strict';
	var that = this;
	that.set(page);
	models.Page.findOrCreate({where: {tag: that.tag}, 
								defaults: {	title: that.title,
											tag: that.tag,
											content: that.content,
											is_active: that.is_active}})
				.spread(function (newPage, created) {
					if (created) {
						done(null, newPage);
					} else {
						var updatedPage = _.assign(newPage, that);
						updatedPage.save()
							.then(function (newPage) {
								done(null, newPage);
							});
					}
				})
				.catch(function (err) {
					done(err, null);
				});
};

page.prototype.getByTag = function (tag, done) {
    'use strict';
	models.Page.find({where: {tag: tag}})
		.then(function (thePage) {
			done(null, thePage);
		})
		.catch(function (err) {
			done(err, null);
		});
};

page.prototype.getList = function (done) {
    'use strict';
	models.Page.findAll()
		.then(function (pages) {
			done(null, pages);
		})
		.catch(function (err) {
			done(err, null);
		});
};

module.exports = page;