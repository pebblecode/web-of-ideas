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
    var message = "<p>" + data.thought + "</p>";
    $("#ideas-tennis").append(message);
  });

  function sendThought(thought) {
    var url = "http://localhost:4000/api/thought";

    $.post(url, thought)
      .success(function(response) {
        console.log(response);
      })
      .error(function(data) {
        console.log(data);
      });
  }

  // Pressing enter submits form
  $("#message textarea").keypress(function (e) {
    if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
      var textarea = $(e.target),
          thought = textarea.val();

      sendThought(thought);
      textarea.val("");
      return false;
    } else {
      return true;
    }
  });
})();