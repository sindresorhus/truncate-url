import test from 'ava';
import truncateUrl from './index.js';

test('truncate url', t => {
	t.is(truncateUrl('http://sindresorhus.com/foo/bar/baz/faz', 30), 'http://sindresorhus.com/…/faz');
	t.is(truncateUrl('http://example.com/a/cool/page/that-is-really-deeply/nested/', 40), 'http://example.com/…/nested/');
	t.is(truncateUrl('http://example.com/a/b/c/d', 24).length, 24);
	t.is(truncateUrl('http://example.com/a/b/c', 24), 'http://example.com/a/b/c');
	t.is(truncateUrl('http://example.com/a/b/cd', 24), 'http://example.com/…/cd');
});

test('passes corner case', t => {
	const result = truncateUrl('http://example.com/a/b/cd', 24);
	t.true(result.length <= 24, `${result} is > 24`);
});

test('uses WHATWG URL API internally', t => {
	// Test that the function works with various URL formats
	const result1 = truncateUrl('https://example.com/very/long/path/here', 30);
	t.is(result1, 'https://example.com/…/here');

	// Test with query parameters
	const result2 = truncateUrl('https://example.com/very/long/path?query=value', 35);
	t.true(result2.includes('…'));
	t.true(result2.includes('?query=value'));

	// Test with hash
	const result3 = truncateUrl('https://example.com/very/long/path#section', 35);
	t.true(result3.includes('…'));
	t.true(result3.includes('#section'));
});

test('handles URLs with special characters', t => {
	// Test with spaces (already encoded)
	const urlWithSpaces = 'https://example.com/path%20with%20spaces/file.html';
	const truncatedSpaces = truncateUrl(urlWithSpaces, 35);
	t.true(truncatedSpaces.includes('…'));

	// Test with Unicode characters
	const urlWithUnicode = 'https://example.com/path/文件.html';
	const truncatedUnicode = truncateUrl(urlWithUnicode, 50);
	// WHATWG URL properly encodes Unicode, so result may be longer than input
	// but should still include ellipsis for truncation or be unchanged if short enough
	t.true(truncatedUnicode.includes('…') || truncatedUnicode === urlWithUnicode);
});

test('handles URLs with authentication', t => {
	const urlWithAuth = 'https://user:pass@example.com/very/long/path/here';
	const truncated = truncateUrl(urlWithAuth, 40);
	t.true(truncated.includes('user:pass@'));
	t.true(truncated.includes('…'));
	t.true(truncated.length <= 40);
});

test('handles URLs with ports', t => {
	const urlWithPort = 'https://example.com:8080/very/long/path/here';
	const truncated = truncateUrl(urlWithPort, 35);
	t.true(truncated.includes(':8080'));
	t.true(truncated.includes('…'));
	t.true(truncated.length <= 35);
});

test('throws on invalid input', t => {
	t.throws(() => truncateUrl(null, 10), {instanceOf: TypeError});
	t.throws(() => truncateUrl(123, 10), {instanceOf: TypeError});
	t.throws(() => truncateUrl('http://example.com', '10'), {instanceOf: TypeError});
	t.throws(() => truncateUrl('http://example.com', null), {instanceOf: TypeError});

	// Test non-finite numbers
	t.throws(() => truncateUrl('http://example.com', Number.NaN), {instanceOf: TypeError});
	t.throws(() => truncateUrl('http://example.com', Infinity), {instanceOf: TypeError});
	t.throws(() => truncateUrl('http://example.com', -Infinity), {instanceOf: TypeError});
});

test('throws on invalid URLs', t => {
	t.throws(() => truncateUrl('not-a-url', 10), {instanceOf: TypeError});
	t.throws(() => truncateUrl('://missing-protocol', 10), {instanceOf: TypeError});
	t.throws(() => truncateUrl('http://', 10), {instanceOf: TypeError});
});

test('handles edge cases correctly', t => {
	// URL exactly at max length
	t.is(truncateUrl('http://example.com/path', 24), 'http://example.com/path');

	// URL with trailing slash
	t.is(truncateUrl('http://example.com/a/b/c/', 24), 'http://example.com/…/c/');

	// Very short max length - URL must have a path separator, so minimum is base + "/…"
	const veryShort = truncateUrl('https://example.com/very/long/path', 21);
	t.true(veryShort.length <= 21);
	t.true(veryShort.includes('…'));

	// Root path only
	t.is(truncateUrl('https://example.com/', 20), 'https://example.com/');
});

test('handles critical edge cases with length constraints', t => {
	// URLs with query parameters exceeding maxLength
	const result1 = truncateUrl('https://example.com/path?query=value', 25);
	t.true(result1.length <= 25);
	t.true(result1.includes('…'));

	// URLs with hash fragments exceeding maxLength
	const result2 = truncateUrl('https://example.com/path#section', 25);
	t.true(result2.length <= 25);
	t.true(result2.includes('…'));

	// URLs with both query and hash exceeding maxLength
	const result3 = truncateUrl('https://example.com/very/long/path?query=value#section', 30);
	t.true(result3.length <= 30);
	t.true(result3.includes('…'));

	// Base domain exceeds maxLength
	const result4 = truncateUrl('https://very-long-domain-name.example.com/path', 15);
	t.true(result4.length <= 15);
	t.true(result4.includes('…'));
});

test('handles extreme maxLength values', t => {
	const url = 'https://example.com/path';

	// MaxLength = 0
	const result0 = truncateUrl(url, 0);
	t.is(result0.length, 0);
	t.is(result0, '');

	// MaxLength = 1 (exactly ellipsis length)
	const result1 = truncateUrl(url, 1);
	t.is(result1.length, 1);
	t.is(result1, '…');

	// MaxLength = 2
	const result2 = truncateUrl(url, 2);
	t.true(result2.length <= 2);

	// Negative maxLength should throw
	t.throws(() => truncateUrl(url, -1), {instanceOf: TypeError});
});

test('preserves length contract in all scenarios', t => {
	const testCases = [
		{url: 'https://example.com/path?query=value', maxLength: 30},
		{url: 'https://example.com/very/long/path?query=value#section', maxLength: 40},
		{url: 'https://user:pass@example.com/path', maxLength: 25},
		{url: 'https://example.com:8080/path', maxLength: 20},
		{url: 'https://example.com/path%20with%20spaces', maxLength: 35},
	];

	for (const testCase of testCases) {
		const result = truncateUrl(testCase.url, testCase.maxLength);
		t.true(
			result.length <= testCase.maxLength,
			`Result "${result}" (${result.length} chars) exceeds maxLength ${testCase.maxLength} for URL "${testCase.url}"`,
		);
	}
});
