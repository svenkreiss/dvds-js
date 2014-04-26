if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}

define('dvds', ['crypto-js.SHA3'], function(CryptoJS) {
	/*
	 * Dependency: CryptoJS for SHA3 (using SHA3 instead of SHA1 because it is used in uncentral).
	 */



	dvds = {};


	/* ---------- objects for version control ----------- */

	dvds.CommitTree = function() {
		/*
		 * Holds and structures the data.
		 */
	}


	dvds.Commit = function(parents,data) {
		/*
		 * Only knows the previous commit and the data. For a full
		 * implementation like in git, data is an instance of a Tree object.
		 */

		this.parents = parents;
		this.data = JSON.parse(JSON.stringify(data));
		this.dataHash = CryptoJS.SHA3( JSON.stringify(data) ).toString();
		this.date = new Date();

		this.generateId = function(includeId) {
			var toSerialize = [this.data,this.date];
			if (includeId == true) toSerialize.unshift(this.id);

			if (this.parents) {
				this.parents.map( function(p) {
					toSerialize.push(p.generateId(true));
				});
			}
			return CryptoJS.SHA3( JSON.stringify(toSerialize) ).toString().substr(0,40);
		}

		this.id = this.generateId();




		this.parentIds = function() {
			/* ids of immediate parents */
			if (this.parents) {
				return this.parents.map( function(p) {return p.id;} );
			}
			return ['0'];
		};

		this.idsRecursive = function() {
			var ids = [this.id];
			if (this.parents) {
				this.parents.map( function(p) { ids = ids.concat( p.idsRecursive() ); } );
			}
			return ids;
		};

		this.searchId = function(ids) {
			if (ids.indexOf(this.id) >= 0) return this;
			if (!this.parents) return null;

			for (p in parents) {
				var r = parents[p].searchId(ids);
				if (r) return r; // found!
			}
			return null;  // not found in this subtree
		};


		this.clone = function() {
			var out = new dvds.Commit(this.parents,this.data);
			out.date = this.date;
			out.id = this.id;
			return out;
		};

		this.validateId = function() {
			return (this.id == this.generateId());
		};


		function mapElements(A,Ancestor) {
			// create a map of  ancestorElement --> AElement
			var mapA = [];
			for (i in Ancestor) {
				mapA.push( A.indexOf(Ancestor[i]) );
			}
			for (i in mapA) {
				if (i==0) continue;
				if (mapA[i-1] > mapA[i]) {
					mapA[i] = A.indexOf(Ancestor[i],i-1);
				}
			}
			return mapA;
		}

		function mergeArrays(A,B,Ancestor) {
			var out = [];

			var mapA = mapElements(A,Ancestor);
			var mapB = mapElements(B,Ancestor);

			console.log(mapA);
			console.log(mapB);

			for (i in Ancestor) {
				if ( mapA[i] == mapB[i]  &&  mapA[i] >= 0) {
					// no change
					out.push( Ancestor[i] );
				} else if (mapA[i] == i  &&  mapB[i] == -1) {
					// A is unchanged, but B is modified
					if (i < B.length) out.push( B[i] );
				} else if (mapB[i] == i  &&  mapA[i] == -1) {
					// B is unchanged, but A is modified
					if (i < A.length) out.push( A[i] );
				} else if (mapA[i] == -1  &&  mapB[i] == -1) {
					// A and B modified, use A
					out.push( mergeData(A[i],B[i],Ancestor[i]) );
				}
			}

			return out;
		}

		function mergeDictionaries(A,B,Ancestor) {
			var out = {};

			for (i in Ancestor) {
				if (A[i] == B[i]  &&  A[i] == Ancestor[i]) {
					// no change
					out[i] = Ancestor[i];
				} else if (A[i] == Ancestor[i]  &&  B[i] != Ancestor[i]) {
					// A is unchanged, but B is modified
					out[i] = B[i];
				} else if (B[i] == Ancestor[i]  &&  A[i] != Ancestor[i]) {
					// B is unchanged, but A is modified
					out[i] = A[i];
				} else if (A[i] != Ancestor[i]  &&  B[i] != Ancestor[i]) {
					// A and B modified: check whether it is an Array
					// or object. If not, use A (if it exists).
					out[i] = mergeData(A[i],B[i],Ancestor[i]);
				}
			}

			return out;
		}

		function mergeData(A,B,Ancestor) {
			var mergedData = A;
			if (Array.isArray(A) && Array.isArray(B) && Array.isArray(Ancestor)) {
				console.log("merging arrays");
				mergedData = mergeArrays(A,B,Ancestor);
				console.log(mergedData);
			} else if (typeof(A) == 'object' && typeof(B) == 'object' && typeof(Ancestor) == 'object') {
				console.log("merging a dictionary")
				mergedData = mergeDictionaries(A,B,Ancestor);
				console.log(mergedData)
			}
			return mergedData;
		}

		// -------- merge functions --------

		this.recursiveThreeWayMerge = function(other) {

			// find ancestors (each branch might have a different common ancestor)
			var otherIds = other.idsRecursive();
			var thisIds  = this.idsRecursive();
			console.log(thisIds);
			console.log(otherIds);

			var ancestorFromOther = other.searchId(thisIds);
			var ancestorFromThis = this.searchId(otherIds);

			var commonAncestor = ancestorFromThis ? ancestorFromThis : ancestorFromOther;
			if (ancestorFromThis  &&  ancestorFromOther) {
				console.log('Found ancestors in both branches.');
				// detect whether ancestors are different
				if (ancestorFromThis.id != ancestorFromOther.id) {
					console.log( 'crap. need to create a virtual common ancestor before merge.' );
					// need to create a virtual ancestor --> recurse
					commonAncestor = ancestorFromThis.recursiveThreeWayMerge(ancestorFromOther);
				} else {
					console.log('great. common ancestor found.');
				}
				// the actual merge
				var mergedData = mergeData(this.data,other.data,commonAncestor.data);
				var mergedCommit = new dvds.Commit([this,other],mergedData);
				console.log("mergedCommit");
				console.log(mergedCommit.parentIds().join(','));
				return mergedCommit;

			} else {
				console.log('ERROR: Did not find ancestors in both branches.');
				console.log('Abort merge.');
				console.log(ancestorFromOther);
				console.log(ancestorFromThis);
				return;
			}
		};

	};

	dvds.Commit.parseJSON = function(json) {
		/* Builds a commit object from JSON but keeps the parents
		 * identified by ids only. Restoring those to full objects
		 * has to be done manually. If invoked from form
		 * Repository.parseJSON(), this is handled there.
		 */

		var parentIds = null;
		if (json.parents) {
			parentIds = json.parents.map(function(p) { return p.id; });
		}
		var newCommit = new dvds.Commit(parentIds, json.data);

		newCommit.dataHash = json.dataHash;

		newCommit.date = json.date;

		newCommit.id = json.id;

		return newCommit;
	};




	/* ---------- data structures ----------- */



	dvds.Repository = function(data) {
		/*
		 * The structure is a little bit based on the git internals:
		 *    http://git-scm.com/book/en/Git-Internals-Git-Objects
		 *
		 * this.data ... uncommitted actual content
		 * this.commits ... list of commits
		 * this.currentCommit ... head of commits
		 */

		this.data = data;
		this.commits = [];
		this.currentCommit = null;

		this.commitById = function(id) {
			// search through this.commits for id and return that object
			for (c in this.commits) {
				if (this.commits[c].id == id) return this.commits[c];
			}
		};

		this.commitConnectionsToString = function() {
			var serialized = [];
			for (c in this.commits) {
				var parentIds = this.commits[c].parentIds().map(
					function(id) { return id.substr(0,7); }
				).join(',');
				serialized.push( parentIds+' <-- '+this.commits[c].id.substr(0,7) );
			}
			return serialized.join(' ... ');
		};

		this.commit = function() {
			if (this.currentCommit && !this.currentCommit.validateId()) return;

			var parents = this.currentCommit ? [this.currentCommit] : null;
			commit = new dvds.Commit(parents, this.data);
			if (this.currentCommit  &&  commit.dataHash == this.currentCommit.dataHash) {
				console.log( 'No change. Skipping.' );
				return;
			}
			this.commits.push( commit );
			this.currentCommit = commit;
		};

		this.toString = function() {
			if (!this.currentCommit) { return this.data+' -- no commits'; }
			return this.data+' -- committed: '+this.currentCommit.id+': '+this.currentCommit.data.toString();
		};



		// -------- fork --------

		this.fork = function() {
			this.commit();
			if (!this.currentCommit.validateId()) return;

			var out = new dvds.Repository( JSON.parse(JSON.stringify(this.data)) );
			out.commits = this.commits.map( function(c) { return c.clone(); });
			out.currentCommit = out.commits[ out.commits.length-1 ];
			return out;
		}



		// -------- merge functions --------

		this.merge = function(other) {
			this.commit();
			other.commit();

			if (!this.currentCommit.validateId()) return;
			if (!other.currentCommit.validateId()) return;

			var mergedCommit = this.currentCommit.recursiveThreeWayMerge(other.currentCommit);
			this.currentCommit = mergedCommit;
			this.commits.push(mergedCommit);
			this.data = mergedCommit.data;

			// Add new commits to the list of commits to import the other branch as well.
			// TODO This needs to be optimized to find the proper subgraph.
			var listOfCommitIds = this.commits.map( function(i) { return i.id; } );
			for (c in other.commits) {
				if (listOfCommitIds.indexOf(other.commits[c].id) < 0) {
					this.commits.push(other.commits[c]);
				}
			}

			console.log('merge done');
			console.log(this.commitConnectionsToString());
			return mergedCommit;
		};
	};

	dvds.Repository.parseJSON = function(json) {
		var newRepo = new dvds.Repository(json.data);

		json.commits.map(function(c) {
			newRepo.commits.push(dvds.Commit.parseJSON(c));
		});

		if (json.currentCommit) {
			newRepo.currentCommit = newRepo.commitById(json.currentCommit.id);
		}

		// reconnect parent ids in commits to full objects
		for (c in newRepo.commits) {
			var parents = newRepo.commits[c].parents;
			if (parents) {
				parents.map( function(p) {
					return newRepo.commitById(p);
				});
			}
		}

		// if there is a currentCommit, check whether it is valid
		if (newRepo.currentCommit && !newRepo.currentCommit.validateId()) {
			return;
		}

		return newRepo;
	};


	return dvds;
});
