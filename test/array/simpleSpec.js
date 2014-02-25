define(['dvds'], function(dvds) {

    describe('just checking', function() {

        it('is dvds in scope', function() {
            var e = new dvds.Array(['test']);
            expect( e.toString() ).toEqual( 'test -- no commits' );
        });

        it('single commit', function() {
            var e = new dvds.Array(['test']);
            e.commit()
            expect( e.toString() ).toContain( 'test' );
        });

    });


    describe('fork and merge', function() {
        it('just a fork', function() {
            var a = new dvds.Array(['test']);
            var b = a.fork();
            expect( b.toString() ).toContain( 'test' );
            expect( a.data ).toContain( 'test' );
            expect( b.data ).toContain( 'test' );
        });

        it('fork and merge unmodified', function() {
            var a = new dvds.Array(['test']);
            var b = a.fork();
            a.merge(b);
            expect( a.toString() ).toContain( 'test' );
        });

        it('fork, modify original branch and merge', function() {
            var a = new dvds.Array(['test']);
            var b = a.fork();
            a.data = ['originalModified'];
            a.merge(b);
            expect( a.toString() ).toContain( 'originalModified' );
        });

        it('fork, modify forked branch and merge', function() {
            var a = new dvds.Array(['test']);
            var b = a.fork();
            b.data = ['forkedModified'];
            a.merge(b);
            expect( a.toString() ).toContain( 'forkedModified' );
        });

        it('fork, modify both branches and merge (conflict resolution: original)', function() {
            var a = new dvds.Array(['test']);
            var b = a.fork();
            a.data = ['originalModified'];
            b.data = ['forkedModified'];
            a.merge(b);
            expect( a.toString() ).toContain( 'originalModified' );
        });
    });

});