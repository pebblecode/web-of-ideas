/*global $:true, console:true, window: true, Pusher:true*/
(function (){
  'use strict';

  var App = {
    userEl: $("#user"),
    historyEl: $("#history"),
    thoughtFormEl: $("#thought-form"),
    thoughtEl: $("#thought"),
    thoughtSubmitEl: $("#thought-submit"),
    sideButtons: $("#side button"),

    init: function () {
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

        if (data.side != getSide()) {
          console.log(data.side + ", " + getSide());
          onHit();
          App.thoughtFormEl.show();
        }

      });

      // Submit thought on click of button
      App.thoughtSubmitEl.click(function (e) {
        e.preventDefault();
        submitThought();
      });

      // Pressing enter submits form
      App.thoughtEl.keypress(function (e) {
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
          submitThought();
          return false;
        } else {
          return true;
        }
      });

      // Random user name
      var randomNumber = Math.floor(Math.random() * 10000) + 1,
        randomUserName = "user" + randomNumber;
      App.userEl.val(randomUserName);

      // Side button click
      App.sideButtons.click(function (e) {
        var button = $(e.target),
          side = button.attr("data-side");

        handleSideChange(side);
      });

      // Set initial side
      handleSideChange(getSide());

      // Drawing
      initDrawing(1);
    }
  }

  function handleSideChange(side) {
    console.log(side);
  }

  function getSide() {
    var activeSide = $("#side .active").first(),
      side = activeSide.attr("data-side");
    return side;
  }

  function sendThought(thought) {
    if (thought.length > 0) {
      onHit();

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
          var errorText = data.responseText,
            errorData = JSON.parse(errorText);

          console.log(errorData);
          alert(errorData.error);
        });
    }
  }

  function submitThought() {
    var thought = App.thoughtEl.val();

    sendThought(thought);
    App.thoughtEl.val("");
  }

  // Tennis drawing
  var context;
  var x=200;
  var y=150;
  var dx=5;
  var dy=5;
  var i = 1;
  var playerTurn = 1;
  var hit = 0; //legacy
  var snd = new Audio("sounds/tennis_hit.mp3"); // buffers automatically when created

  function initDrawing(player)
  {
    snd.play();
    var textarea = null;
    context= myCanvas.getContext('2d');
    setInterval(function(){
      if(x>150 && x<800){
        draw();
        i++;
      }
      else {

        if (!textarea && playerTurn==player) {
          App.thoughtFormEl.show();
        }
      }
    },10);

    //Time to answer/ask:

  }

  function onHit(){
    snd.play();
    dy=-dy;
    playerTurn = playerTurn % 2 + 1;
    draw();
    i=1;

    App.thoughtFormEl.hide();
  }
  function draw()
  {

    context.clearRect(0,0,960,600);

    //Prep the two text areas for chat bubbles:

    //draw the court
    var court = new Image();

      court.onload = function() {
      context.drawImage(court, 0, 380);
      };
      court.src = 'img/court.png';

    //Draw player 1
    var player1 = new Image();
    //Move the player if the ball is close
    var player1x = x<135+30 ? 35+dx : 0 ;
    var player1y = x<135+80 ? y : 300 ;
      player1.onload = function() {
      context.drawImage(player1, player1x, player1y);
      };
      player1.src = 'img/player-1.png';

    var player2 = new Image();
    //Move the player if the ball is close
    var player2x = x<960-200 ? 960-135 : 960-225+dx ;
    var player2y = x>960-200 ? y : 300 ;
      player2.onload = function() {
      context.drawImage(player2, player2x, player2y);
      };
      player2.src = 'img/player-2.png';

    context.beginPath();

    context.fillStyle="#C6ED2C";
    // Draws a circle of radius 20 at the coordinates 100,100 on the canvas
    context.arc(x,y,30,0,Math.PI*2,true);
    context.closePath();
    context.fill();
    // Boundary Logic
    if( x<125+30 || x>960-30-135) dx=-dx;
    if( y<0+30 || y>500-30) dy=-dy;
    x+=dx;
    if(dy>0) y+=dy*(y*0.0035);
    else y+=dy*(y*0.00485);

  }

  App.init();
})();