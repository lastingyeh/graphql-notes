const path = require('path');
const fs = require('fs');

module.exports = {
	customError(message, { data, code }) {
		// const error = new Error('invalid input');
		const error = new Error(message);
		error.data = data;
		error.code = code;

		return error;
	},
	clearImage(filePath) {
		fs.unlink(path.join(__dirname, '..', filePath), err => console.log(err));
	},
};
