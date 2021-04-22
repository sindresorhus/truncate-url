import {expectType} from 'tsd';
import truncateUrl from '.';

expectType<string>(truncateUrl('https://sindresorhus.com/foo/bar/baz/faz', 30));
