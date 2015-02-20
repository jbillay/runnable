/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    'use strict';
    if (!req.isAuthenticated()) {
        return res.send(401, {
			msg: 'notAuthenticated',
			type: 'error'
		});
    }
	res.cookie('user', JSON.stringify({
		id : req.user.id,
        email : req.user.email
	}));
    next();
};

exports.requireAdmin = function(req, res, next) {
    'use strict';
    if (!req.isAuthenticated()) {
        return res.send(401, {
			msg: 'notAuthenticated',
			type: 'error'
		});
    }
    if (req.user.role !== 'admin') {
        return res.send(401, {
			msg: 'notAuthorized',
			type: 'error'
		});
    }
    res.cookie('user', JSON.stringify({
        'id' : req.user.id,
        'email' : req.user.email
    }));
    next();
};
