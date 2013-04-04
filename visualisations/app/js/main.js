/*global $:true, console:true, d3:true*/
(function (){
  'use strict';

  var w = 500,
    h = 600;

  var cluster = d3.layout.cluster()
      .size([h - 200, w]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.x, d.y]; });

  var vis = d3.select("#web-of-ideas").append("svg:svg")
      .attr("width", w)
      .attr("height", h)
    .append("svg:g")
      .attr("transform", "translate(40, 30)");

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
    var nodes = cluster.nodes(json);

    var link = vis.selectAll("path.link")
        .data(cluster.links(nodes))
      .enter().append("svg:path")
        .attr("class", "link")
        .attr("d", diagonal);

    var node = vis.selectAll("g.node")
        .data(nodes)
      .enter().append("svg:g")
        .attr("class", function (d) {
          return "node " + voteDataClass(d);
        })
        .attr("data-vote", function(d) { return d.vote; })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    var maxViews = 200,
      circleSize = d3.scale.linear()
        .domain([0, maxViews])
        .range([1, 50]);
    node.append("svg:circle")
        .attr("r", function(d) {
          return circleSize(d.views);
        });

    node.append("svg:text")
        .attr("dx", function(d) { return d.children ? -8 : 8; })
        .attr("dy", 3)
        .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
        .text(function(d) { return d.name; });
  });

})();