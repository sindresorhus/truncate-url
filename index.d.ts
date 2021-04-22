/**
Truncate a URL to a specific length.

@param url - The URL to be truncated.
@param maxLength - The maximum length of the truncated URL.
@returns The truncated URL.

@example
```
import truncateUrl from 'truncate-url';

truncateUrl('https://sindresorhus.com/foo/bar/baz/faz', 30);
//=> 'https://sindresorhus.com/…/faz'
```
*/
export default function truncateUrl(url: string, maxLength: number): string;
