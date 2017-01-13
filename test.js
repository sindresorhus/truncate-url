import test from 'ava';
import m from './';

test('truncate url', t => {
	t.is(m('http://sindresorhus.com/foo/bar/baz/faz', 30), 'http://sindresorhus.com/…/faz');
	t.is(m('http://example.com/a/cool/page/that-is-really-deeply/nested/', 40), 'http://example.com/…/nested/');
	t.is(m('http://example.com/a/b/c/d', 24).length, 24);
	t.is(m('http://example.com/a/b/c', 24), 'http://example.com/a/b/c');
	t.is(m('http://example.com/a/b/cd', 24), 'http://example.com/…/cd');
});

test('passes corner case', t => {
	const result = m('http://example.com/a/b/cd', 24);
	t.true(result.length <= 24, `${result} is > 24`);
});
