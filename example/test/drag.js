// bind method to canvas's prototype to drow rounded rectangle
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  // x: 起点X坐标， y: 起点Y坐标  w: 宽度， h: 高度： r: 圆角弧度，
  if (w < 2 * r) {r = w / 2;}
  if (h < 2 * r){ r = h / 2;}
  this.beginPath();
  this.moveTo(x+r, y);
  this.arcTo(x+w, y, x+w, y+h, r);
  this.arcTo(x+w, y+h, x, y+h, r);
  this.arcTo(x, y+h, x, y, r);
  this.arcTo(x, y, x+w, y, r);
  this.closePath();
  return this;
}
// constractor for drag
function Drag (params) {
  var D = this;
  this.drag = params.drag;

  // Maximum distance of drag, If exceeds, it will be divorced from origin point
  // 拖拽的最大距离， 超出这断开粘性连接
  this.max = params.max || 70;
  this.texts = this.drag.innerHTML;

  // why use div#body Instead of <body> ?
  // because that we can prevent touchMove/mouseMove when it is <body>, so we do it;
  // 绑定touchmove事件在 div#body 上 而不是在 <body> 上， 因为 <body> 上的滑动无法被阻止。
  this.domBody = document.getElementById('body');

  this.device = /android|iphone|ipad|ipod|webos|iemobile|opear mini|linux/i.test(navigator.userAgent.toLowerCase());

  this.eventName = {
    start: this.device ? 'touchstart' : 'mousedown',
    move: this.device ? 'touchmove' : 'mousemove',
    end: this.device ? 'touchend' : 'mouseup',
  }

  this.onDragStart = function () {
    this.drag.style.visibility = 'hidden'
  }
  this.draged = false;
  this.onDragEnd = function (d) {
    if(!d) {
      D.drag.style.visibility = 'visible'
    }
  }
  // Predefined Event, do it at the right time
  this.onBeforeDelate = function () {}
  this.onDelated = function () {}
  this._r = D.drag.offsetWidth / 2;
  this.point = {
    r: D._r,
    x: D.offset(D.drag).left + D._r,
    y: D.offset(D.drag).top + D._r,
    w: D.drag.offsetWidth,
    h: D.drag.offsetHeight
  }
  this.current = {
    x: 0,
    y: 0,
    r: D.point.r,
    direction: 0,
    canDelate: false,
    fillColor: 'red',
    coefficient: 0.3
  }
  this.fullCanvas = {
    canvas: '',
    ctx: '',
    width: document.documentElement.clientWidth || document.documentElement.clientWidth,
    height: document.documentElement.clientHeight || document.documentElement.clientHeight,
    id: ''
  }

  this.startEvent = function (){
    var e = event;
    D.point.x = D.offset(D.drag).left + D._r;
    D.point.y = D.offset(D.drag).top + D._r ;
    console.log(D.offset(D.drag).top)
    var width = D.fullCanvas.width;
    var height = D.fullCanvas.height;
    var cssObj = {
      'position': 'fixed',
      'left': '0',
      'top': '0',
      'zIndex': '99'
    }
    var convasObj = D.createCanvas(width, height, cssObj);
    D.domBody.appendChild(convasObj.canvas)
    D.fullCanvas.canvas = document.getElementById(convasObj.id);
    D.fullCanvas.ctx = D.fullCanvas.canvas.getContext('2d');
    if(D.device) {
      D.domBody.addEventListener(D.eventName.move, D.moveEvent)
      D.drag.addEventListener(D.eventName.end, D.endEvent)
    } else {
      D.fullCanvas.canvas.addEventListener(D.eventName.move, D.moveEvent)
      D.fullCanvas.canvas.addEventListener(D.eventName.end, D.endEvent)
    }
  }
  this.moveEvent = function () {
    var e = event;
    e.preventDefault();
    D.current.x = D.device ? e.touches[0].clientX : e.clientX;
    D.current.y = D.device ? e.touches[0].clientY : e.clientY;
    D.currentDirection = D.drawCercle(D.fullCanvas.ctx, D.fullCanvas.width, D.fullCanvas.height, D.current.fillColor, D.point.x, D.point.y, D.point.r, D.current.x, D.current.y, D.current.r, D.max)
    if(!D.draged) {
      D.draged = true;
      D.onDragStart(D.drag)
    }
  }
  this.endEvent = function (e) {
    console.log(e.target)
    if(D.device) {
      D.drag.removeEventListener(D.eventName.move, D.moveEvent);
      D.domBody.removeEventListener(D.eventName.move, D.moveEvent)
    } else {
      D.fullCanvas.canvas.removeEventListener(D.eventName.move, D.moveEvent);
    }
    D.draged = false;
    if(D.currentDirection > D.max) {
      isDelate = true;
      D.current.canDelate = false;
      D.disappear({
        x: D.current.x,
        y: D.current.y,
        r: D.current.r
      });
      D.domBody.removeChild(D.fullCanvas.canvas);
    } else {
      D.bounce(D.fullCanvas.ctx, D.fullCanvas.width, D.fullCanvas.height, D.current.fillColor, D.point.x, D.point.y, D.point.r, D.current.x, D.current.y, D.current.r, D.max)
    }
  }

  this.drag.addEventListener(D.eventName.start, D.startEvent)

}
Drag.prototype = {
  offset: function (el) {
    var rect, win,elem = el;
    var rect = elem.getBoundingClientRect();
    var win = elem.ownerDocument.defaultView;
    return {
      top: rect.top + win.pageYOffset,
      left: rect.left + win.pageXOffset
    };
  },
  tween: {
    /*
     * t: current time（当前时间）；
     * b: beginning value（初始值）；
     * c: change in value（变化量）；
     * d: duration（持续时间）。
    */
    easeOut: function(t, b, c, d) {
      return -c *(t /= d)*(t-2) + b;
    }
  },
  getPoints: function (startX, startY, startR, endX, endY, endR, maxDirection) {
    var D = this;
    // query the distance between two circles
    // 计算两圆距离
    var currentDirection = Math.sqrt( (endX-startX) * (endX-startX)  + (endY -startY) * (endY -startY) )
    // query the radius of the initial circle
    // 计算起始圆 半径
    var m = (maxDirection - currentDirection) /  maxDirection;

    var startR = startR * 0.3 + startR * 0.7 * (m > 0 ? m : 0);
    // query the initial circle tangent coordinates
    // 计算起始圆切点坐标
    var filletB = (endX - startX) / currentDirection ;
    var filletA = (endY - startY) / currentDirection;


    var startPoint = {
      center: {
        x: startX,
        y: startY,
        r: startR
      },
      a: {
        x: startX + filletA * startR,
        y: startY - filletB * startR
      },
      b: {
        x: startX - filletA * startR,
        y: startY + filletB * startR
      }
    }
    // query the end of circular tangent coordinates
    // 计算结束圆切点坐标

    var endPoint = {
      center: {
        x: endX,
        y: endY,
        r: endR
      },
      a: {
        x: endX + filletA * endR,
        y: endY - filletB * endR
      },
      b: {
        x: endX - filletA * endR,
        y: endY + filletB * endR
      }
    }
    if(Math.abs(currentDirection) > D.max) {
      D.current.canDelate = true;
    }
    if(D.current.canDelate) {
      startPoint = endPoint;
    }

    var ctrolPoint = {
      x: startX + (endX-startX)*0.5,
      y: startY + (endY-startY)*0.5,
    }

    return {
      startPoint: startPoint,
      endPoint: endPoint,
      ctrolPoint: ctrolPoint,
      currentDirection: currentDirection
    }
  } ,
  drawCercle: function (ctx, ctxWidth, ctxHeight, fillColor,startX, startY, startR, endX, endY, endR, maxDirection) {
    // param:  ctx, ctxWidth, ctxHeight, fillColor,startX, startY, startR, endX, endY, endR, maxDirection
    var D = this;
    var points = D.getPoints(startX, startY, startR, endX, endY, endR, maxDirection);
    var startPoint = points.startPoint;
    var endPoint = points.endPoint;

    var ctrolPoint = points.ctrolPoint;
    // drow the first cercle
    // 画起始圆
    ctx.clearRect(0,0, ctxWidth, ctxHeight);
    ctx.fillStyle = D.current.fillColor;
    ctx.beginPath();
    ctx.arc(startPoint.center.x,startPoint.center.y,startPoint.center.r,0 , 2*Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.closePath();
    // drow the last cercle
    // 画结束圆
    ctx.beginPath();
    ctx.arc(endPoint.center.x,endPoint.center.y,endPoint.center.r,0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.closePath();
    // draw bezier to show sticty drag
    // 画贝塞尔曲线填充
    ctx.beginPath();
    ctx.moveTo(startPoint.a.x, startPoint.a.y);
    ctx.quadraticCurveTo(ctrolPoint.x, ctrolPoint.y, endPoint.a.x, endPoint.a.y);
    ctx.lineTo(endPoint.b.x, endPoint.b.y);
    ctx.quadraticCurveTo(ctrolPoint.x, ctrolPoint.y, startPoint.b.x, startPoint.b.y);
    ctx.lineTo(startPoint.a.x, startPoint.a.y);
    ctx.closePath();
    ctx.fill();
    // draw text , the params need queryed from dom we draging.
    // 画文字
    ctx.save()
    ctx.textBaseline = 'middle';
    ctx.font="20px Arial";
    ctx.fillStyle = '#FFF';
    ctx.textAlign='center'
    ctx.fillText(D.texts,endPoint.center.x, endPoint.center.y,D.point.w);
    ctx.restore()

    return points.currentDirection
  },

  bounce: function (ctx, ctxWidth, ctxHeight, fillColor,startX, startY, startR, endX, endY, endR, maxDirection) {
    var D = this;

    var p = [{},{ // end
      x: endX,
      y: endY
    },{ // bef
      x:  startX - (endX - startX)/2,
      y:  startY - (endY - startY)/2
    },{ // start
      x: startX,
      y: startY
    },
    ]
    var i = 0

    if(!D.current.canDelate) {
      var timer = setInterval(function (){
        i++
        D.drawCercle(ctx, ctxWidth, ctxHeight, fillColor,startX, startY, startR, p[i].x, p[i].y, endR, maxDirection);
        if(i>= p.length-1) {
          clearInterval(timer)
          D.current.canDelate = false
          D.domBody.removeChild(D.fullCanvas.canvas)
          D.onDragEnd(false)
        }
      },80)
    } else {
      D.drawCercle(ctx, ctxWidth, ctxHeight, fillColor,startX, startY, startR, p[p.length-1].x, p[p.length-1].y, endR, maxDirection);
      D.domBody.removeChild(D.fullCanvas.canvas)
      D.current.canDelate = false
      D.onDragEnd(false)
    }
  },
  createCanvas: function (width, height, cssObj) {
    console.log('createCanvas')
    var id = 'canvas' + Math.round(Math.random() * 100000);
    var canvas = document.createElement('canvas');
    canvas.setAttribute('id', id);
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    for(var item in cssObj) {
      canvas.style[item] = cssObj[item];
    }
    return {canvas: canvas, id: id};
  },
  disappear: function (pos) {
    // pos = {x: x, y: y}
    // 消失点的坐标
    var D = this;
    D.onDragEnd(true)
    var screenWidth = document.documentElement.clientWidth || document.body.clientWidth;
    var timer = null;
    var width, height, i, PI = Math.PI;
    width = height = D.current.r * 5;

    var cssObj = {
      'position': 'fixed',
      'left': pos.x - width / 2 + 'px',
      'top': pos.y - height / 2 + 'px'
    }
    var canvasObj = this.createCanvas(width, height, cssObj);
    console.log(canvasObj)
    document.getElementsByTagName('body')[0].appendChild(canvasObj.canvas)
    var canvas = document.getElementById(canvasObj.id);
    var ctx = canvas.getContext('2d');
    var dots = [];
    var dotsLength = Math.round(Math.random() * 3 + 5);
    var currentStep = 0 ,allSteps = 20;
    for (i = 0 ; i < dotsLength; i ++) {
      var r, x, y, a;
      r = D.current.r;
      x = Math.round(Math.random() * (width - r * 2)) + r;
      y = Math.round(Math.random() * (height - r * 2)) + r;
      a = r / allSteps;
      var o = {
        r: r,
        x: x,
        y: y,
        a: a
      }
      dots.push(o);
    }

    function disappear(currentStep ,allSteps) {
      ctx.clearRect(0, 0, width,height);
//						ctx.fillStyle = D.current.fillColor;
      ctx.fillStyle = '#D4D4D4';

      for(i = 0; i < dots.length; i ++)  {
        ctx.beginPath();
        ctx.arc(
          D.tween.easeOut(currentStep, width/2, dots[i].x - width/2, allSteps),
          D.tween.easeOut(currentStep, height/2, dots[i].y - height/2, allSteps),
          D.tween.easeOut(currentStep, dots[i].r, -dots[i].r , allSteps),
          0, 2*PI);
        ctx.closePath();
        ctx.fill();
      }
    }
    disappear(currentStep ,allSteps)
    timer = setInterval(function (){
      currentStep ++ ;
      disappear(currentStep ,allSteps)
      if(currentStep >= allSteps) {
        clearInterval(timer)
        console.log(canvas)
        document.getElementsByTagName('body')[0].removeChild(canvas)
        D.onDelated()
      }
    }, 40)
  }
}



function MoveDrag (params) {
  // params = {
  //	doms: '.drag',  // 元素类名
  //	max: 70, // px
  // fillColor: '' // 'red'
  // }
  var M = this;
  this.defaults = {
    doms: '',
    max: 70,
    fillcolor: ''
  }
  this.defaults = Object.assign(this.defaults, params)

  var d = this.defaults.doms;

  if(typeof(d) == 'string') {
    if(/^\./.test(d)) {
      // query by className
      // 类名
      this.defaults.doms = document.getElementsByClassName(d.replace(/^\./,''));
    } else if (/^#/.test(d)){
      //query by id
      // id名
      var _dm = document.getElementById(d)
      if(_dm) {
        this.defaults.doms = [document.getElementById(d.replace(/^#/,''))];
      } else {
        this.defaults.doms = [];
      }
    } else {
      this.defaults.doms = document.getElementsByTagName(d);
    }
  } else {
    // nothing needs to do
  }
  var obj = [];

  for (var i = 0; i < this.defaults.doms.length; i ++) {
    var o = new Drag({
      drag: M.defaults.doms[i],
      max: M.defaults.max,
      fillColor: M.defaults.fillColor
    })
    obj.push(o)
  }
  return obj;
}
