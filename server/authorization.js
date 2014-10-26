/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('login');
    }
	res.cookie('user', JSON.stringify({
		'id' : req.user.id,
        'email' : req.user.email
	}));
    next();
};
