/**
 * Created by FDD on 2017/5/24.
 */
$(function () {
  function a () {
    $("#city_index li").removeClass("c00");
    $("#city_name li").removeClass("c00")
  }

  $("#other_city").on("click", function () {
    $(this).toggleClass("on");
    var d = $("#other_city > span");
    if ($(this).hasClass("on")) {
      $("#cities").show()
    } else {
      $("#cities").hide()
    }
    a();
    var e = d.css("background");
    if (String(e).indexOf("526") != -1) {
      d.css("background-position", "0px -550px")
    } else {
      d.css("background-position", "0px -526px")
    }
  });
  function c (d) {
    $.when(lazyGetTemplate("city")).done(function () {
      var m = $.templates.city.render(d);
      $("#city_name").html(m + '<li class="clearBoth" style="list-style:none;"></li>');
      var e = new Array();
      var p = $("#city_name li");
      for (var j = 0, n = p.size(); j < n; j++) {
        var k = p.get(j);
        var q = $(k).data("name");
        e.push(q)
      }
      var h = $("#city_index li");
      for (var j = 0, n = h.length; j < n; j++) {
        var o = h.eq(j);
        var g = o.html().toLowerCase();
        if (g != "") {
          for (var l = 0, f = e.length; l < f; l++) {
            if (String(e[l]).indexOf(g) == 0 && String(e[l]) != "undefined") {
              o.addClass("on_mouseover")
            }
          }
        }
      }
      $("#city_index").on("mouseover", "li", function () {
        var v = $(this).html().toLowerCase();
        var u = new Array();
        var x = $("#city_name li");
        for (var t = 0, r = x.size(); t < r; t++) {
          var s = x.get(t);
          var w = $(s).data("name");
          u.push(w)
        }
        for (var t = 0, r = u.length; t < r; t++) {
          if (String(u[t]).indexOf(v) == 0) {
            $("#city_name li:eq(" + t + ")").addClass("on")
          } else {
            $("#city_name li:eq(" + t + ")").removeClass("on")
          }
        }
      }).on("mouseout", "li", function () {
        $("#city_name li").removeClass("on")
      }).on("click", "li", function () {
        $(this).addClass("c00").siblings().removeClass("c00");
        var v = $(this).html().toLowerCase();
        var u = new Array();
        var x = $("#city_name li");
        for (var t = 0, r = x.size(); t < r; t++) {
          var s = x.get(t);
          var w = $(s).data("name");
          u.push(w)
        }
        for (var t = 0, r = u.length; t < r; t++) {
          if (String(u[t]).indexOf(v) == 0) {
            $("#city_name li:eq(" + t + ")").addClass("c00")
          } else {
            $("#city_name li:eq(" + t + ")").removeClass("c00")
          }
        }
      })
    })
  }

  function b (d) {
    var e = {};
    e.cities = d;
    c(e)
  }

  $.AmapUtil.initCity(b);
  $("#download_menu").click(function (d) {
    d.stopPropagation()
  });
  $("body").on("click", function () {
    $("#other_city").removeClass("on");
    $("#cities").hide();
    $("#other_city span").css("background-position", "0px -526px");
    a()
  });
  $("#other_city,#cities").on("click", function (d) {
    d.stopPropagation()
  });
  (function () {
    var d = $("#footer");
    var f = $(window);

    function e () {
      var h = f.scrollTop();
      var g = f.height();
      var i = d.offset().top;
      if (h + g > i) {
        d.addClass("show")
      } else {
        if (h + g < i + 200) {
          d.removeClass("show")
        }
      }
    }

    e();
    $(window).on("scroll", function (g) {
      e()
    })
  })()
});
Date.prototype.format = function (a) {
  var c = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    S: this.getMilliseconds()
  };
  if (/(y+)/.test(a)) {
    a = a.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
  }
  for (var b in c) {
    if (new RegExp("(" + b + ")").test(a)) {
      a = a.replace(RegExp.$1, (RegExp.$1.length == 1) ? (c[b]) : (("00" + c[b]).substr(("" + c[b]).length)))
    }
  }
  return a
};
var getQueryParam = function (a) {
  var b = new RegExp("(^|&)" + a + "=([^&]*)(&|$)", "i");
  var c = window.location.search.substr(1).match(b);
  if (c != null) {
    return unescape(c[2])
  }
  return null
};
function uuid () {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (d) {
    var b = Math.random() * 16 | 0, a = d == "x" ? b : (b & 3 | 8);
    return a.toString(16)
  })
}
function colorFromIdx (a) {
  if (a >= 4) {
    return "#8e0e0b"
  } else {
    if (a >= 2) {
      return "#df0100"
    } else {
      if (a >= 1.5) {
        return "#fecb00"
      } else {
        return "#34b000"
      }
    }
  }
}
function getColorFromIdx (b, a) {
  if (!b || !a) {
    console.error("参数异常")
  }
  if (b != "road" && b != "area") {
    console.error("参数异常")
  }
  if (b == "road") {
    return colorFromIdx(a)
  } else {
    if (b == "area") {
      if (a >= 2.2) {
        return "#8e0e0b"
      } else {
        if (a >= 1.8) {
          return "#df0100"
        } else {
          if (a >= 1.5) {
            return "#fecb00"
          } else {
            return "#34b000"
          }
        }
      }
    }
  }
}
function getColorFromLevel (a) {
  if (idx == 4) {
    return "#8e0e0b"
  } else {
    if (idx == 3) {
      return "#df0100"
    } else {
      if (idx == 2) {
        return "#fecb00"
      } else {
        return "#34b000"
      }
    }
  }
}
function getLevelFromIdx (b, a) {
  if (!b || !a) {
    console.error("参数异常")
  }
  if (b != "road" && b != "area") {
    console.error("参数异常")
  }
  if (b == "road") {
    if (a >= 4) {
      return 4
    } else {
      if (a >= 2) {
        return 3
      } else {
        if (a >= 1.5) {
          return 2
        } else {
          return 1
        }
      }
    }
  } else {
    if (b == "area") {
      if (a >= 2.2) {
        return 4
      } else {
        if (a >= 1.8) {
          return 3
        } else {
          if (a >= 1.5) {
            return 2
          } else {
            return 1
          }
        }
      }
    }
  }
}
function imgFromIdx (a) {
  if (a >= 4) {
    return "road_arrow_deepRed.png"
  } else {
    if (a >= 2) {
      return "road_arrow_red.png"
    } else {
      if (a >= 1.5) {
        return "road_arrow_yellow.png"
      } else {
        return "road_arrow_green.png"
      }
    }
  }
}
function getAngle (c) {
  var f = c[0];
  var b = c[c.length - 1];
  var a = b.lon - f.lon;
  var e = b.lat - f.lat;
  var d = 0;
  if (a != 0) {
    d = Math.atan(e / a) * 180 / Math.PI;
    if (a > 0 && e > 0) {
      d = d
    } else {
      if (a > 0 && e <= 0) {
        d = d
      } else {
        if (a < 0 && e >= 0) {
          d = d + 180
        } else {
          if (a < 0 && e < 0) {
            d = d + 180
          }
        }
      }
    }
  } else {
    if (e > 0) {
      d = 90
    } else {
      d = 270
    }
  }
  return 90 - d
}
function cutStr (g, b) {
  var a = "", h = g.length, f = g.replace(/[^\x00-\xff]/g, "**").length;
  if (f <= b) {
    return g
  }
  for (var d = 0, c = 0; d < h; d++) {
    var e = g.charAt(d);
    if (/[\x00-\xff]/.test(e)) {
      c++
    } else {
      c += 2
    }
    if (c <= b) {
      a += e
    } else {
      return a
    }
  }
};