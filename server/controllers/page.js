/**
 * Created by jeremy on 09/04/15.
 */

var Page = require('../objects/page');

exports.save = function (req, res) {
    'use strict';
	console.log('Save the page : ' + req.body);
	var page = new Page();
	page.save(req.body, function (err, newBankAccount) {
		if (err) {
			console.log(new Error('Page not saved ' + err));
			res.jsonp({msg: 'pageNotSaved', type: 'error'});
		} else {
			res.jsonp({msg: 'pageSaved', type: 'success'});
		}
		err = null;
		newBankAccount = null;
	});
	page = null;
};

exports.getByTag = function (req, res) {
    'use strict';
	var tag = req.params.tag;
	console.log('Get the page : ' + tag);
	var page = new Page();
	page.getByTag(tag, function (err, thePage) {
		if (err) {
			console.log(new Error('Not able to get page : ' + err));
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(thePage);
		}
		err = null;
		thePage = null;
	});
	tag = null;
	page = null;
};

exports.getList = function (req, res) {
    'use strict';
	console.log('Get page list');
	var page = new Page();
	page.getList(function (err, pages) {
		if (err) {
			console.log(new Error('Not able to get page : ' + err));
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(pages);
		}
		err = null;
		pages = null;
	});
	page = null;
};