/*
 * web-swipe-view — Copyright (c) 2014 Simon Friis Vindum
 * SwipeView v1.0 — Copyright (c) 2012 Matteo Spinelli, http://cubiq.org
 * Released under MIT license
 */
(function (root) {
  var dummyStyle = document.createElement('div').style;
  var vendor = (function () {
    var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'];
    for (var i = 0; i < vendors.length; i++ ) {
      if ((vendors[i] + 'ransform') in dummyStyle ) {
        return vendors[i].substr(0, vendors[i].length - 1);
      }
    }
    return false;
  })();
  var cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '';

  // Style properties
  var transform = prefixStyle('transform');
  var transitionDuration = prefixStyle('transitionDuration');

  // Browser capabilities
  var has3d = prefixStyle('perspective') in dummyStyle;
  var hasTouch = 'ontouchstart' in window;
  console.log(hasTouch);
  var hasTransform = !!vendor;
  var hasTransitionEnd = prefixStyle('transition') in dummyStyle;

  // Helpers
  var translateZ = has3d ? ' translateZ(0)' : '';
  var mod = function(n, m) { return ((n % m) + m) % m; };

  // Events
  var resizeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize';
  var startEvent = hasTouch ? 'touchstart' : 'mousedown';
  var moveEvent = hasTouch ? 'touchmove' : 'mousemove';
  var endEvent = hasTouch ? 'touchend' : 'mouseup';
  var cancelEvent = hasTouch ? 'touchcancel' : 'mouseup';
  var transitionEndEvent = (function () {
    if ( vendor === false ) return false;

    var transitionEnd = {
        ''      : 'transitionend',
        'webkit': 'webkitTransitionEnd',
        'Moz'   : 'transitionend',
        'O'     : 'oTransitionEnd',
        'ms'    : 'MSTransitionEnd'
      };

    return transitionEnd[vendor];
  })();
    
  var SwipeView = function (el, options) {
    var i, div, className, pageIndex;
    this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
    var initialHTML = this.wrapper.innerHTML;
    this.wrapper.innerHTML = ''; // Clear the wrapper
    this.options = {
      initialPage: 0,
      numberOfPages: 3,
      snapThreshold: null,
      loop: true,
      pageTurnSpeed: 200,
    };
  
    // User defined options
    for (i in options) this.options[i] = options[i];
    
    this.wrapper.style.overflow = 'hidden';
    if (getComputedStyle(this.wrapper).getPropertyValue('position') !== 'absolute') {
      this.wrapper.style.position = 'relative';
    }
    
    this.masterPages = [];
    
    div = document.createElement('div');
    div.id = 'swipeview-slider';
    div.style.cssText = 'position:relative;top:0;height:100%;width:100%;' + cssVendor + 'transition-duration:0;' + cssVendor + 'transform:translateZ(0);' + cssVendor + 'transition-timing-function:ease-out';
    this.wrapper.appendChild(div);
    this.slider = div;

    this.refreshSize();

    for (i = -1; i < 2; i++) {
      div = document.createElement('div');
      div.id = 'swipeview-masterpage-' + (i+1);
      div.style.cssText = cssVendor + 'transform:translateZ(0);position:absolute;top:0;height:100%;width:100%;left:' + i*100 + '%';
      div.innerHTML = initialHTML;
      if (!div.dataset) div.dataset = {};
      pageIndex = mod(this.options.initialPage + i, this.options.numberOfPages);
      div.dataset.pageIndex = pageIndex;
      div.dataset.upcomingPageIndex = pageIndex;
      
      if (!this.options.loop && i === -1) div.style.visibility = 'hidden';

      this.slider.appendChild(div);
      this.masterPages.push(div);
      this.options.generatePage(pageIndex, div);
    }
    
    this.masterPages[1].classList.add('swipeview-active');
    //this.masterPages[1].style.position = 'relative';

    window.addEventListener(resizeEvent, this, false);
    this.wrapper.addEventListener(startEvent, this, false);
    this.wrapper.addEventListener(moveEvent, this, false);
    this.wrapper.addEventListener(endEvent, this, false);
    this.slider.addEventListener(transitionEndEvent, this, false);
    // in Opera >= 12 the transitionend event is lowercase so we register both events
    if ( vendor == 'O' ) this.slider.addEventListener(transitionEndEvent.toLowerCase(), this, false);
  };

  SwipeView.prototype = {
    currentMasterPage: 1,
    x: 0,
    page: 0,
    pageIndex: 0,
    customEvents: [],
    
    onFlip: function (fn) {
      this.wrapper.addEventListener('swipeview-flip', fn, false);
      this.customEvents.push(['flip', fn]);
    },
    
    onMoveOut: function (fn) {
      this.wrapper.addEventListener('swipeview-moveout', fn, false);
      this.customEvents.push(['moveout', fn]);
    },

    onMoveIn: function (fn) {
      this.wrapper.addEventListener('swipeview-movein', fn, false);
      this.customEvents.push(['movein', fn]);
    },
    
    onTouchStart: function (fn) {
      this.wrapper.addEventListener('swipeview-touchstart', fn, false);
      this.customEvents.push(['touchstart', fn]);
    },

    destroy: function () {
      while (this.customEvents.length) {
        this.wrapper.removeEventListener('swipeview-' + this.customEvents[0][0], this.customEvents[0][1], false);
        this.customEvents.shift();
      }
      
      // Remove the event listeners
      window.removeEventListener(resizeEvent, this, false);
      this.wrapper.removeEventListener(startEvent, this, false);
      this.wrapper.removeEventListener(moveEvent, this, false);
      this.wrapper.removeEventListener(endEvent, this, false);
      this.slider.removeEventListener(transitionEndEvent, this, false);
    },

    refreshSize: function () {
      this.wrapperWidth = this.wrapper.clientWidth;
      this.wrapperHeight = this.wrapper.clientHeight;
      this.pageWidth = this.wrapperWidth;
      this.maxX = -this.options.numberOfPages * this.pageWidth + this.wrapperWidth;
      this.snapThreshold = this.options.snapThreshold === null ?
        Math.round(this.pageWidth * 0.15) :
        /%/.test(this.options.snapThreshold) ?
          Math.round(this.pageWidth * this.options.snapThreshold.replace('%', '') / 100) :
          this.options.snapThreshold;
    },
    
    updatePageCount: function (n) {
      this.options.numberOfPages = n;
      this.maxX = -this.options.numberOfPages * this.pageWidth + this.wrapperWidth;
    },
    
    goToPage: function (p) {
      console.log(this.page);
      this.masterPages[this.currentMasterPage].classList.remove('swipeview-active');
      this.masterPages[this.currentMasterPage].style.position = 'absolute';
      
      newPageIndex = Math.min(this.options.numberOfPages - 1, Math.max(0, p));
      var delta = newPageIndex - this.pageIndex, dist = Math.abs(delta);
      var turnOffset = dist <= this.options.numberOfPages - dist ?
                         delta :
                         delta - (delta / dist) * this.options.numberOfPages;
      this.slider.style[transitionDuration] = this.options.pageTurnSpeed + 'ms';
      this.page += turnOffset;
      this.pageIndex = newPageIndex;

      this.prevMasterPage = p % 3;
      this.currentMasterPage = (p + 1) % 3;
      this.nextMasterPage = (p + 2) % 3;
      if (turnOffset !== 1 && turnOffset !== -1) {
        this.masterPages[this.currentMasterPage].classList.add('swipeview-loading');
      }

      this.masterPages[this.currentMasterPage].classList.add('swipeview-active');
      this.masterPages[this.currentMasterPage].style.position = 'relative';

      var pages = this.currentMasterPage === 0 ? [2, 0, 1] :
                  this.currentMasterPage === 1 ? [0, 1, 2] :
                                                 [1, 2, 0];

      console.log([this.prevMasterPage, this.currentMasterPage, this.nextMasterPage]);

      this.masterPages[pages[0]].style.left = this.page * 100 - 100 + '%';
      this.masterPages[pages[1]].style.left = this.page * 100 + '%';
      this.masterPages[pages[2]].style.left = this.page * 100 + 100 + '%';

      this.masterPages[pages[0]].dataset.upcomingPageIndex = p === 0 ? this.options.numberOfPages-1 : p - 1;
      this.masterPages[pages[1]].dataset.upcomingPageIndex = p;
      this.masterPages[pages[2]].dataset.upcomingPageIndex = p === this.options.numberOfPages-1 ? 0 : p + 1;
      
      this._pos(-this.page * this.pageWidth);
    },
    
    next: function () {
      if (!this.options.loop && this.x == this.maxX) return;
      this.directionX = -1;
      this.x -= 1;
      this._checkPosition();
    },

    prev: function () {
      if (!this.options.loop && this.x === 0) return;
      this.directionX = 1;
      this.x += 1;
      this._checkPosition();
    },

    handleEvent: function (e) {
      switch (e.type) {
        case startEvent:
          this._start(e);
          break;
        case moveEvent:
          this._move(e);
          break;
        case cancelEvent:
        case endEvent:
          this._end(e);
          break;
        case resizeEvent:
          this._resize();
          break;
        case transitionEndEvent:
        case 'otransitionend':
          if (e.target == this.slider/* && !this.options.hastyPageFlip*/) this._flip();
          break;
      }
    },

    // Pseudo private methods
    _pos: function (x) {
      this.x = x;
      this.slider.style[transform] = 'translate(' + x + 'px,0)' + translateZ;
    },

    _resize: function () {
      this.refreshSize();
      this.slider.style[transitionDuration] = '0s';
      this._pos(-this.page * this.pageWidth);
    },

    _reset: function() {
      this.moved = false;
      this.thresholdExceeded = false;
      this.stepsX = 0;
      this.stepsY = 0;
      this.directionX = 0;
      this.directionLocked = false;
      this.slider.style[transitionDuration] = '0s';
    },

    _start: function (e) {
      if (this.initiated) return;
      this.initiated = true;
      
      this._reset();

      var point = hasTouch ? e.touches[0] : e;
      this.startX = this.pointX = point.pageX;
      this.startY = this.pointY = point.pageY;
      this._triggerEvent('touchstart');
    },
    
    _move: function (e) {
      if (!this.initiated) return;

      var point  = hasTouch ? e.touches[0] : e,
          deltaX = point.pageX - this.pointX,
          deltaY = point.pageY - this.pointY,
          newX   = this.x + deltaX,
          dist   = Math.abs(point.pageX - this.startX);

      this.moved = true;
      this.pointX = point.pageX;
      this.pointY = point.pageY;
      this.directionX = deltaX > 0 ? 1 : deltaX < 0 ? -1 : 0;
      this.stepsX += Math.abs(deltaX);
      this.stepsY += Math.abs(deltaY);

      // We take a 10px buffer to figure out the direction of the swipe
      if (this.stepsX < 10 && this.stepsY < 10) {
        return;
      }

      // We are scrolling vertically, so skip SwipeView and give the control back to the browser
      if (!this.directionLocked) {
        if (this.stepsY > this.stepsX) {
          this.initiated = false;
          return;
        } else {
          console.log('swipe started');
          console.log(window.scrollY);
          this.directionLocked = true;
        }
      }

      e.preventDefault();

      if (!this.options.loop && (newX > 0 || newX < this.maxX)) {
        newX = this.x + (deltaX / 2);
      }

      if (!this.thresholdExceeded && dist >= this.snapThreshold) {
        this.thresholdExceeded = true;
        this._triggerEvent('moveout');
      } else if (this.thresholdExceeded && dist < this.snapThreshold) {
        this.thresholdExceeded = false;
        this._triggerEvent('movein');
      }
      
      this._pos(newX);
    },
    
    _end: function (e) {
      if (!this.initiated) return;
      
      var point = hasTouch ? e.changedTouches[0] : e,
          dist = Math.abs(point.pageX - this.startX);

      this.initiated = false;
      
      if (!this.moved) return;

      if (!this.options.loop && (this.x > 0 || this.x < this.maxX)) {
        dist = 0;
        this._triggerEvent('movein');
      }

      // Check if we exceeded the snap threshold
      if (dist < this.snapThreshold) {
        this.slider.style[transitionDuration] = Math.floor(300 * dist / this.snapThreshold) + 'ms';
        this._pos(-this.page * this.pageWidth);
      } else {
        this._checkPosition();
      }
    },
    
    _checkPosition: function () {
      var pageFlip, pageFlipIndex, className;

      this.masterPages[this.currentMasterPage].classList.remove('swipeview-active');
      this.masterPages[this.currentMasterPage].style.position = 'absolute';

      // Flip the page, directionX == -1 when swiping right and +1 when swiping left
      this.page = (this.page - this.directionX);
      this.currentMasterPage = mod(this.pase + 1, 3);
      this.pageIndex = mod(this.pageIndex - this.directionX, this.options.numberOfPages);
      pageFlip = mod(this.currentMasterPage - this.directionX, 3);
      pageFlipIndex = this.page - this.directionX;
      this.masterPages[pageFlip].style.left = (this.page - this.directionX) * 100 + '%';
      pageFlipIndex = mod(this.pageIndex - this.directionX, this.options.numberOfPages);

      // Add active class to current page
      this.masterPages[this.currentMasterPage].classList.add('swipeview-active');
      this.masterPages[this.currentMasterPage].style.position = 'relative';

      // Add loading class to flipped page
      this.masterPages[pageFlip].classList.add('swipeview-loading');
      
      this.masterPages[pageFlip].dataset.upcomingPageIndex = pageFlipIndex; // Index to be loaded in the newly flipped page

      newX = -this.page * this.pageWidth;
      
      this.slider.style[transitionDuration] = Math.floor(this.options.pageTurnSpeed * Math.abs(this.x - newX) / this.pageWidth) + 'ms';

      // Hide the next page if we decided to disable looping
      if (!this.options.loop) {
        this.masterPages[pageFlip].style.visibility = newX === 0 || newX == this.maxX ? 'hidden' : '';
      }

      if (this.x == newX) {
        this._flip(); // If we swiped all the way long to the next page (extremely rare but still)
      } else {
        this._pos(newX);
        //if (this.options.hastyPageFlip) this._flip();
      }
    },
    
    _flip: function () {
      console.log('flip');
      this._triggerEvent('flip');

      for (var i=0; i<3; i++) {
        this.masterPages[i].classList.remove('swipeview-loading');
        if (this.masterPages[i].dataset.pageIndex !== this.masterPages[i].dataset.upcomingPageIndex) {
          this.options.generatePage(parseInt(this.masterPages[i].dataset.upcomingPageIndex, 10), this.masterPages[i]);
        }
        this.masterPages[i].dataset.pageIndex = this.masterPages[i].dataset.upcomingPageIndex;
      }
    },
    
    _triggerEvent: function (type) {
      var ev = document.createEvent("Event");
      ev.initEvent('swipeview-' + type, true, true);
      this.wrapper.dispatchEvent(ev);
    },

    _scrollTo: function() {
      console.log('going to the top');
      window.scrollTo(0, 0);
    },
  };

  function prefixStyle (style) {
    return (vendor === '') ? style
      : vendor + style.charAt(0).toUpperCase() + style.substr(1);
  }
  console.log(root);
  root.SwipeView = SwipeView;
}(typeof exports !== 'undefined' ? exports : window));
