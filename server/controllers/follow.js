
var Follow = require('../objects/follow');

exports.add = function (req, res) {
    "use strict";
	console.log('Route [add] : Follow the ' + req.params.type + ' ' + req.params.id);
	var follow = new Follow();
	follow.setOwnerId(req.user.id);
	follow.setType(req.params.type);
	follow.setTypeId(req.params.id);
	follow.save(function (err, run) {
		if (err) {
			console.log('Follow not created ' + err);
		} else {
			console.log('Follow created');
		}
	});
};

exports.remove = function (req, res) {
    "use strict";
	console.log('Route [remove] : Remove follow for the ' + req.params.type + ' ' + req.params.id);
	var follow = new Follow();
	follow.setOwnerId(req.user.id);
	follow.setType(req.params.type);
	follow.setTypeId(req.params.id);
	follow.remove(function (err) {
		if (err) {
			console.log('Follow not removed ' + err);
		} else {
			console.log('Follow removed');
		}
	});
};

exports.me = function (req, res) {
    "use strict";
	console.log('Route [me] : Get my follow !');
	var follow = new Follow();
	follow.getMyList(req.user.id, function (err, follows) {
		if (err) {
			console.log('Not able to get my follow list : ' + err);
			res.jsonp('{"msg": "ko"}');
		} else {
			res.jsonp(follows);
		}
	});
};

exports.meResume = function (req, res) {
    "use strict";
	console.log('Route [meResume] : Get my follow resume !');
	var follow = new Follow();
	follow.getMyListWithResume(req.user.id, function (err, follows) {
		if (err) {
			console.log('Not able to get my follow list : ' + err);
			res.jsonp('{"msg": "ko"}');
		} else {
			res.jsonp(follows);
		}
	});	
};