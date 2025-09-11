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
