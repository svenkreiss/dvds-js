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

		var toSerialize = [this.dataHash,this.date];
		if (this.parents) parents.map( function(p) { toSerialize.push(p.id); } );
		this.id = CryptoJS.SHA3( JSON.stringify(toSerialize) ).toString().substr(0,40);

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
					out.push( A[i] );
				}
			}

			return out;
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
				var mergedData = this.data; // TODO
				if (Array.isArray(this.data)) {
					console.log("merging arrays");
					mergedData = mergeArrays(this.data,other.data,commonAncestor.data);
					console.log(mergedData);
				}
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





	/* ---------- data structures ----------- */



	dvds.Array = function(data) {
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

		this.objectGraph= function() {
			/*
			 * Take the list of commits that contain references to the parent
			 * and build a left-child-right-sibling tree from it.
			 */
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

		this.visualizeInD3 = function(width,height) {
			var adjList = this.commits.map(
				function(c) {
					return [c.id, c.parentIds()];
				}
			);

			if (!width) width = 600;
			if (!height) height = 400;

			var force = d3.layout.force()
				.size([width, height])
				.linkDistance(50)
				.charge(-400)
				.on("tick", tick);

			var nodes = force.nodes(),
			    links = force.links(),
			    node,
			    link;


			// nodes
			var currentCommitId = this.currentCommit.id;
			adjList.map( function(a) {
				if (a[0] == currentCommitId) {
					nodes.push( {id:a[0], x:9*width/10, y:height/10, fixed:true} );
				} else {
					nodes.push( {id:a[0], x:width/2, y:height/2} );
				}
			});
			nodes.push( {id:'0', x:width/10, y:height/10, fixed:true} ); // add root node

			// links
			function nodeFromId(id) {
				for (n in nodes) {
					if (nodes[n].id == id) return nodes[n];
				}
			}
			adjList.map( function(a) {
				a[1].map( function(p) {
					links.push( {source:nodeFromId(a[0]),target:nodeFromId(p)} );
				});
			});
			console.log(nodes);
			console.log(links);




			function tick() {
				// node.attr("cx", function(d) { return d.x; })
				//     .attr("cy", function(d) { return d.y; });
				node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

				link.attr("x1", function(d) { return d.source.x; })
				    .attr("y1", function(d) { return d.source.y; })
				    .attr("x2", function(d) { return d.target.x; })
				    .attr("y2", function(d) { return d.target.y; });
			}


			return function(selection) {
				node = selection.selectAll(".node");
				link = selection.selectAll(".link");

				node = node.data(nodes);
				var g = node.enter().append("g").attr("class", "node");
				g.append("circle")
					.attr("r", 5);
					//.call(force.drag);
				g.append("text")
					.attr('x', 0)
					.attr('y', 20)
					.text( function(d) { return d && d.id ? d.id.substr(0,7) : 'undefined'; } );


				link = link.data(links);
				link.enter().append("line") //.insert("line", ".node")
				  .attr("class", "link");

				console.log("starting");
				force.start();
			};
		};

		this.commit = function() {
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

			var out = new dvds.Array( JSON.parse(JSON.stringify(this.data)) );
			out.commits = this.commits.map( function(c) { return c.clone(); });
			out.currentCommit = out.commits[ out.commits.length-1 ];
			return out;
		}



		// -------- merge functions --------

		this.merge = function(other) {
			this.commit();
			other.commit();

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

	return dvds;
});
