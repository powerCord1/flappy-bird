var currentstate, loopGameloop, loopPipeloop, debugmode = !1, states = Object.freeze({
  SplashScreen: 0,
  GameScreen: 1,
  ScoreScreen: 2
}), gravity = .25, velocity = 0, position = 180, rotation = 0, jump = -4.6, flyArea = 420, score = 0, highscore = 0, pipeheight = 90, pipewidth = 52, pipes = [], replayclickable = !1, volume = 30, soundJump = new buzz.sound("assets/sounds/sfx_wing.ogg"), soundScore = new buzz.sound("assets/sounds/sfx_point.ogg"), soundHit = new buzz.sound("assets/sounds/sfx_hit.ogg"), soundDie = new buzz.sound("assets/sounds/sfx_die.ogg"), soundSwoosh = new buzz.sound("assets/sounds/sfx_swooshing.ogg");
buzz.all().setVolume(volume);
var debugmode = true;
var debugOver;
var canDie = true;
var hackMsgShows = true;

function initDebug() {
  var paused = false;
  hackMsgShows = false;
  
  setInterval(function() {
    $("#debughighscore").html("Highscore: " + localStorage.getItem("highscore"));
  }, 300);
  $("#debugcontainer").removeAttr("hidden");

  $("#debugoptions").on("mouseover", function() {
    if (loopGameloop != null && currentstate == states.GameScreen) {
      debugOver = true;
      debug_pause();
      $("#debugoptions").css('opacity', 0.8);
    }
  })
  $("#debugoptions").on("mouseleave", function() {
    if ($("#gameState").html() != "Resume" && currentstate == states.GameScreen) {
      debugOver = false;
      debug_resume();
      $("#debugoptions").css('opacity', 0.5);
    }
  })

  $("#debugMode").on("click", function() {
    if (!$("#debugMode").is(":checked")) {
      debugmode = false;
      $("#debugcontainer").hide();
      $(".boundingbox").hide();
    }
  });

  $("#canDie").on("change", function() {
    canDie = !($("#canDie").is(":checked"))
  });

  $("#hackMsg").on("change", function() {
    hackMsgShows = $("#hackMsg").is(":checked");
  })

  $("#gameState").on("click", function() {
    if (!paused) {
      paused = true;
      debug_pause();
      $("#gameState").html("Resume");
    } else if (paused) {
      paused = false;
      debug_resume();
      $("#gameState").html("Freeze Game");
    }
  });

  $("#customScore").on("change", function() {
    if (currentstate == states.GameScreen) {
      score = parseInt($("#customScore").val());
      setBigScore();
    } else {
      score = parseInt($("#customScore").val());
    }
  });
}

function debug_pause() {
  $(".animated").css("animation-play-state", "paused"),
    $(".animated").css("-webkit-animation-play-state", "paused");
  clearInterval(loopGameloop),
    clearInterval(loopPipeloop),
    loopGameloop = null,
    loopPipeloop = null
}

function debug_resume() {
  $(".animated").css("animation-play-state", "running"),
    $(".animated").css("-webkit-animation-play-state", "running");
  if (loopGameloop == null) {
    loopGameloop = setInterval(gameloop, 1e3 / 60),
      loopPipeloop = setInterval(updatePipes, 1400)
  }
}

function showSplash() {
  currentstate = states.SplashScreen,
    velocity = 0,
    position = 180,
    rotation = 0,
    score = 0,
    $("#player").css({
      y: 0,
      x: 0
    }),
    updatePlayer($("#player")),
    soundSwoosh.stop(),
    soundSwoosh.play(),
    $(".pipe").remove(),
    pipes = [],
    $(".animated").css("animation-play-state", "running"),
    $(".animated").css("-webkit-animation-play-state", "running"),
    $("#splash").transition({
      opacity: 1
    }, 2e3, "ease")
}
function startGame() {
  console.log("startgame"),
    currentstate = states.GameScreen,
    $("#splash").stop(),
    $("#splash").transition({
      opacity: 0
    }, 300, "ease"),
    setBigScore(),
    debugmode && $(".boundingbox").show(),
    loopGameloop = setInterval(gameloop, 1e3 / 60),
    loopPipeloop = setInterval(updatePipes, 1400),
    playerJump()
}
function updatePlayer(e) {
  rotation = Math.min(velocity / 10 * 90, 90),
    $(e).css({
      rotate: rotation,
      top: position
    })
}
function gameloop() {
  var e = $("#player");
  velocity += gravity,
    position += velocity,
    updatePlayer(e);
  var t = document.getElementById("player").getBoundingClientRect()
    , o = 34 - 8 * Math.sin(Math.abs(rotation) / 90)
    , s = (24 + t.height) / 2
    , n = (t.width - o) / 2 + t.left
    , i = (t.height - s) / 2 + t.top;
  if (debugmode) {
    var a = $("#playerbox");
    a.css("left", n),
      a.css("top", i),
      a.css("height", s),
      a.css("width", o),
      $('#playertop').html("Top: " + Math.floor(i)),
      $('#playerleft').html("left: " + Math.floor(n)),
      $('#playerwidth').html("width: " + Math.floor(o)),
      $('#playerheight').html("height: " + Math.floor(s))
  }
  if (t.bottom >= $("#land").offset().top) {
    playerDead();
    return
  }
  var r = $("#ceiling");
  if (i <= r.offset().top + r.height() && (position = 0),
    null != pipes[0]) {
    var p = pipes[0].children(".pipe_upper")
      , c = p.offset().top + p.height()
      , l = p.offset().left - 2
      , u = c + pipeheight;
    if (debugmode) {
      var a = $("#pipebox");
      a.css("left", l),
        a.css("top", c),
        a.css("height", pipeheight),
        a.css("width", pipewidth)
    }
    if (n + o > l) {
      if (i > c && i + s < u)
        ;
      else {
        playerDead();
        return
      }
    }
    n > l + pipewidth && (pipes.splice(0, 1),
      playerScore())
  }
}
function screenClick() {
  if (!debugOver) {
    currentstate == states.GameScreen ? playerJump() : currentstate == states.SplashScreen && startGame()
  }
}
function playerJump() {
  velocity = jump,
    soundJump.stop(),
    soundJump.play()
}
function setBigScore(e) {
  var t = $("#bigscore");
  if (score >= 999999 || isNaN(score)) {
    if (hackMsgShows) {
      t.append("<center><p>no why u hack my game</p><img src='assets/nan.webp' style='position: fixed; top: 50px; width: 300px;'></center>")
    }
  } else {
    if (t.empty(), !e) {
      for (var o = score.toString().split(""), s = 0; s < o.length; s++) {
        t.append("<img src='assets/font_big_" + o[s] + ".png' alt='" + o[s] + "'>")
      }
    }
  }
}
function setSmallScore() {
  var e = $("#currentscore");
  e.empty();
  for (var t = score.toString().split(""), o = 0; o < t.length; o++)
    e.append("<img src='assets/font_small_" + t[o] + ".png' alt='" + t[o] + "'>")
}
function setHighScore() {
  var e = $("#highscore");
  e.empty();
  for (var t = highscore, o = 0; o < t.length; o++)
    e.append("<img src='assets/font_small_" + t[o] + ".png' alt='" + t[o] + "'>")
}
function setMedal() {
  var e = $("#medal");
  return e.empty(),
    !(score < 10) && (score >= 10 && (medal = "bronze"),
      score >= 20 && (medal = "silver"),
      score >= 30 && (medal = "gold"),
      score >= 40 && (medal = "platinum"),
      e.append('<img src="assets/medal_' + medal + '.png" alt="' + medal + '">'),
      !0)
}
function playerDead() {
  if (!canDie) {
    return false;
  } else {
    $(".animated").css("animation-play-state", "paused"),
      $(".animated").css("-webkit-animation-play-state", "paused");
    var e = $("#player").position().top + $("#player").width();
    $("#player").transition({
      y: Math.max(0, flyArea - e) + "px",
      rotate: 90
    }, 1e3, "easeInOutCubic"),
      currentstate = states.ScoreScreen,
      clearInterval(loopGameloop),
      clearInterval(loopPipeloop),
      loopGameloop = null,
      loopPipeloop = null,
      isIncompatible.any() ? showScore() : soundHit.play().bindOnce("ended", function() {
        soundDie.play().bindOnce("ended", function() {
          showScore()
        })
      })
  }
}
function showScore() {
  $("#scoreboard").css("display", "block"),
    setBigScore(!0);
    if (score > highscore) {
      localStorage.setItem("highscore",  score)
    }
    setSmallScore(),
    setHighScore();
  var e = setMedal();
  soundSwoosh.stop(),
    soundSwoosh.play(),
    $("#scoreboard").css({
      y: "40px",
      opacity: 0
    }),
    $("#replay").css({
      y: "40px",
      opacity: 0
    }),
    $("#scoreboard").transition({
      y: "0px",
      opacity: 1
    }, 300, "ease", function() {
      soundSwoosh.stop(),
        soundSwoosh.play(),
        $("#replay").transition({
          y: "0px",
          opacity: 1
        }, 300, "ease"),
        e && ($("#medal").css({
          scale: 2,
          opacity: 0
        }),
          $("#medal").transition({
            opacity: 1,
            scale: 1
          }, 600, "ease"))
    }),
    replayclickable = !0
}
function playerScore() {
  score += 1,
    soundScore.play(),
    setBigScore()
}
function updatePipes() {
  console.log("create pipe"),
    $(".pipe").filter(function() {
      return $(this).position().left <= 100
    }).remove();
  var e = Math.floor(Math.random() * (flyArea - pipeheight - 160) + 80)
    , t = flyArea - pipeheight - e
    , o = $('<div class="pipe animated"><div class="pipe_upper" style="height: ' + e + 'px;"></div><div class="pipe_lower" style="height: ' + t + 'px;"></div></div>');
  $("#flyarea").append(o),
    pipes.push(o)
}
$(document).ready(function() {
  "?debug" == window.location.search && (debugmode = !0);
  var e = localStorage.getItem("highscore");
  "" != e && (highscore = e),
    showSplash();
}),
  debugmode && initDebug(),
  $(document).keydown(function(e) {
    32 == e.keyCode && (currentstate == states.ScoreScreen ? $("#replay").click() : screenClick())
  }),
  "ontouchstart" in window ? $(document).on("touchstart", screenClick) : $(document).on("mousedown", screenClick),
  $("#replay").click(function() {
    replayclickable && (replayclickable = !1,
      soundSwoosh.stop(),
      soundSwoosh.play(),
      $("#scoreboard").transition({
        y: "-40px",
        opacity: 0
      }, 1e3, "ease", function() {
        $("#scoreboard").css("display", "none"),
          showSplash()
      }))
  });
var isIncompatible = {
  Android: function() {
    return navigator.userAgent.match(/Android/i)
  },
  BlackBerry: function() {
    return navigator.userAgent.match(/BlackBerry/i)
  },
  iOS: function() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i)
  },
  Opera: function() {
    return navigator.userAgent.match(/Opera Mini/i)
  },
  Safari: function() {
    return navigator.userAgent.match(/OS X.*Safari/) && !navigator.userAgent.match(/Chrome/)
  },
  Windows: function() {
    return navigator.userAgent.match(/IEMobile/i)
  },
  any: function() {
    return isIncompatible.Android() || isIncompatible.BlackBerry() || isIncompatible.iOS() || isIncompatible.Opera() || isIncompatible.Safari() || isIncompatible.Windows()
  }
};
let muteSound = localStorage.getItem("mutesound")
  , btnMute = document.getElementById("mute");
function soundSet() {
  let e = localStorage.getItem("mutesound");
  console.log("check:" + e),
    buzz.all().setVolume(30),
    "false" == e ? (buzz.all().setVolume(30),
      console.log("unmuted")) : (buzz.all().setVolume(0),
        console.log("muted"))
}
null == muteSound && localStorage.setItem("mutesound", !1),
  soundSet();
$(window).resize(function() {
  var e = $(window).width();
  console.log(e),
    $(".cover").width((e - 328) / 2)
});
