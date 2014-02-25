# dvds-js

[![Build Status](https://travis-ci.org/svenkreiss/dvds-js.png?branch=master)](https://travis-ci.org/svenkreiss/dvds-js)

Distributed versioned data structures implemented in JavaScript for browsers and node.js.
__It is currently in development without a stable release yet.__

The idea is that you can _fork_ an object (like an array), change the original and the forked object and then _merge_ it in a graceful way. Implementations are inspired by git. Every object should support:

* __commit__: storing the current state of the object
* __fork__: making a deep copy
* __merge__: merges a fork back into the original branch



## Examples

Below are test cases that currently pass.  
(Warning: there is currently no LCS algorithm and arrays of different length can get corrupted in the merge.)

```
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
