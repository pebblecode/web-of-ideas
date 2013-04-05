/*global $:true, console:true, window: true, Pusher:true*/
(function (){
  'use strict';

  // Enable pusher logging - don't include this in production
  Pusher.log = function(message) {
    if (window.console && window.console.log) window.console.log(message);
  };

  var pusher = new Pusher('48376e31f1c1d5d2e85c');
  var channel = pusher.subscribe('ideas');
  channel.bind('idea', function(data) {
    var message = "<p>" + data.message + "</p>";
    $("#ideas-tennis").append(message);
  });

  // Pressing enter submits form
  $("#message textarea").keypress(function (e) {
    if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
      var textarea = $(e.target),
          message = textarea.val();

      $("#ideas-tennis").append("<p>" + message + "</p>");
      textarea.val("");
      return false;
    } else {
      return true;
    }
  });
})();