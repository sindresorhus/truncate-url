import url from 'node:url';

export default function truncateUrl(urlString, length) {
	if (typeof urlString !== 'string') {
		throw new TypeError('Expected input to be a string');
	}

	if (typeof length !== 'number') {
		throw new TypeError('Expected length to be a number');
	}

	if (urlString.length <= length) {
		return urlString;
	}

	const TRUNCATE_SYMBOL_LENGTH = 2;
	const parsed = url.parse(urlString);
	let remainingLength = length - (urlString.length - parsed.path.length) - TRUNCATE_SYMBOL_LENGTH;
	const pathParts = parsed.path.split('/');
	const pathPartsReturnValue = [];
	let index = pathParts.length;

	while (index--) {
		const x = pathParts[index];

		if (remainingLength < x.length + 1) {
			pathPartsReturnValue.push('…');
			break;
		}

		pathPartsReturnValue.push(x);
		remainingLength -= x.length + 1;
	}

	parsed.pathname = pathPartsReturnValue.reverse().join('/');

	return url.format(parsed);
}
