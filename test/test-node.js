require("../");
var assert = require("assert");

describe('dvds', function() {
	var a;

	beforeEach(function(done){
		a = new dvds.Repository(['Paul','Adam']);
		done();
	});

	it('trivial', function() {
		assert.equal(JSON.stringify(a.data), '["Paul","Adam"]');
	});

	it('full test', function() {
		var b = a.fork();
		var bString = JSON.stringify(b);

		// send bString to a different machine and make it a repository again
		var bStreamed = dvds.Repository.parseJSON( JSON.parse(bString) );
		bStreamed.data[0] = 'Karl';
		bStreamed.data[1] = 'Peter';
		// convert to a string again to send back
		var bStreamedString = JSON.stringify(bStreamed);

		// meanwhile on a
		a.data[0] = 'Paula';

		// receive the modified b repository
		var bReceived = dvds.Repository.parseJSON( JSON.parse(bStreamedString) );
		a.merge(bReceived);

		assert.equal(JSON.stringify(a.data), '["Paula","Peter"]');
	});
});
