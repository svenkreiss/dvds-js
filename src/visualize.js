if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}

define('dvds.visualize', ['dvds'], function(dvds) {

	dvds.visualize = {};

	dvds.visualize.CommitGraph = function(selection) {
		/* 
		 * Visualizes the commit graph of a repository using the 
		 * force layout of d3.js.
		 */

		var width = selection.attr('width');
		var height = selection.attr('height');
		if (!width) width = 600;
		if (!height) height = 400;

		var force = d3.layout.force()
			.size([width, height])
			.linkDistance(50)
			.charge(-400)
			.on("tick", tick);


		var nodes = function(repo, adjList) {
			nodes = force.nodes();

			var currentCommitId = repo.currentCommit.id;
			adjList.map( function(a) {
				if (a[0] == currentCommitId) {
					nodes.push( {id:a[0], x:9*width/10, y:height/2, fixed:true} );
				} else {
					nodes.push( {id:a[0], x:width/2, y:height/10} );
				}
			});
			nodes.push( {id:'0', x:width/10, y:height/2, fixed:true} ); // add root node

			return nodes;
		};

		var links = function(repo, adjList, nodes) {
			links = force.links();

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

			return links;
		};



		var node, link;

		function tick() {
			node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

			link.attr("x1", function(d) { return d.source.x; })
			    .attr("y1", function(d) { return d.source.y; })
			    .attr("x2", function(d) { return d.target.x; })
			    .attr("y2", function(d) { return d.target.y; });
		}


		return function(repo) {
			var adjList = repo.commits.map(
				function(c) {
					return [c.id, c.parentIds()];
				}
			);

			nodes = nodes(repo, adjList);
			links = links(repo, adjList, nodes);
			console.log(nodes);
			console.log(links);


			node = selection.selectAll(".node");
			link = selection.selectAll(".link");

			node = node.data(nodes);
			var g = node.enter().append("g")
				.attr("class", "node")
				.call(force.drag);
			g.append("circle")
				.attr("r", 5);
			g.append("text")
				.attr('x', 0)
				.attr('y', 20)
				.text( function(d) { return d && d.id ? d.id.substr(0,7) : 'undefined'; } );


			link = link.data(links);
			link.enter().append("line")
				.attr("class", "link");

			console.log("starting");
			force.start();
		};
	};

	return dvds.visualize;
});
