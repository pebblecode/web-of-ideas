/*global $:true, console:true, d3:true*/
(function (){
  'use strict';

  var m = [20, 10, 20, 10],
      w = 1280 - m[1] - m[3],
      h = 800 - m[0] - m[2],
      i = 0,
      root,
      maxViews = 200; // TODO: Calculate this from json


  var circleSize = d3.scale.linear()
        .domain([0, maxViews])
        .range([10, 50]);


  var tree = d3.layout.tree()
      .size([h, w]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.x, d.y]; });

  var vis = d3.select("#web-of-ideas").append("svg:svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])
    .append("svg:g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

  var voteDataClass = function voteDataClass(d) {
    var voteClass = "";

    if (d.vote > 0) {
      voteClass = "positive";
    } else if (d.vote < 0) {
      voteClass = "negative";
    } else {
      voteClass = "zero";
    }
    return "vote-" + voteClass;
  };

  d3.json("../data/ideas.json", function(json) {
    root = json;
    root.x0 = h / 2;
    root.y0 = 0;

    function toggleAll(d) {
      if (d.children) {
        d.children.forEach(toggleAll);
        toggle(d);
      }
    }

    // Initialize the display to show the children of the root.
    root.children.forEach(toggleAll);

    update(root);
  });

  function update(source) {
    var duration = d3.event && d3.event.altKey ? 5000 : 500;

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse();

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180; });

    // Update the nodes…
    var node = vis.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("svg:g")
        .attr("class", function (d) {
          var hasChildren = d._children ? " has-children" : "";
          return "node " + voteDataClass(d) + hasChildren;
        })
        .attr("transform", function(d) { return "translate(" + source.x0 + "," + source.y0 + ")"; })
        .on("click", function(d) { toggle(d); update(d); });

    nodeEnter.append("svg:circle")
        .attr("r", function(d) {
          return circleSize(d.views);
        });

    nodeEnter.append("foreignObject")
        .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
        .style("fill-opacity", 1e-6)
        .attr("width", 100)
        .attr("height", 200)
        .append("xhtml:body")
          .attr("class", "inner")
          .append("p")
          .text(function(d) { return d.name; });

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    nodeUpdate.select("circle")
        .attr("r", function(d) {
          return circleSize(d.views);
        });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .attr("class", function (d) {
          var hasChildren = d._children ? " has-children" : "";
          return "node " + voteDataClass(d) + hasChildren;
        })
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.x + "," + source.y + ")"; })
        .remove();

    nodeExit.select("circle")
      .attr("r", function(d) {
          return circleSize(d.views);
        });


    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = vis.selectAll("path.link")
        .data(tree.links(nodes), function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("svg:path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        })
      .transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle children.
  function toggle(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
  }

})();