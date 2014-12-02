/**
 * Created by jeremy on 30/11/14.
 */

'use strict';

var request = require('request');
var cheerio = require('cheerio');

function itra(firstname, lastname, code) {
    'use strict';
    this.urlBase = "http://www.i-tra.org/page/278/";
    this.firstname = firstname;
    this.lastname = lastname.toUpperCase();
    if (code) {
        this.code = code;
    }
}

itra.prototype.getElementsByTagName = function (html, tag) {
    var startTag = "<" + tag + ">",
        endTag = "</" + tag + ">",
        startKey = html.indexOf(startTag) + startTag.length,
        endKey = html.indexOf(endTag) - (endTag.length + 1),
        partial = html.substring(startKey, endKey);
    return partial;
};

itra.prototype.getCode = function (done) {
    var url = this.urlBase + "?nom=" + this.lastname,
        itraObject = this;
    request(url, function (error, response, body) {
        if (error) {
			done(error, null);
		} else {
			var parsedHTML = cheerio.load(itraObject.getElementsByTagName(body, "tbody")),
				matchUser = itraObject.firstname.toUpperCase() + " " + itraObject.lastname.toUpperCase();
			parsedHTML('a').map(function(i, link) {
				link = cheerio(link);
				if (matchUser === link.text().toUpperCase()) {
					done(null, cheerio(link).attr('href'));
				}
			});
		}
    });
};

itra.prototype.getRuns = function (done) {
    var url = this.urlBase + this.code,
        itraObject = this;
    request(url, function (error, response, body) {
        if (error) {
			done(error, null);
		} else {
			var parsedHTML = cheerio.load(body),
				returnHtml = parsedHTML('table[class=palmares]').html();
			done(null, returnHtml);
		}
    });
};

module.exports = itra;