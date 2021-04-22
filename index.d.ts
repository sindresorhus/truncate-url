/**
Truncate a URL to a specific length.

@param url - The URL to be shortened.
@param maxLength - The maximum length of the shortened URL.
@returns The shortened URL.

@example
```
import truncateUrl from 'truncate-url';

truncateUrl('https://sindresorhus.com/foo/bar/baz/faz', 30);
//=> 'https://sindresorhus.com/…/faz'
```
	*/
declare function truncateUrl(url: string, maxLength: number): string;

export default truncateUrl;