# Studio Log X

❎ X-out confidential data in log entries of a [Studio Log][1] stream.

## Usage

```js
const logger = require('@studio/log').out(process.stdout);
const logX = require('@studio/log-x');

const log = logger('app');
log.filter(logX('connection.password'));

log.input('db', { connection: { login: 'admin', password: 'secret' } });
```

The above produces this log output:

```json
{"ts":1486630378584,"ns":"app","topic":"input","msg":"db","data":{
  "connection":{"login":"admin","password":"·····"}}}
```

Data objects are copied before modification to make it safe to pass object
references as log data.

## Install

```bash
❯ npm i @studio/log-x
```

## API

- `x(path...)`: Returns a transform stream in object mode that filters the
  properties at the given paths.
- `x(map)`: Maps topic names to filters. The special `*` topic is used if no
  matching topic filter was specified.
- `x.ns(ns, path...)`: Like `x(path...)`, but only for the specified namespace.
- `x.ns(ns, map)`: Like `x(map)`, but only for the specified namespace.
- `x.all(transform...)`: Combine the given x-out transforms.


```js
// x(map)
logX({
  input: ['connection.user', 'connection.password'],
  '*': ['token']
});

// x.ns(ns, path...)
logX.ns('Login', 'request.user', 'request.password');
```

## Supported notations

- `key`: Property access.
- `key.path`: Property path access.
- `items[0]`: Array index access.
- `items[':a']`: Quoted property access.
- `item.*`: All values in object.
- `items[*]`: All entries in array.
- `item.*.key`: Property access in each value of object.
- `items[*].key`: Property access in each entry of array.

## Related modules

- 👻 [Studio Log][1] logs ndjson to an output stream
- 📦 [Studio Changes][2] is used to create the changelog for this module.

## License

MIT

<div align="center">Made with ❤️ on 🌍</div>

[1]: https://github.com/javascript-studio/studio-log
[2]: https://github.com/javascript-studio/studio-changes
