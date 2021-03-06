define(['dvds'], function(dvds) {

    describe('just checking', function() {

        it('is dvds in scope', function() {
            var e = new dvds.Repository(['test']);
            expect( e.toString() ).toEqual( 'test -- no commits' );
        });

        it('single commit', function() {
            var e = new dvds.Repository(['test']);
            e.commit()
            expect( e.toString() ).toContain( 'test' );
        });

    });


    describe('fork and merge', function() {
        it('just a fork', function() {
            var a = new dvds.Repository(['test']);
            var b = a.fork();
            expect( b.toString() ).toContain( 'test' );
            expect( a.data ).toContain( 'test' );
            expect( b.data ).toContain( 'test' );
        });

        it('fork and merge unmodified', function() {
            var a = new dvds.Repository(['test']);
            var b = a.fork();
            a.merge(b);
            expect( a.toString() ).toContain( 'test' );
        });

        it('fork, modify original branch and merge', function() {
            var a = new dvds.Repository(['test']);
            var b = a.fork();
            a.data = ['originalModified'];
            a.merge(b);
            expect( a.toString() ).toContain( 'originalModified' );
        });

        it('fork, modify forked branch and merge', function() {
            var a = new dvds.Repository(['test']);
            var b = a.fork();
            b.data = ['forkedModified'];
            a.merge(b);
            expect( a.toString() ).toContain( 'forkedModified' );
        });

        it('fork, modify both branches and merge (conflict resolution: original)', function() {
            var a = new dvds.Repository(['test']);
            var b = a.fork();
            a.data = ['originalModified'];
            b.data = ['forkedModified'];
            a.merge(b);
            expect( a.toString() ).toContain( 'originalModified' );
        });

        it('parseJSON()', function() {
            var a = new dvds.Repository(['Paul','Adam']);
            var aStreamed = dvds.Repository.parseJSON( JSON.parse(JSON.stringify(a)) );
            expect( JSON.stringify(a) ).toBe( JSON.stringify(aStreamed) );
        });

        it('parseJSON() with commit', function() {
            var a = new dvds.Repository(['Paul','Adam']);
            a.commit();
            var aStreamed = dvds.Repository.parseJSON( JSON.parse(JSON.stringify(a)) );
            expect( JSON.stringify(a) ).toBe( JSON.stringify(aStreamed) );
        });

        it('demo without streaming', function() {
            var a = new dvds.Repository(['Paul','Adam']);
            var b = a.fork();
            a.data[0] = 'Paula';
            b.data[0] = 'Karl';
            b.data[1] = 'Peter';
            a.merge(b);
            expect( JSON.stringify(a.data) ).toBe( '["Paula","Peter"]' );
        });

        it('demo', function() {
            var a = new dvds.Repository(['Paul','Adam']);
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

            expect( JSON.stringify(a.data) ).toBe( '["Paula","Peter"]' );
        });
    });

});