'use strict';
var url = require('url');

module.exports = function (input, length) {
	if (typeof input !== 'string') {
		throw new TypeError('Expected input to be a string');
	}

	if (typeof length !== 'number') {
		throw new TypeError('Expected length to be a number');
	}

	if (input.length <= length) {
		return input;
	}

	var TRUNCATE_SYMBOL_LENGTH = 2;
	var parsed = url.parse(input);
	var remainingLength = length - (input.length - parsed.path.length) - TRUNCATE_SYMBOL_LENGTH;
	var pathParts = parsed.path.split('/');
	var pathPartsRet = [];
	var i = pathParts.length;

	while (i--) {
		var x = pathParts[i];
		if (remainingLength < x.length + 1) {
			pathPartsRet.push('…');
			break;
		}

		pathPartsRet.push(x);
		remainingLength -= x.length + 1;
	}

	parsed.pathname = pathPartsRet.reverse().join('/');

	return url.format(parsed);
};
