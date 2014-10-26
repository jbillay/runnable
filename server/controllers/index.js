
var fs = require('fs');
var path = require('path');

exports.init = function () {
	"use strict";
	console.log("Init Controllers");
	var controllers = [];
	// loop through all files in current directory ignoring hidden files and this file
	fs.readdirSync(path.join(__dirname))
		.filter(function(file) {
			return (file.indexOf('.') !== 0) && (file !== 'index.js')
	})
	// import controllers files
	.forEach(function(file) {
		var name = file.slice(0,-3);
		console.log('Loading controller ' + name);
		controllers[name] = require('./' + name);
	});
	return controllers;
};