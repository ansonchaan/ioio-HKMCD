import React, {useRef , useEffect} from 'react';

export const random = (min, max) => {
  return (Math.random() *( Math.abs(max - min))) + min;
}

//
//	styling console.log
//
export const print = (state, color, text) =>{
	const msg = (typeof text == 'object')? JSON.stringify(text) : text || '';
	return console.log('%c'+state+'%c %s','color:white;font-family:sans-serif;font-size:10px;font-weight:bold;background:'+color+';padding:4px 6px 3px 5px;border-radius:3px;', '', msg);
}

//
// enlarge font size on large screen
//
export const adjustFontSize = (baseFontRatio = 16 / 1440, fontMultiplier = 0.84375) => {
    const width = window.innerWidth;
    const roundedNumber = Math.round(
      baseFontRatio * width * fontMultiplier
    );

    if (roundedNumber >= 16)
        document.documentElement.style.fontSize = roundedNumber + "px";
    else 
        document.documentElement.style.fontSize = "";
};

//
// get device type
//
export const getDevice = () => {
    try {
      const w = window,
        d = document,
        documentElement = d.documentElement,
        body = d.getElementsByTagName("body")[0];
      let width =
        w.innerWidth || documentElement.clientWidth || body.clientWidth;
      let deviceType = "";

      (function(a) {
        if (
          /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
            a
          ) ||
          /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
            a.substr(0, 4)
          )
        ) {
          if (width > 700) deviceType = "tablet";
          else deviceType = "mobile";
        } else deviceType = "desktop";
      })(navigator.userAgent || navigator.vendor || window.opera);

      return deviceType;
    } catch (e) {
      return "desktop";
    }
}

const isMobile = function() {
  return false;//window.innerWidth <= 1024;
};

const hasClass = function(el, className) {
  if (el.classList) return el.classList.contains(className);
  else
    return !!el.className.match(new RegExp("(\\s|^)" + className + "(\\s|$)"));
};

const addClass = function(el, className) {
  if (el.classList) el.classList.add(className);
  else if (!hasClass(el, className)) el.className += " " + className;
};

const removeClass = function(el, className) {
  const isNodelist =
    typeof el.length != "undefined" && typeof el.item != "undefined";
  if (isNodelist) {
    const els = el;

    for (let i = 0; els[i]; i++) {
      if (els[i].classList) els[i].classList.remove(className);
      else if (hasClass(els[i], className)) {
        let reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
        els[i].className = els[i].className.replace(reg, " ");
      }
    }
  } else {
    if (el.classList) el.classList.remove(className);
    else if (hasClass(el, className)) {
      let reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
      el.className = el.className.replace(reg, " ");
    }
  }
};

//
// Add and Remove Event
//
const addEvent = function(obj, type, callback) {
  if (obj === null || typeof obj === "undefined") return;

  if (obj.addEventListener) obj.addEventListener(type, callback, false);
  else if (obj.attachEvent) obj.attachEvent("on" + type, callback);
  else obj["on" + type] = callback;
};
const removeEvent = function(obj, type, func) {
  if (obj.removeEventListener) obj.removeEventListener(type, func, false);
};

const setTranslate = function(elem, x, y, z) {
  elem.style.webkitTransform = "translate3d(" + x + "," + y + "," + z + ")";
  elem.style.msTransform = "translate3d(" + x + "," + y + "," + z + ")";
  elem.style.transform = "translate3d(" + x + "," + y + "," + z + ")";
};



const FrameImpulse = (function() {
  var vendors = ["webkit", "moz"];

  var r = {};
  var listeners = [],
    numListeners = 0,
    toRemove = [],
    numToRemove;
  var lastTime = 0;

  for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    window.requestAnimationFrame = window[vendors[i] + "RequestAnimationFrame"];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  var run = function(deltaTime) {
    requestAnimationFrame(run);

    if (numListeners === 0) return;

    for (var i = 0; i < numListeners; i++) {
      listeners[i].call(deltaTime);
    }

    if (numToRemove > 0) {
      var indexToRemove = [];
      for (let i = listeners.length - 1; i >= 0; i--) {
        for (var j = 0; j < toRemove.length; j++) {
          if (listeners[i] === toRemove[j]) indexToRemove.push(i);
        }
      }

      for (let i = 0; i < indexToRemove.length; i++) {
        listeners.splice(indexToRemove[i], 1);
      }

      numListeners = listeners.length;
      toRemove = [];
      numToRemove = 0;
    }
  };

  r.on = function(f) {
    document.body.scrollTo(0, 0);
    if (listeners.indexOf(f) > -1) {
      return;
    }
    listeners.push(f);
    numListeners = listeners.length;
    // console.log("FrameImpulse > new listener > total :", numListeners);
  };

  r.off = function(f) {
    //toRemove.push(f);
    //numToRemove = toRemove.length;
    var i = listeners.indexOf(f);
    if (i === -1) return;
    listeners.splice(i, 1);
    numListeners = listeners.length;
    // console.log("FrameImpulse > scheduled removal > total :", numListeners);
  };

  r.getListeners = function() {
    return listeners;
  };

  run();
  return r;
})();


var VirtualScroll = (function(document) {
  var vs = {};

  var numListeners,
    listeners = [],
    initialized = false;

  var touchStartX, touchStartY;

  // [ These settings can be customized with the options() function below ]
  // Mutiply the touch action by two making the scroll a bit faster than finger movement
  var touchMult = 2;
  // Firefox on Windows needs a boost, since scrolling is very slow
  var firefoxMult = 15;
  // How many pixels to move with each key press
  var keyStep = 120;
  // General multiplier for all mousehweel including FF
  var mouseMult = 1;

  var bodyTouchAction;

  // var hasWheelEvent = "onwheel" in document;
  var hasMouseWheelEvent = "onmousewheel" in document;
  var hasTouch = "ontouchstart" in document;
  var hasKeyDown = "onkeydown" in document;

  var hasTouchWin =
    navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 1;
  var hasPointer = !!window.navigator.msPointerEnabled;

  // var isFirefox = navigator.userAgent.indexOf("Firefox") > -1;

  var event = {
    y: 0,
    x: 0,
    deltaX: 0,
    deltaY: 0,
    originalEvent: null
  };

  var k = {
    left: 37,
    right: 39,
    up: 38,
    down: 40
  };

  vs.on = function(f) {
    if (!initialized) initListeners();

    var i = listeners.indexOf(f);
    if (i !== -1) return;

    listeners.push(f);
    numListeners = listeners.length;
  };

  /**
   *	@method options
   *	@memberof VirtualScroll
   *	@static
   *
   *	@param {Object} opt - object literal containing one or more options from the list above, specified as properties.
   *
   *	@description Sets custom parameters to the VirtualScroll (globally). The following options are supported:
   *
   *	<ul>
   *	<li>touchMult (default: 2) - mutiply the touch action to make the scroll a faster/slower than finger movement</li>
   *	<li>firefoxMult (defailt: 15)- Firefox on Windows needs a boost, since scrolling is very slow</li>
   *	<li>keyStep (default: 120) - specified how many pixels to move with each key press</li>
   *	<li>mouseMult (default: 1) - general multiplier for all mousehweel events including FF</li>
   *	</ul>
   */
  vs.options = function(opt) {
    keyStep = opt.keyStep || 120;
    firefoxMult = opt.firefoxMult || 15;
    touchMult = opt.touchMult || 2;
    mouseMult = opt.mouseMult || 1;
  };

  vs.off = function(f) {
    var i = listeners.indexOf(f);
    if (i === -1) return;

    listeners.splice(i, 1);
    numListeners = listeners.length;
    if (numListeners <= 0) destroyListeners();
  };

  /**
   *	@method lockTouch
   *	@memberof VirtualScroll
   *	@static
   *
   *	@description For VirtualScroll to work on mobile, the default swipe-to-scroll behavior needs to be turned off.
   *	This function will take care of that, however it's a failt simple mechanism - see in the source code, linked below.
   */
  vs.lockTouch = function() {
    document.addEventListener("touchmove", function(e) {
      e.preventDefault();
    });
  };

  var notify = function(e) {
    event.x += event.deltaX;
    event.y += event.deltaY;
    event.originalEvent = e;

    for (var i = 0; i < numListeners; i++) {
      listeners[i](event);
    }
  };

  // var onWheel = function(e) {
  //   // In Chrome and in Firefox (at least the new one)
  //   event.deltaX = (e.wheelDeltaX || e.deltaX) || (e.wheelDeltaY || e.deltaY) * -1;
  //   event.deltaY = e.wheelDeltaY || e.deltaY * -1;

  //   // for our purpose deltamode = 1 means user is on a wheel mouse, not touch pad
  //   // real meaning: https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent#Delta_modes
  //   if (isFirefox && e.deltaMode === 1) {
  //     event.deltaX *= firefoxMult;
  //     event.deltaY *= firefoxMult;
  //   }

  //   event.deltaX *= mouseMult;
  //   event.deltaY *= mouseMult;

  //   notify(e);
  // };

  var onMouseWheel = function(e) {
    // In Safari, IE and in Chrome if 'wheel' isn't defined
    event.deltaX = e.wheelDeltaX ? e.wheelDeltaX : 0;
    event.deltaY = e.wheelDeltaY ? e.wheelDeltaY : e.wheelDelta;

    notify(e);
  };

  var onTouchStart = function(e) {
    var t = e.targetTouches ? e.targetTouches[0] : e;
    touchStartX = t.pageX;
    touchStartY = t.pageY;
  };

  var onTouchMove = function(e) {
    // e.preventDefault(); // < This needs to be managed externally
    var t = e.targetTouches ? e.targetTouches[0] : e;

    event.deltaX = (t.pageX - touchStartX) * touchMult;
    event.deltaY = (t.pageY - touchStartY) * touchMult;

    touchStartX = t.pageX;
    touchStartY = t.pageY;

    notify(e);
  };

  var onKeyDown = function(e) {
    // 37 left arrow, 38 up arrow, 39 right arrow, 40 down arrow
    event.deltaX = event.deltaY = 0;
    switch (e.keyCode) {
      case k.left:
        event.deltaX = -keyStep;
        break;
      case k.right:
        event.deltaX = keyStep;
        break;
      case k.up:
        event.deltaY = keyStep;
        break;
      case k.down:
        event.deltaY = -keyStep;
        break;
    }

    notify(e);
  };

  var initListeners = function() {
    // if (hasWheelEvent) document.addEventListener("wheel", onWheel);
    if (hasMouseWheelEvent)
      document.addEventListener("mousewheel", onMouseWheel);

    // if (hasTouch) {
      document.addEventListener("touchstart", onTouchStart);
      document.addEventListener("touchmove", onTouchMove);
    // }

    if (hasPointer && hasTouchWin) {
      bodyTouchAction = document.body.style.msTouchAction;
      document.body.style.msTouchAction = "none";
      document.addEventListener("MSPointerDown", onTouchStart, true);
      document.addEventListener("MSPointerMove", onTouchMove, true);
    }

    if (hasKeyDown) document.addEventListener("keydown", onKeyDown);

    initialized = true;
  };

  var destroyListeners = function() {
    // if (hasWheelEvent) document.removeEventListener("wheel", onWheel);
    if (hasMouseWheelEvent)
      document.removeEventListener("mousewheel", onMouseWheel);

    if (hasTouch) {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
    }

    if (hasPointer && hasTouchWin) {
      document.body.style.msTouchAction = bodyTouchAction;
      document.removeEventListener("MSPointerDown", onTouchStart, true);
      document.removeEventListener("MSPointerMove", onTouchMove, true);
    }

    if (hasKeyDown) document.removeEventListener("keydown", onKeyDown);

    initialized = false;
  };

  return vs;
})(document);


//
//  Virtual Scroll
//
export const SmoothScroll = function(elem, scrollFunc) {
  var _this = this;

  // Grab both red boxes
  this.elem = document.querySelector(elem);

  // Check how much we can scroll. This value is the
  // height of the scrollable element minus the height of the widow
  var fullElemHeight = this.elem.getBoundingClientRect().height;
  var parentHeight = this.elem.parentNode.offsetHeight;
  var elemWidth;// = this.elem.getBoundingClientRect().width - this.elem.;
  var elemHeight;// = this.elem.getBoundingClientRect().height - window.innerHeight;

  // Add easing to the scroll. Play with this value to find a setting that you like.
  var ease = 0.1;
  var mult = 0.7;

  // Store current scroll position
  var targetX = 0,
    targetY = 0;
  var currentX = 0,
    currentY = 0;

  // scroll bar padding
  var showScrollBar = false;
  // var padding = 3;

  var disable = false;
  var isSelf = false;

  var onScroll = function(e) {
    if (!disable && isSelf) {
      // Accumulate delta value on each scroll event
      targetY += e.deltaY * mult;
      targetX += e.deltaX * mult;

      // Clamp the value so it doesn't go too far up or down
      // The value needs to be between 0 and -elemHeight
      targetX = Math.max(-elemWidth, targetX);
      targetX = Math.min(0, targetX);
      targetY = Math.max(-elemHeight, targetY);
      targetY = Math.min(0, targetY);
    }
  };

  var onAnim = function() {
    // Make sure this works across different browsers (use the shim or something)

    // keep at bottom while resizing
    if (-targetX > elemWidth && targetX < 0) targetX = -elemWidth;
    if (-targetY > elemHeight && targetY < 0) targetY = -elemHeight;
    if(_this.elem.getBoundingClientRect().height < _this.elem.parentNode.offsetHeight)
      targetY = 0;

    // Get closer to the target value at each frame, using ease.
    // Other easing methods are also ok.
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;


    // Uncomment this line to scroll horizontally
    // currentX += (targetX - currentX) * ease;

    // Apply CSS style
    setTranslate(
      _this.elem,
      currentX.toFixed(4) + "px",
      currentY.toFixed(4) + "px",
      0 + "px"
    );

    refresh();

    if (scrollFunc) scrollFunc(currentY / elemHeight, currentY, elemHeight);

    if (showScrollBar)
      if (fullElemHeight > _this.elem.parentNode.offsetHeight)
        rePositionScrollBar(currentY);

    // lazyLoad.checkAndShowImg();
  };

  // detect that if hovered scroll container
  addEvent(_this.elem, "mouseenter", function() {
    isSelf = true;
  });
  addEvent(_this.elem, "mouseleave", function() {
    isSelf = false;
  });
  addEvent(_this.elem, "touchstart", function() {
    isSelf = true;
  });
  addEvent(_this.elem, "touchend", function() {
    isSelf = false;
  });

  var initScrollBar = function() {
    _this.oldMouseY = 0;
    _this.scrollBarOuterWrap = document.createElement("div");
    _this.scrollBarWrap = document.createElement("div");
    _this.scrollBar = document.createElement("div");

    _this.scrollBarOuterWrap.setAttribute("id", "scrollBarOuterWrap");
    _this.scrollBarWrap.setAttribute("id", "scrollBarWrap");
    _this.scrollBar.setAttribute("id", "scrollBar");

    addEvent(_this.scrollBar, "mousedown", onMouseDownScrollBar);
    addEvent(document, "mousemove", onMoveScrollBar);
    addEvent(document, "mouseup", onMouseUpScrollBar);
    
    addEvent(_this.scrollBar, "touchstart", onMouseDownScrollBar);
    addEvent(document, "touchmove", onMoveScrollBar);
    addEvent(document, "touchend", onMouseUpScrollBar);

    _this.scrollBarWrap.appendChild(_this.scrollBar);
    _this.scrollBarOuterWrap.appendChild(_this.scrollBarWrap);
    _this.elem.parentNode.appendChild(_this.scrollBarOuterWrap);
  };

  var rePositionScrollBar = function(y) {
    // var scrollBarHeight = (1 - elemHeight / fullElemHeight) * 100;
    _this.scrollBar.style.width = 35 / 2736 * 100 + "vw";
    _this.scrollBar.style.height = 35 / 2736 * 100 + "vw";
    _this.scrollBarY = (_this.scrollBarWrap.offsetHeight - _this.scrollBar.offsetHeight) * (y / elemHeight);

    // setTranslate( _this.scrollBarWrap , 0+'px' , (-y.toFixed(4)) +'px' , 0+'px' );
    setTranslate(
      _this.scrollBar,
      '-50%',
      -_this.scrollBarY.toFixed(4) + "px",
      0 + "px"
    );
  };

  var onMouseDownScrollBar = function(event) {
    let e = (event.touches? event.touches[0]: event);
    if(!event.touches) e.preventDefault();
    _this.oldMouseY = e.pageY;
    _this.clickedScrollBar = true;
    addClass(_this.scrollBar, "active");
  };

  var onMoveScrollBar = function(event) {
    if (_this.clickedScrollBar) {
      let e = (event.touches? event.touches[0]: event);

      var y = _this.oldMouseY - e.pageY;
      targetY += y * (fullElemHeight / _this.elem.parentNode.offsetHeight);

      targetY = Math.max(-elemHeight, targetY);
      targetY = Math.min(0, targetY);

      _this.oldMouseY = e.pageY;
    }
  };

  var onMouseUpScrollBar = function() {
    _this.clickedScrollBar = false;
    removeClass(_this.scrollBar, "active");
  };

  var reset = function() {
    currentY = 0;
    targetY = 0;
  };

  var refresh = function() {
    if (_this.elem.parentNode != null) {
      fullElemHeight = _this.elem.getBoundingClientRect().height;
      elemWidth = _this.elem.getBoundingClientRect().width - _this.elem.parentNode.offsetWidth;
      elemHeight = _this.elem.getBoundingClientRect().height - _this.elem.parentNode.offsetHeight;

      if (showScrollBar) {
        if (fullElemHeight > parentHeight) {
          if (hasClass(_this.scrollBarOuterWrap, "hide"))
            removeClass(_this.scrollBarOuterWrap, "hide");
        } else {
          if (!hasClass(_this.scrollBarOuterWrap, "hide"))
            addClass(_this.scrollBarOuterWrap, "hide");
        }
      }
    }
  };

  var to = function(y) {
    elemHeight =
      _this.elem.getBoundingClientRect().height -
      _this.elem.parentNode.offsetHeight;
    targetY = Math.max(-elemHeight, y);
  };
  var set = function(y) {
    currentY = y;
    targetY = y;
  };

  var isOn = false;
  var on = function() {
    isOn = true;
    refresh();
    onResize();
    VirtualScroll.on(onScroll);
    FrameImpulse.on(onAnim);
  };

  var off = function() {
    isOn = false;
    VirtualScroll.off(onScroll);
    FrameImpulse.off(onAnim);
    destroy();
  };
  
  var destroy = function(){
    removeEvent(_this.scrollBar, "mousedown", onMouseDownScrollBar);
    removeEvent(document, "mousemove", onMoveScrollBar);
    removeEvent(document, "mouseup", onMouseUpScrollBar);
    
    removeEvent(_this.scrollBar, "touchstart", onMouseDownScrollBar);
    removeEvent(document, "touchmove", onMoveScrollBar);
    removeEvent(document, "touchend", onMouseUpScrollBar);

    _this.scrollBarOuterWrap.remove();
    _this.scrollBarOuterWrap = null;
    _this.scrollBarWrap = null;
    _this.scrollBar = null;
  }

  var onResize = function() {
    parentHeight = _this.elem.parentNode.offsetHeight;
    if (isMobile()) {
      if (isOn) {
        off();
        setTranslate(_this.elem, 0 + "px", 0 + "px", 0 + "px");
      }
    } else {
      if (!isOn) {
        // reset();
        on();
      }
      if (disable) onEnable();
    }
  };
  var onDisable = function() {
    disable = true;
  };
  var onEnable = function() {
    disable = false;
  };

  var onShowScrollBar = function() {
    showScrollBar = true;
    removeClass(_this.scrollBarWrap,'hide');
  };
  var onHideScrollBar = function() {
    showScrollBar = false;
    addClass(_this.scrollBarWrap,'hide');
  };

  var init = function() {
    initScrollBar();
    addEvent(window, "resize", onResize);
  };

  init();

  return {
    reset: reset,
    refresh: refresh,
    onResize: onResize,
    set: set,
    to: to,
    on: on,
    off: off,
    disable: onDisable,
    enable: onEnable,
    showScrollBar: onShowScrollBar,
    hideScrollBar: onHideScrollBar,
    destroy: destroy
  };
};


export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export const isInDevMode = () => { 
  return '_self' in React.createElement('div');
}