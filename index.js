export default function truncateUrl(urlString, maxLength) {
	if (typeof urlString !== 'string') {
		throw new TypeError('Expected input to be a string');
	}

	if (!(typeof maxLength === 'number' && Number.isFinite(maxLength) && maxLength >= 0)) {
		throw new TypeError('Expected length to be a finite non-negative number');
	}

	// Parse URL first to validate it
	const parsed = new URL(urlString);

	if (urlString.length <= maxLength) {
		return urlString;
	}

	const ellipsis = '…';

	// Get the base URL without pathname, including auth if present
	let base = parsed.origin;
	if (parsed.username || parsed.password) {
		const auth = parsed.username + (parsed.password ? ':' + parsed.password : '');
		base = `${parsed.protocol}//${auth}@${parsed.host}`;
	}

	const queryAndHash = parsed.search + parsed.hash;

	// Split pathname into segments (excluding empty first element from leading /)
	const pathSegments = parsed.pathname.split('/').slice(1);

	// If no path segments beyond root, return base + query/hash
	if (pathSegments.length === 0) {
		const minimalUrl = base + queryAndHash;
		if (minimalUrl.length <= maxLength) {
			return minimalUrl;
		}

		// Base + query/hash too long, truncate aggressively
		if (maxLength <= ellipsis.length) {
			return ellipsis.slice(0, maxLength);
		}

		return urlString.slice(0, maxLength - ellipsis.length) + ellipsis;
	}

	// Try to build URL with as many trailing segments as possible
	// Start with the full path and work backwards
	for (let numberSegments = pathSegments.length; numberSegments >= 1; numberSegments--) {
		const segments = pathSegments.slice(-numberSegments);
		const testUrl = numberSegments === pathSegments.length
			? base + '/' + segments.join('/') + queryAndHash
			: base + '/' + ellipsis + '/' + segments.join('/') + queryAndHash;

		if (testUrl.length <= maxLength) {
			return testUrl;
		}
	}

	// No segments fit with query/hash, try just ellipsis + query/hash
	const minimalWithQueryHash = base + '/' + ellipsis + queryAndHash;
	if (minimalWithQueryHash.length <= maxLength) {
		return minimalWithQueryHash;
	}

	// Can't fit query/hash, try just ellipsis
	const justBaseAndEllipsis = base + '/' + ellipsis;
	if (justBaseAndEllipsis.length <= maxLength) {
		return justBaseAndEllipsis;
	}

	// Last resort: truncate everything
	if (maxLength <= ellipsis.length) {
		return ellipsis.slice(0, maxLength);
	}

	return urlString.slice(0, maxLength - ellipsis.length) + ellipsis;
}
