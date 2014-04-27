# dvds-js

> Distributed versioned data structures implemented in JavaScript for browsers and node.js.

[![Build Status](https://travis-ci.org/svenkreiss/dvds-js.png?branch=master)](https://travis-ci.org/svenkreiss/dvds-js)

__It is currently in development without a stable release yet.__

The idea is that you can _fork_ an object (like an array), change the original and the forked object and then _merge_ it in a graceful way. Implementations are inspired by git. Every object should support:

* __commit__: storing the current state of the object
* __fork__: making a deep copy
* __merge__: merges a fork back into the original branch

[A live demo and commit graphs are here in the version 0.1.0 announcement](http://www.svenkreiss.com/blog/dvds-js-v0.1.0/).

## Boilerplate

Running in a browser:
```html
<script src="http://s3.amazonaws.com/flaskApp_static/static/d3/d3.v3.min.js" charset="utf-8"></script>
<script src="http://requirejs.org/docs/release/2.1.2/minified/require.js"></script>
<script>
require.config({
    paths: {
        'crypto-js': 'http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha3',
        'dvds': 'http://svenkreiss.github.io/dvds-js/lib/dvds.min',
        'dvds.visualize': 'http://svenkreiss.github.io/dvds-js/lib/dvds.min',
    },
    shim: {
        'crypto-js': {
            exports: 'CryptoJS'
        }
    }
});

require(['dvds', 'dvds.visualize'], function() {
    // put your code here
});
</script>
```

Running in `node`:
```javascript
require('dvds');

// put your code here
```


## Examples

Below is an example that is also a test case.

```javascript
// fork, modify original branch and merge
var a = new dvds.Array(['test']);
var b = a.fork();
a.data = ['originalModified'];
a.merge(b);
// --> a.data: ['originalModified']

// fork, modify forked branch and merge
var a = new dvds.Array(['test']);
var b = a.fork();
b.data = ['forkedModified'];
a.merge(b);
// --> a.data: ['forkedModified']

// fork, modify both branches and merge (conflict resolution: original)
var a = new dvds.Array(['test']);
var b = a.fork();
a.data = ['originalModified'];
b.data = ['forkedModified'];
a.merge(b);
// --> a.data: ['originalModified']
```
