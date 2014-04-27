var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/Spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/src',

    paths: {
        // technically, this is only crypto-js.SHA3 and it could be named
        // just that, but that would confuse node.js
        'crypto-js': '//crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha3',
    },

    shim: {
        'crypto-js': {
            exports: 'CryptoJS'
        }
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});