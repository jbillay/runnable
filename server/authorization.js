/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
	res.cookie('user', JSON.stringify({
		'id' : req.user.id,
        'email' : req.user.email
	}));
    next();
};

exports.requireAdmin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    if (!req.user.isAdmin) {
        return res.redirect('/')
    }
    res.cookie('user', JSON.stringify({
        'id' : req.user.id,
        'email' : req.user.email
    }));
    next();
};