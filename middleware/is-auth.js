const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	const authHeader = req.get('Authorization');

	req.isAuth = false;

	if (!authHeader) {
		return next();
	}
	const token = authHeader.split(' ')[1];
	let decodedToken;

	try {
		decodedToken = jwt.verify(token, 'somesupersecretsecret');
	} catch (err) {
		return next();
	}

	if (!decodedToken) {
		return next();
	}

	req.userId = decodedToken.userId;
	req.isAuth = true;

	next();
};
