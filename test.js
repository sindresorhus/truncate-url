'use strict';
var test = require('ava');
var fn = require('./');

test(function (t) {
	t.is(fn('http://sindresorhus.com/foo/bar/baz/faz', 30), 'http://sindresorhus.com/…/faz');
	t.is(fn('http://example.com/a/cool/page/that-is-really-deeply/nested/', 40), 'http://example.com/…/nested/');
	t.is(fn('http://example.com/a/b/c/d', 24).length, 24);
	t.is(fn('http://example.com/a/b/c', 24), 'http://example.com/a/b/c');
	t.end();
});
