/**
 * Created by FDD on 2017/2/21.
 */
(function (config) {
  var ca = navigator.userAgent.toLowerCase(), e = window, ea = document, na = ea.documentElement;

  function F (a) {
    return -1 !== ca.indexOf(a)
  }

  var oa = /([a-z0-9]*\d+[a-z0-9]*)/;

  function pa () {
    var a = qa;
    if (!a)return null;
    var a = a.toLowerCase(), b = null;
    if (b = a.match(/angle \((.*)\)/)) a = b[1], a = a.replace(/\s*direct3d.*$/, "");
    a = a.replace(/\s*\([^\)]*wddm[^\)]*\)/, "");
    if (0 <= a.indexOf("intel")) {
      b = ["Intel"];
      0 <= a.indexOf("mobile") && b.push("Mobile");
      (0 <= a.indexOf("gma") || 0 <= a.indexOf("graphics media accelerator")) && b.push("GMA");
      if (0 <= a.indexOf("haswell")) b.push("Haswell"); else if (0 <= a.indexOf("ivy")) b.push("HD 4000"); else if (0 <= a.indexOf("sandy")) b.push("HD 3000"); else if (0 <= a.indexOf("ironlake")) b.push("HD");
      else {
        0 <= a.indexOf("hd") && b.push("HD");
        var c = a.match(oa);
        c && b.push(c[1].toUpperCase())
      }
      return b = b.join(" ")
    }
    return 0 <= a.indexOf("nvidia") || 0 <= a.indexOf("quadro") || 0 <= a.indexOf("geforce") || 0 <= a.indexOf("nvs") ? (b = ["nVidia"], 0 <= a.indexOf("geforce") && b.push("geForce"), 0 <= a.indexOf("quadro") && b.push("Quadro"), 0 <= a.indexOf("nvs") && b.push("NVS"), a.match(/\bion\b/) && b.push("ION"), a.match(/gtx\b/) ? b.push("GTX") : a.match(/gts\b/) ? b.push("GTS") : a.match(/gt\b/) ? b.push("GT") : a.match(/gs\b/) ? b.push("GS") : a.match(/ge\b/) ?
                b.push("GE") : a.match(/fx\b/) && b.push("FX"), (c = a.match(oa)) && b.push(c[1].toUpperCase().replace("GS", "")), 0 <= a.indexOf("titan") ? b.push("TITAN") : 0 <= a.indexOf("ti") && b.push("Ti"), b = b.join(" ")) : 0 <= a.indexOf("amd") || 0 <= a.indexOf("ati") || 0 <= a.indexOf("radeon") || 0 <= a.indexOf("firegl") || 0 <= a.indexOf("firepro") ? (b = ["AMD"], 0 <= a.indexOf("mobil") && b.push("Mobility"), c = a.indexOf("radeon"), 0 <= c && b.push("Radeon"), 0 <= a.indexOf("firepro") ? b.push("FirePro") : 0 <= a.indexOf("firegl") && b.push("FireGL"), 0 <= a.indexOf("hd") &&
        b.push("HD"), 0 <= c && (a = a.substring(c)), (c = a.match(oa)) && b.push(c[1].toUpperCase().replace("HD", "")), b = b.join(" ")) : a.substring(0, 100)
  }

  var ua = "microsoft basic render driver;vmware svga 3d;Intel 965GM;Intel B43;Intel G41;Intel G45;Intel G965;Intel GMA 3600;Intel Mobile 4;Intel Mobile 45;Intel Mobile 965".split(";"), va = "ActiveXObject" in e, za = "devicePixelRatio" in e && 1 < e.devicePixelRatio || va && "matchMedia" in e && e.matchMedia("(min-resolution:144dpi)") && e.matchMedia("(min-resolution:144dpi)").matches, Aa = F("windows nt"), Oa = -1 !== ca.search(/windows nt [1-5]\./), Pa = -1 !== ca.search(/windows nt 5\.[12]/), Va = Oa && !Pa, Wa = F("windows phone"), Xa = F("macintosh"),
    hb = F("Mb2345Browser"), ib = F("ipad;") || F("ipad "), jb = ib && za, kb = F("ipod touch;"), xb = F("iphone;") || F("iphone "), yb = xb || ib || kb, Qb = yb && -1 !== ca.search(/ os [456]_/);
  yb && ca.search(/ os [4-8]_/);
  var Rb = yb && -1 !== ca.search(/ os [78]_/);
  yb && F("os 8_");
  var Sb = yb && F("os 10_"), Tb = F("android"), Ub = -1 !== ca.search(/android [123]/), Vb = F("android 4");
  Tb && -1 === ca.search(/android [1-4]/) || ca.search(/android 4.4/);
  var Wb = Tb ? "android" : yb ? "ios" : Aa ? "windows" : Xa ? "mac" : "other", Xb = va && !e.XMLHttpRequest, Yb = va && !ea.querySelector, Zb = va && !ea.addEventListener, $b = va && F("ie 9"), ac = va && F("msie 10"), bc = va && F("rv:11"), tc = F("alipay") || Tb && sc, uc = F("edge"), vc = F("qtweb"), sc = F("ucbrowser"), wc = F("miuibrowser"), xc = F("micromessenger"), yc = F("mqqbrowser"), zc = F("baidubrowser"), chrome = (F("chrome") || F("crios")) && !xc && !zc && !yc && !uc && !wc, Ac = chrome && F("chromium"), Bc = chrome && !Ac && 30 <= parseInt(ca.split("chrome/")[1]), Cc = F("firefox"), Dc = (Xa ||
    yb) && F("safari") && F("version/"), Ec = yb && F("aliapp"), Fc = yb && (!yc && !sc && !xc && !chrome && !Cc && !Dc || Ec), Gc = Tb || yb || Wa || F("mobile") || "undefined" !== typeof orientation, Hc = e.navigator && e.navigator.msPointerEnabled && !!e.navigator.msMaxTouchPoints, Ic = e.navigator && e.navigator.pointerEnabled && !!e.navigator.maxTouchPoints, Jc = Ic || Hc, Kc = "ontouchstart" in ea || Jc, Lc = function () {
    if (!Gc)return e.devicePixelRatio || 1;
    var a = document.getElementsByTagName("meta");
    if (window.parent && window.parent !== window)try {
      if (window.parent.location.origin ==
        window.location.origin) a = window.parent.document.getElementsByTagName("meta"); else return 1
    } catch (b) {
      return 1
    }
    for (var c = a.length - 1; 0 <= c; c--)if ("viewport" === a[c].name) {
      var c = a[c].content, d;
      -1 !== c.indexOf("initial-scale") && (d = parseFloat(c.split("initial-scale=")[1]));
      a = -1 !== c.indexOf("minimum-scale") ? parseFloat(c.split("minimum-scale=")[1]) : 0;
      c = -1 !== c.indexOf("maximum-scale") ? parseFloat(c.split("maximum-scale=")[1]) : Infinity;
      if (d) {
        if (c >= a)return d > c ? c : d < a ? a : d
      } else if (c >= a)return 1 <= a ? 1 : Math.min(c, 1);
      console && console.log && console.log("viewport\u53c2\u6570\u4e0d\u5408\u6cd5");
      return null
    }
  }(), Tc = va && "transition" in na.style, Uc = !!ea.createElementNS && !!ea.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect, Vc = ea.createElement("canvas"), Wc = !(!Vc || !Vc.getContext), Xc = window.URL || window.webkitURL, Yc = !va && !(sc && Tb) && window.Worker && Xc && Xc.createObjectURL && window.Blob, Zc = "", qa = "", $c = {
    alpha: !0,
    antialias: !0,
    depth: !1,
    failIfMajorPerformanceCaveat: !0,
    preserveDrawingBuffer: !1,
    stencil: !1
  }, ad = function () {
    if (!Wc || !Yc || Fc)return !1;
    for (var a = ["webgl", "experimental-webgl", "moz-webgl"], b = null, c = 0; c < a.length; c += 1) {
      try {
        b = Vc.getContext(a[c], $c)
      } catch (d) {
      }
      if (b) {
        if (b.drawingBufferWidth !== Vc.width || b.drawingBufferHeight !== Vc.height)break;
        if (!b.getShaderPrecisionFormat || !b.getParameter || !b.getExtension)break;
        if (23 > b.getShaderPrecisionFormat(35632, 36338).precision || 23 > b.getShaderPrecisionFormat(35633, 36338).precision)break;
        qa = b.getExtension("WEBGL_debug_renderer_info") ? b.getParameter(37446) : null;
        if ((b = pa()) && -1 !== ua.indexOf(b))break;
        Zc = a[c];
        return !0
      }
    }
    return !1
  }(), bd = ad && !Gc && Bc, cd = !Wc || vc || Wa || Gc && Cc || $b || Qb || jb || kb || Ub || F("gt-n710") || Va, dd = !cd && !bd && (Vb || Rb || yb && xc || !Gc), ed = bd ? "vw" : cd ? "d" : dd ? "dv" : "v", fd = F("webkit"), gd = "WebKitCSSMatrix" in e && "m11" in new window.WebKitCSSMatrix, hd = "MozPerspective" in na.style, id = "OTransition" in na.style, jd = Tc || gd || hd || id, kd = void 0 !== config[8] ? config[8] : !0, ld = void 0 !== config[9] ? config[9] : !0, md = !Uc && Gc && Wc, nd = !1;
  try {
    nd = "undefined" !== typeof e.localStorage
  } catch (od) {
  }
  config.j = {
    size: xb ? 100 : Tb ? 200 : 400,
    yt: Xa,
    L5: Aa,
    bJ: yb,
    XX: Sb,
    kf: Tb,
    B2: Ub,
    gI: tc,
    iq: Wb,
    $x: zc,
    H4: yc,
    fL: Dc,
    g1: xc,
    dn: va,
    hg: Xb,
    Tp: Yb,
    T3: $b,
    JX: ac,
    qd: Zb,
    LX: va && !bc,
    zY: hb,
    xt: nd,
    geolocation: Gc || va && !Zb || uc,
    sB: sc,
    chrome: chrome,
    Cy: za && chrome,
    cI: Cc,
    X: Gc,
    s4: Gc && fd,
    CY: Gc && gd,
    r4: Gc && e.opera,
    Mc: za,
    xB: Lc,
    sa: za && (!Gc || !!Lc && 1 <= Lc),
    fd: Kc,
    IY: Hc,
    BK: Ic,
    CK: Jc,
    e1: fd,
    S3: Tc,
    f1: gd,
    m3: hd,
    x4: id,
    vU: jd,
    Ji: Uc,
    rt: Wc,
    pJ: Yc,
    YU: ad,
    fn: bd,
    b1: Zc,
    c1: $c,
    HI: qa,
    u1: !1,
    AW: kd,
    Lg: kd && !cd,
    HU: kd ? ed : "d",
    gn: ld && !!e.WebSocket && !zc,
    v4: md,
    hZ: Wc || md ? "c" : "d"
  };
  var e = window, pd = {
    overlay: ["style"],
    "AMap.IndoorMap": ["AMap.CustomLayer", "cvector"],
    "AMap.MarkerList": ["AMap.TplUtils"]
  }, qd = "http map anip layers overlay0 brender mrender".split(" ");
  config.Vc = "main";
  config.j.fd && (qd += ",touch", config.Vc += "t");
  config.j.X || (qd += ",mouse", config.Vc += "m");
  config.Vc += "c";
  config.j.Lg && (config.Vc += "v", qd += ",vectorlayer,overlay", config.j.Cy && (config.Vc += "dir", qd += ",labelDir"), config.j.fn ? (config.Vc += "w", qd += ",wgl") : (config.Vc += "cg", qd += ",cgl"));
  if (config[7]) {
    for (var rd = [], sd = config[7].split(","), L = 0; L < sd.length; L += 1) {
      var td = sd[L];
      pd[td] && rd.push.apply(rd, pd[td]);
      rd.push(td)
    }
    qd += "," + rd.join(",");
    config.Vc += config[7].replace(",", "").replace(eval("/AMap./gi"), "")
  }
  config.Tm = pd;
  qd += ",sync";
  config.UL = qd.split(",");
  window.AMap = window.AMap || {};
  window.AMap.ai = "1.3.24.1";
  var ud = window.AMap.wB = {}, vd = config[2].split(",")[0], wd = vd + "/theme/v" + config[4] + "/style1.3.24.1.css", xd = document.head || document.getElementsByTagName("head")[0];
  if (xd) {
    var yd = document.createElement("link");
    yd.setAttribute("rel", "stylesheet");
    yd.setAttribute("type", "text/css");
    yd.setAttribute("href", wd);
    xd.insertBefore(yd, xd.firstChild)
  } else document.write("<link rel='stylesheet' href='" + wd + "'/>");
  function zd (a) {
    var b = document, c = b.createElement("script");
    c.charset = "utf-8";
    c.src = a;
    (a = b.body || xd) && a.appendChild(c)
  }

  function Hd () {
    for (var a = vd + "/maps/main?v=" + config[4] + "&key=" + config[0] + "&m=" + config.UL.join(",") + "&vrs=1.3.24.1", b = document.getElementsByTagName("script"), c, d = 0; d < b.length; d += 1)if (0 === b[d].src.indexOf(vd.split(":")[1] + "/maps?")) {
      c = b[d];
      break
    }
    config[5] || c && c.async ? zd(a) : (document.write('<script id="amap_main_js" src=\'' + a + "' type='text/javascript'>\x3c/script>"), setTimeout(function () {
        document.getElementById("amap_main_js") || zd(a)
      }, 1))
  }

  var Id = (new Date).getTime();
  ud.__load__ = function (a) {
    a(config, Id);
    ud.__load__ = null
  };
  try {
    if (window.localStorage) {
      var Jd = window.localStorage["_AMap_" + config.Vc], Kd = !1;
      Jd ? (Jd = JSON.parse(Jd), Jd.version === window.AMap.ai ? (eval(Jd.script), ud.loaded = !0) : Kd = !0) : Kd = !0;
      if (Kd)for (L in window.localStorage)window.localStorage.hasOwnProperty(L) && 0 === L.indexOf("_AMap_") && window.localStorage.removeItem(L)
    }
  } catch (Ld) {
  }
  ud.loaded || (Hd(), config.UL = void 0);
})(["6cb85da518029607d421917b7ddeb94a", [115.423411, 39.442758, 117.514625, 41.060816, 116.405285, 39.904989], "http://webapi.amap.com", 1, "1.3", null, "110000", "", true, true])