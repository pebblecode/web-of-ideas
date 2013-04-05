/*global $:true, console:true, window: true, Pusher:true*/
(function (){
  'use strict';

  var App = {
    userEl: $("#user"),
    historyEl: $("#history")
  }

  // Enable pusher logging - don't include this in production
  Pusher.log = function(message) {
    if (window.console && window.console.log) window.console.log(message);
  };

  var pusher = new Pusher('48376e31f1c1d5d2e85c');
  var channel = pusher.subscribe('ideas');
  channel.bind('idea', function(data) {
    console.log(data);
    var userHtml = "<span class='user'>" + data.user + "</span>",
      message = "<p class='" + data.side + "'>" + data.thought + userHtml + "</p>";
    App.historyEl.append(message);
  });

  function getSide() {
    var activeSide = $("#side .active").first(),
      side = activeSide.attr("data-side");
    return side;
  }

  function sendThought(thought) {
    var url = "/api/thought",
      user = App.userEl.val(),
      side = getSide();
    var thoughtData = {
      user: user,
      thought: thought,
      side: side
    };

    $.post(url, thoughtData)
      .success(function(response) {
        console.log(response);
      })
      .error(function(data) {
        console.log(data);
      });
  }

  // Pressing enter submits form
  $("#thought").keypress(function (e) {
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

  // Random user name
  var randomNumber = Math.floor(Math.random() * 10000) + 1,
    randomUserName = "user" + randomNumber;
  App.userEl.val(randomUserName);
})();