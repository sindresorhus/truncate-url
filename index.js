'use strict';
const url = require('url');

module.exports = (input, length) => {
	if (typeof input !== 'string') {
		throw new TypeError('Expected input to be a string');
	}

	if (typeof length !== 'number') {
		throw new TypeError('Expected length to be a number');
	}

	if (input.length <= length) {
		return input;
	}

	const TRUNCATE_SYMBOL_LENGTH = 2;
	const parsed = url.parse(input);
	let remainingLength = length - (input.length - parsed.path.length) - TRUNCATE_SYMBOL_LENGTH;
	const pathParts = parsed.path.split('/');
	const pathPartsRet = [];
	let i = pathParts.length;

	while (i--) {
		const x = pathParts[i];

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
