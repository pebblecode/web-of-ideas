/*global $:true, console:true, d3:true*/
(function (){
  'use strict';

  // Enable pusher logging - don't include this in production
  Pusher.log = function(message) {
    if (window.console && window.console.log) window.console.log(message);
  };

  var pusher = new Pusher('48376e31f1c1d5d2e85c');
  var channel = pusher.subscribe('ideas');
  channel.bind('idea', function(data) {
    var message = "<p>" + data.message + "</p>"
    $("#ideas-tennis").append(message);
  });

})();