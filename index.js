export default function truncateUrl(urlString, maxLength) {
	if (typeof urlString !== 'string') {
		throw new TypeError('Expected input to be a string');
	}

	if (typeof maxLength !== 'number') {
		throw new TypeError('Expected length to be a number');
	}

	// Parse URL first to validate it
	const parsed = new URL(urlString);

	if (urlString.length <= maxLength) {
		return urlString;
	}

	const placeholder = '__ELLIPSIS__';
	const ellipsis = '…';

	const pathParts = parsed.pathname.split('/');

	// Calculate base URL length (everything except pathname)
	const baseLength = urlString.length - parsed.pathname.length;

	// Calculate how much space we have for path segments
	const availablePathLength = maxLength - baseLength - ellipsis.length - 1; // -1 for "/"

	// Build truncated path from the end
	const keptParts = [];
	let pathLength = 0;

	// If we can't fit any path segments, just use ellipsis
	if (availablePathLength < 0) {
		parsed.pathname = '/' + placeholder;
		return parsed.toString().replace(placeholder, ellipsis);
	}

	for (let i = pathParts.length - 1; i >= 0; i--) {
		const part = pathParts[i];
		// Add 1 for the "/" separator before this part (except for empty first part)
		const neededLength = part.length + (i > 0 || part ? 1 : 0);

		if (pathLength + neededLength > availablePathLength) {
			// Can't fit this part, insert placeholder
			keptParts.unshift(placeholder);
			break;
		}

		keptParts.unshift(part);
		pathLength += neededLength;
	}

	parsed.pathname = keptParts.join('/');
	return parsed.toString().replace(placeholder, ellipsis);
}
