define(['dvds'], function(dvds) {
	describe('Commit.attack-simple', function() {
		var repo;
		var trueCommitId;

		beforeEach(function() {
			repo = new dvds.Repository(['Paul', 'Adam']);
			repo.commit();
			repo.data[0] = 'Peter';
			repo.commit();
			trueCommitId = repo.currentCommit.id;
		});

		it('validateId', function() {
			expect(repo.currentCommit.validateId()).toBe(true);
		});

		it('change original data', function() {
			// change Paul to Paula
			repo.currentCommit.parents[0].data[0] = 'Paula';
			expect(repo.currentCommit.validateId()).toBe(false);
		});

		it('change commit id', function() {
			// change original commit id
			repo.currentCommit.parents[0].id = '1234';
			expect(repo.currentCommit.validateId()).toBe(false);
		});
	});
});