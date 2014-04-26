define(['dvds'], function(dvds) {

	describe('Commit.merge-simple', function() {
		var a,b;

		beforeEach( function() {
			a = new dvds.Repository(['Paul','Adam']);
			b = a.fork();
		});

		it('merges arrays of equal length', function() {
			a.data[0] = 'Paula';
			b.data[0] = 'Karl';
			b.data[1] = 'Peter';
			a.merge(b);
			expect( a.data[0] ).toBe('Paula');
			expect( a.data[1] ).toBe('Peter');
		});

		it('deleted first element in a', function() {
			a.data = ['Paul'];
			a.merge(b);
			expect( a.data.length ).toBe(1);
			expect( a.data[0] ).toBe('Paul');
		});

		it('deleted first element in b', function() {
			b.data = ['Paul'];
			a.merge(b);
			expect( a.data.length ).toBe(1);
			expect( a.data[0] ).toBe('Paul');
		});
		
		it('deleted second element in a', function() {
			a.data = ['Adam'];
			a.merge(b);
			expect( a.data.length ).toBe(1);
			expect( a.data[0] ).toBe('Adam');
		});

		it('deleted second element in b', function() {
			b.data = ['Adam'];
			a.merge(b);
			expect( a.data.length ).toBe(1);
			expect( a.data[0] ).toBe('Adam');
		});
		
	});


	describe('Commit.merge-advanced', function() {
		var a,b;

		beforeEach( function() {
			a = new dvds.Repository(['this','is','very','boring']);
			b = a.fork();
		});

		it('delete third element in a', function() {
			a.data = ['this','is','boring'];
			a.merge(b);
			expect( a.data.length ).toBe(3);
			expect( a.data[0] ).toBe('this');
			expect( a.data[1] ).toBe('is');
			expect( a.data[2] ).toBe('boring');
		});
		
		it('delete third element in b', function() {
			b.data = ['this','is','boring'];
			a.merge(b);
			expect( a.data.length ).toBe(3);
			expect( a.data[0] ).toBe('this');
			expect( a.data[1] ).toBe('is');
			expect( a.data[2] ).toBe('boring');
		});
		
	});


	describe('Commit.merge-dictionary', function() {
		var a,b;

		beforeEach( function() {
			a = new dvds.Repository({'firstname':'John','lastname':'Doe'});
			b = a.fork();
		});

		it('trivial', function() {
			a.merge(b);
			expect( a.data['firstname'] ).toBe('John');
			expect( a.data['lastname'] ).toBe('Doe');
		});

		it('change entry', function() {
			b.data['firstname'] = 'Peter';
			a.merge(b);
			expect( a.data['firstname'] ).toBe('Peter');
			expect( a.data['lastname'] ).toBe('Doe');
		});

		it('change entries in both repos', function() {
			b.data['firstname'] = 'Peter';
			a.data['firstname'] = 'Daniel';
			a.data['lastname'] = 'Smith';
			a.merge(b);
			expect( a.data['firstname'] ).toBe('Daniel');
			expect( a.data['lastname'] ).toBe('Smith');
		});

	});


	describe('Commit.merge-dictionary-with-array', function() {
		var a,b;

		beforeEach( function() {
			a = new dvds.Repository({'myData':['this','is','very','boring']});
			b = a.fork();
		});

		it('delete third element in a and modify b', function() {
			a.data = {'myData':['this','is','boring']};
			b.data = {'myData':['all','is','interesting']};
			a.merge(b);
			expect( a.data['myData'].length ).toBe(3);
			expect( a.data['myData'][0] ).toBe('all');
			expect( a.data['myData'][1] ).toBe('is');
			expect( a.data['myData'][2] ).toBe('boring');
		});
		
		it('delete third element in b and modify a', function() {
			b.data = {'myData':['all','is','boring']};
			a.data = {'myData':['this','is','interesting']};
			a.merge(b);
			expect( a.data['myData'].length ).toBe(3);
			expect( a.data['myData'][0] ).toBe('all');
			expect( a.data['myData'][1] ).toBe('is');
			expect( a.data['myData'][2] ).toBe('interesting');
		});
		
	});

});