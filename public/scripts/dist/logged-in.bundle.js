(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
"use strict";

var MacroLibrary = require('macro-library');

var macroLibrary = new MacroLibrary();
macroLibrary.registerMacros();

class DisplayCoupler {
  constructor(db) {
    this.db = db;
    this.startingUp = true;
  }

  static registeredMacros() {
    return macroLibrary.registeredMacros();
  }

  startUp({dimensions, callbacks}) {
    this.activateMacro = macroLibrary.loadMacro('start-up', {
      dimensions: dimensions,
      callbacks: callbacks
    });
    this.activateMacro.start();
  }

  demo(displayConfig, callbacks) {
    var next = () => {
      var macro = displayConfig.macro,
          options = {
            config: displayConfig.macroConfig || {},
            dimensions: {
              width: displayConfig.width,
              height: displayConfig.height
            },
            callbacks: {
              onPixelChange: (y, x, hex) => {
                callbacks.onPixelChange(y, x, hex, displayConfig);
              }
            }
          };

      if(this.activateMacro) {
        this.activateMacro.stop();
      }
      this.activateMacro = macroLibrary.loadMacro(macro, options);
      this.activateMacro.start();
    };

    if(this.startingUp) {
      callbacks.onReady(displayConfig, () => {
        this.startingUp = false;
        next();
      });
    } else {
      next()
    }
  }

  connect(displayKey, callbacks) {
    this.db.ref(`displays/${displayKey}/`).on('value', (snapshot) => {
      var displayData = snapshot.val();

      var next = () => {
        var macro = displayData.macro,
            options = {
              config: displayData.macroConfig || {},
              dimensions: {
                width: displayData.width,
                height: displayData.height
              },
              db: this.db,
              callbacks: {
                onPixelChange: (y, x, hex) => {
                  callbacks.onPixelChange(y, x, hex, displayData);
                }
              }
            };

        if(macro === "programmable") {
          options.config.matrix = displayData.matrix;
        }

        if(this.activateMacro) {
          this.activateMacro.stop();
        }
        this.activateMacro = macroLibrary.loadMacro(macro, options);
        this.activateMacro.start();
      };

      if(this.startingUp) {
        callbacks.onReady(displayData, () => {
          this.startingUp = false;
          next();
        });
      } else {
        next()
      }
    });
  }
}

module.exports = DisplayCoupler;

},{"macro-library":3}],3:[function(require,module,exports){
"use strict";

var ProgrammableMacro = require('./macros/programmable'),
    TwinkleMacro = require('./macros/twinkle'),
    StartUpMacro = require('./macros/start-up'),
    SolidColorMacro = require('./macros/solid-color'),
    UnsupportedMacro = require('./macros/unsupported'),
    TextMacro = require('./macros/text');

var MacroConfig = require('./macro-config');

class MacroLibrary {
  constructor() {
    this.Macros = {};
  }

  registerMacros() {
    this.Macros[ProgrammableMacro.identifier] = ProgrammableMacro;
    this.Macros[TwinkleMacro.identifier] = TwinkleMacro;
    this.Macros[StartUpMacro.identifier] = StartUpMacro;
    this.Macros[SolidColorMacro.identifier] = SolidColorMacro;
    this.Macros[TextMacro.identifier] = TextMacro;
  }

  availableMacros() {
    return MacroConfig;
  }

  loadMacro(name, options) {
    var Macro = this.Macros[name] || UnsupportedMacro;
    return new Macro(options);
  }
}

module.exports = MacroLibrary;

},{"./macro-config":4,"./macros/programmable":6,"./macros/solid-color":7,"./macros/start-up":8,"./macros/text":9,"./macros/twinkle":10,"./macros/unsupported":11}],4:[function(require,module,exports){
module.exports={
  "twinkle": {
    "name": "Twinkle",
    "description": "Choose a color and randomly toggle the brightness of each LED on the board."
  },
  "programmable": {
    "name": "Programmable",
    "description": "Update each LED via a restful interface programmatically."
  },
  "solid-color": {
    "name": "Solid Color",
    "description": "Fill the board with one solid color."
  },
  "start-up": {
    "name": "Start up",
    "description": "The starting up animation"
  },
  "text": {
    "name": "Text",
    "description": "Display any text with a specific color and font"
  },
  "unsupported": {
    "name": "Unsupported",
    "description": "When a macro can't be found, this is macro is used"
  }
}

},{}],5:[function(require,module,exports){
"use strict";

class Macro {
  constructor({config, dimensions, db, callbacks}) {
    this.config = config;
    this.dimensions = dimensions;
    this.db = db;
    this.callbacks = callbacks;

    if(!this.constructor.identifier) {
      throw new Error("A macro is missing it's class identifier function");
    } else {
      if(!this.start) {
        throw new Error(`${this.identifier()} did not implement a start method`);
      }

      if(!this.stop) {
        throw new Error(`${this.identifier()} did not implement a stop method`);
      }
    }
  }

  setColor(color) {
    var height = this.dimensions.height,
        width = this.dimensions.width;
        
    for(var y = 0; y < height; y++) {
      for(var x = 0; x < width; x++) {
        this.callbacks.onPixelChange(y, x, color);
      }
    }
  }
}

module.exports = Macro;

},{}],6:[function(require,module,exports){
"use strict";

var Macro = require('./macro');

const identifier = 'programmable';

class ProgrammableMacro extends Macro {
  static get identifier() {
    return identifier;
  }

  start() {
    var matrixKey = this.config.matrix;
    this.matrixRef = this.db.ref(`matrices/${matrixKey}`);
    this.matrixRef.once('value').then((snapshot) => {
      var data = snapshot.val();

      for(let key in snapshot.val()) {
        var hex = data[key].hex,
            [y, x] = key.split(':');

        this.callbacks.onPixelChange(y, x, hex);
      }
    });

    this.childChangedCallback = this.matrixRef.on('child_changed', (snapshot) => {
      var hex = snapshot.val().hex,
          [y, x] = snapshot.key.split(':');

      this.callbacks.onPixelChange(y, x, hex);
    });
  }

  stop() {
    this.matrixRef.off('child_changed', this.childChangedCallback);
  }
}

module.exports = ProgrammableMacro;

},{"./macro":5}],7:[function(require,module,exports){
"use strict";

var Macro = require('./macro');

const identifier = 'solid-color';

class SolidColorMacro extends Macro {
  static get identifier() {
    return identifier;
  }

  start() {
    var config = this.config || this.defaultConfig();

    var height = this.dimensions.height,
        width = this.dimensions.width,
        color = this.config.color;

    for(var y = 0; y < height; y++) {
      for(var x = 0; x < width; x++) {
        this.callbacks.onPixelChange(y, x, color);
      }
    }
  }

  stop() {
    // nothing...
  }
}

module.exports = SolidColorMacro;

},{"./macro":5}],8:[function(require,module,exports){
"use strict";

var Macro = require('./macro');

const identifier = 'start-up';

class StartUpMacro extends Macro {
  static get identifier() {
    return identifier;
  }

  start() {
    this.setColor('#000000');

    this.frameIndex = 0;
    this.interval = setInterval(() => {
      for (let key in frames[this.frameIndex]) {
        var [y, x] = key.split(':'),
            hex = frames[this.frameIndex][key].hex;
        this.callbacks.onPixelChange(y, x, hex);
      }

      if(this.frameIndex == frames.length - 1) {
        this.frameIndex = 0;
      } else {
        this.frameIndex = this.frameIndex + 1;
      }

    }, 100);
  }

  stop() {
    clearInterval(this.interval);
  }
}

var frames = [
  {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#000000'},
    '0:2': {hex: '#000000'},
    '0:3': {hex: '#000000'},
    '0:4': {hex: '#000000'},
    '0:5': {hex: '#000000'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#000000'},
    '0:3': {hex: '#000000'},
    '0:4': {hex: '#000000'},
    '0:5': {hex: '#000000'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#000000'},
    '0:4': {hex: '#000000'},
    '0:5': {hex: '#000000'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#CCCC00'},
    '0:4': {hex: '#000000'},
    '0:5': {hex: '#000000'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#CCCC00'},
    '0:4': {hex: '#88CC00'},
    '0:5': {hex: '#000000'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#CCCC00'},
    '0:4': {hex: '#88CC00'},
    '0:5': {hex: '#00CC88'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#CCCC00'},
    '0:4': {hex: '#88CC00'},
    '0:5': {hex: '#00CC88'},
    '0:6': {hex: '#0066CC'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#CCCC00'},
    '0:4': {hex: '#88CC00'},
    '0:5': {hex: '#00CC88'},
    '0:6': {hex: '#0066CC'},
    '0:7': {hex: '#CC00CC'}
  }
];

module.exports = StartUpMacro;

},{"./macro":5}],9:[function(require,module,exports){
"use strict";

var Macro = require('./macro');
var TypeWriter = require('typewriter');

const identifier = 'text';

class SolidColorMacro extends Macro {
  static get identifier() {
    return identifier;
  }

  start() {
    var config = this.config;
    var coordinates = [];
    var typeWriter = new TypeWriter({ font: this.config.font});
    typeWriter.text(this.config.text, (item) => {
      this.callbacks.onPixelChange(item.y, item.x, this.config.color);
      coordinates.push({y: item.y, x: item.x});
    });

    var messageLength = Math.max.apply(Math, coordinates.map(function(coordinate) {
      return coordinate.x;
    }));

    if (messageLength > this.dimensions.width) {
      setTimeout(() => {
        var offset = 0;
        this.interval = setInterval(() => {
          coordinates.forEach((coordinate) => {
            this.callbacks.onPixelChange(coordinate.y, coordinate.x - offset, '#000000');
          });
          coordinates.forEach((coordinate) => {
            this.callbacks.onPixelChange(coordinate.y, coordinate.x - (offset + 1), this.config.color);
          });

          if(offset > messageLength) {
            offset = -(this.dimensions.width);
          }

          offset += 1;
        }, this.config.marqueeSpeed);
      }, this.config.marqueeInitialDelay);
    }
  }

  stop() {
    if (this.config.marquee) {
      clearInterval(this.interval);
    }
  }
}

module.exports = SolidColorMacro;

},{"./macro":5,"typewriter":14}],10:[function(require,module,exports){
"use strict";

var Macro = require('./macro');

const identifier = 'twinkle';

class TwinkleMacro extends Macro {
  static get identifier() {
    return identifier;
  }

  start() {
    var height = this.dimensions.height,
        width = this.dimensions.width,
        seedColor = this.config.seedColor;

    for(var y = 0; y < height; y++) {
      for(var x = 0; x < width; x++) {
        this.callbacks.onPixelChange(y, x, generateColorShade(seedColor));
      }
    }

    this.interval = setInterval(() => {
      for(let i = 0; i < 100; i++) {
        var y = Math.floor(Math.random() * ((height - 1) - 0 + 1)) + 0;
        var x = Math.floor(Math.random() * ((width - 1) - 0 + 1)) + 0;
        this.callbacks.onPixelChange(y, x, generateColorShade(seedColor));
      }
    }, 100)
  }

  stop() {
    clearInterval(this.interval);
  }
}

function generateColorShade(seedColor) {
  var colors = [];

  colors.push(colorLuminance(seedColor, 0))
  colors.push(colorLuminance(seedColor, -0.5))
  colors.push(colorLuminance(seedColor, -0.8))
  colors.push(colorLuminance(seedColor, -0.8))
  colors.push(colorLuminance(seedColor, -0.8))
  colors.push(colorLuminance(seedColor, -1))

  var index = Math.floor(Math.random() * (5 - 0 + 1)) + 0;

  return colors[index];
}

function colorLuminance(hex, lum) {
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}
	return rgb;
}

module.exports = TwinkleMacro;

},{"./macro":5}],11:[function(require,module,exports){
"use strict";

var Macro = require('./macro');
var TypeWriter = require('typewriter');

const identifier = 'unsupported';

class UnsupportedMacro extends Macro {
  static get identifier() {
    return identifier;
  }

  start() {
    this.setColor('#000000');

    var typeWriter = new TypeWriter({ font: 'system-micro'});
    typeWriter.text("UNSUPPORTED", (item) => {
      this.callbacks.onPixelChange(item.y, item.x, '#FFFFFF');
    });
  }

  stop() {
    // Nothing..
  }
}

var data = [
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0]
];

module.exports = UnsupportedMacro;

},{"./macro":5,"typewriter":14}],12:[function(require,module,exports){
module.exports={
  "height": 14,
  "width": 6,
  "characters": {
    "0": {
      "coordinates": [
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "1": {
      "coordinates": [
        {
          "y": 12,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "2": {
      "coordinates": [
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 5,
          "opacity": 1
        }
      ]
    },
    "3": {
      "coordinates": [
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "4": {
      "coordinates": [
        {
          "y": 1,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "5": {
      "coordinates": [
        {
          "y": 1,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "6": {
      "coordinates": [
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 1,
          "opacity": 1
        }
      ]
    },
    "7": {
      "coordinates": [
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 2,
          "opacity": 1
        }
      ]
    },
    "8": {
      "coordinates": [
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "9": {
      "coordinates": [
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    ",": {
      "width": 3,
      "coordinates": [
        {
          "y": 13,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 1,
          "opacity": 1
        }
      ]
    }
  }
}

},{}],13:[function(require,module,exports){
module.exports={
  "height": 6,
  "width": 5,
  "characters": {
    " ": {
      "coordinates": []
    },
    "0": {
      "coordinates": [
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        }
      ]
    },
    "1": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "2": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        }
      ]
    },
    "3": {
      "coordinates": [
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        }
      ]
    },
    "4": {
      "coordinates": [
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        }
      ]
    },
    "5": {
      "coordinates": [
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "6": {
      "coordinates": [
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "7": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "8": {
      "coordinates": [
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "9": {
      "coordinates": [
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "R": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        }
      ]
    },
    "Y": {
      "coordinates": [
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "O": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        }
      ]
    },
    "U": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "N": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "S": {
      "coordinates": [
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "P": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "T": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "A": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        }
      ]
    },
    "B": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        }
      ]
    },
    "C": {
      "coordinates": [
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        }
      ]
    },
    "D": {
      "coordinates": [
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "E": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "F": {
      "coordinates": [
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "G": {
      "coordinates": [
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        }
      ]
    },
    "H": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "I": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "J": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        }
      ]
    },
    "K": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "M": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "Q": {
      "coordinates": [
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "V": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "L": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "W": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "X": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 1,
          "opacity": 1
        }
      ]
    },
    "Z": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    }
  }
}

},{}],14:[function(require,module,exports){
"use strict";

var Fonts = {
  'system-micro': require('./fonts/system-micro'),
  'system-medium': require('./fonts/system-medium')
};

class TypeWriter {
  constructor(options) {
    options = options || {};
    this.font = options.font;
    this.column = options.startingColumn || 0;
    this.row = options.startingRow || 0;
    this.spaceBetweenLetters = options.spaceBetweenLetters || 1;
    this.alignment = options.alignment || 'left';
  }

  static availableFonts() {
    return Object.keys(Fonts);
  }

  text(copy, callback) {
    var font = Fonts[this.font],
        characters = font.characters;

    if(this.alignment === 'left') {
      for (let i = 0; i < copy.length; i++) {
        var character = characters[copy[i]];

        if(character) {
          var coordinates = character.coordinates;

          if(coordinates) {
            coordinates.forEach((point) => {
              callback({
                y: this.row + point.y,
                x: this.column + point.x
              });
            });

            var width = character.width || font.width;
            this.column = this.column + width + this.spaceBetweenLetters;
          }
        }
      }
    } else {
      this.column -= characters[copy[copy.length - 1]].width || font.width;
      for (let i = copy.length - 1; i >= 0; i--) {
        var character = characters[copy[i]];

        if(character) {
          var coordinates = character.coordinates;

          if(coordinates) {
            coordinates.forEach((point) => {
              callback({
                y: this.row + point.y,
                x: this.column + point.x
              });
            });

            var width = character.width || font.width;
            this.column = this.column - width - this.spaceBetweenLetters;
          }
        }
      }
    }
  }
}

module.exports = TypeWriter;

},{"./fonts/system-medium":12,"./fonts/system-micro":13}],15:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"./macro-config":16,"./macros/programmable":18,"./macros/solid-color":19,"./macros/start-up":20,"./macros/text":21,"./macros/twinkle":22,"./macros/unsupported":23,"dup":3}],16:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],17:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],18:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"./macro":17,"dup":6}],19:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"./macro":17,"dup":7}],20:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"./macro":17,"dup":8}],21:[function(require,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"./macro":17,"dup":9,"typewriter":26}],22:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"./macro":17,"dup":10}],23:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"./macro":17,"dup":11,"typewriter":26}],24:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12}],25:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],26:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"./fonts/system-medium":24,"./fonts/system-micro":25,"dup":14}],27:[function(require,module,exports){
(function (process){
  /* globals require, module */

  'use strict';

  /**
   * Module dependencies.
   */

  var pathtoRegexp = require('path-to-regexp');

  /**
   * Module exports.
   */

  module.exports = page;

  /**
   * Detect click event
   */
  var clickEvent = ('undefined' !== typeof document) && document.ontouchstart ? 'touchstart' : 'click';

  /**
   * To work properly with the URL
   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
   */

  var location = ('undefined' !== typeof window) && (window.history.location || window.location);

  /**
   * Perform initial dispatch.
   */

  var dispatch = true;


  /**
   * Decode URL components (query string, pathname, hash).
   * Accommodates both regular percent encoding and x-www-form-urlencoded format.
   */
  var decodeURLComponents = true;

  /**
   * Base path.
   */

  var base = '';

  /**
   * Running flag.
   */

  var running;

  /**
   * HashBang option
   */

  var hashbang = false;

  /**
   * Previous context, for capturing
   * page exit events.
   */

  var prevContext;

  /**
   * Register `path` with callback `fn()`,
   * or route `path`, or redirection,
   * or `page.start()`.
   *
   *   page(fn);
   *   page('*', fn);
   *   page('/user/:id', load, user);
   *   page('/user/' + user.id, { some: 'thing' });
   *   page('/user/' + user.id);
   *   page('/from', '/to')
   *   page();
   *
   * @param {string|!Function|!Object} path
   * @param {Function=} fn
   * @api public
   */

  function page(path, fn) {
    // <callback>
    if ('function' === typeof path) {
      return page('*', path);
    }

    // route <path> to <callback ...>
    if ('function' === typeof fn) {
      var route = new Route(/** @type {string} */ (path));
      for (var i = 1; i < arguments.length; ++i) {
        page.callbacks.push(route.middleware(arguments[i]));
      }
      // show <path> with [state]
    } else if ('string' === typeof path) {
      page['string' === typeof fn ? 'redirect' : 'show'](path, fn);
      // start [options]
    } else {
      page.start(path);
    }
  }

  /**
   * Callback functions.
   */

  page.callbacks = [];
  page.exits = [];

  /**
   * Current path being processed
   * @type {string}
   */
  page.current = '';

  /**
   * Number of pages navigated to.
   * @type {number}
   *
   *     page.len == 0;
   *     page('/login');
   *     page.len == 1;
   */

  page.len = 0;

  /**
   * Get or set basepath to `path`.
   *
   * @param {string} path
   * @api public
   */

  page.base = function(path) {
    if (0 === arguments.length) return base;
    base = path;
  };

  /**
   * Bind with the given `options`.
   *
   * Options:
   *
   *    - `click` bind to click events [true]
   *    - `popstate` bind to popstate [true]
   *    - `dispatch` perform initial dispatch [true]
   *
   * @param {Object} options
   * @api public
   */

  page.start = function(options) {
    options = options || {};
    if (running) return;
    running = true;
    if (false === options.dispatch) dispatch = false;
    if (false === options.decodeURLComponents) decodeURLComponents = false;
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
    if (false !== options.click) {
      document.addEventListener(clickEvent, onclick, false);
    }
    if (true === options.hashbang) hashbang = true;
    if (!dispatch) return;
    var url = (hashbang && ~location.hash.indexOf('#!')) ? location.hash.substr(2) + location.search : location.pathname + location.search + location.hash;
    page.replace(url, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function() {
    if (!running) return;
    page.current = '';
    page.len = 0;
    running = false;
    document.removeEventListener(clickEvent, onclick, false);
    window.removeEventListener('popstate', onpopstate, false);
  };

  /**
   * Show `path` with optional `state` object.
   *
   * @param {string} path
   * @param {Object=} state
   * @param {boolean=} dispatch
   * @param {boolean=} push
   * @return {!Context}
   * @api public
   */

  page.show = function(path, state, dispatch, push) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    if (false !== dispatch) page.dispatch(ctx);
    if (false !== ctx.handled && false !== push) ctx.pushState();
    return ctx;
  };

  /**
   * Goes back in the history
   * Back should always let the current route push state and then go back.
   *
   * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
   * @param {Object=} state
   * @api public
   */

  page.back = function(path, state) {
    if (page.len > 0) {
      // this may need more testing to see if all browsers
      // wait for the next tick to go back in history
      history.back();
      page.len--;
    } else if (path) {
      setTimeout(function() {
        page.show(path, state);
      });
    }else{
      setTimeout(function() {
        page.show(base, state);
      });
    }
  };


  /**
   * Register route to redirect from one path to other
   * or just redirect to another route
   *
   * @param {string} from - if param 'to' is undefined redirects to 'from'
   * @param {string=} to
   * @api public
   */
  page.redirect = function(from, to) {
    // Define route from a path to another
    if ('string' === typeof from && 'string' === typeof to) {
      page(from, function(e) {
        setTimeout(function() {
          page.replace(/** @type {!string} */ (to));
        }, 0);
      });
    }

    // Wait for the push state and replace it with another
    if ('string' === typeof from && 'undefined' === typeof to) {
      setTimeout(function() {
        page.replace(from);
      }, 0);
    }
  };

  /**
   * Replace `path` with optional `state` object.
   *
   * @param {string} path
   * @param {Object=} state
   * @param {boolean=} init
   * @param {boolean=} dispatch
   * @return {!Context}
   * @api public
   */


  page.replace = function(path, state, init, dispatch) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    ctx.init = init;
    ctx.save(); // save before dispatching, which may redirect
    if (false !== dispatch) page.dispatch(ctx);
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Context} ctx
   * @api private
   */
  page.dispatch = function(ctx) {
    var prev = prevContext,
      i = 0,
      j = 0;

    prevContext = ctx;

    function nextExit() {
      var fn = page.exits[j++];
      if (!fn) return nextEnter();
      fn(prev, nextExit);
    }

    function nextEnter() {
      var fn = page.callbacks[i++];

      if (ctx.path !== page.current) {
        ctx.handled = false;
        return;
      }
      if (!fn) return unhandled(ctx);
      fn(ctx, nextEnter);
    }

    if (prev) {
      nextExit();
    } else {
      nextEnter();
    }
  };

  /**
   * Unhandled `ctx`. When it's not the initial
   * popstate then redirect. If you wish to handle
   * 404s on your own use `page('*', callback)`.
   *
   * @param {Context} ctx
   * @api private
   */
  function unhandled(ctx) {
    if (ctx.handled) return;
    var current;

    if (hashbang) {
      current = base + location.hash.replace('#!', '');
    } else {
      current = location.pathname + location.search;
    }

    if (current === ctx.canonicalPath) return;
    page.stop();
    ctx.handled = false;
    location.href = ctx.canonicalPath;
  }

  /**
   * Register an exit route on `path` with
   * callback `fn()`, which will be called
   * on the previous context when a new
   * page is visited.
   */
  page.exit = function(path, fn) {
    if (typeof path === 'function') {
      return page.exit('*', path);
    }

    var route = new Route(path);
    for (var i = 1; i < arguments.length; ++i) {
      page.exits.push(route.middleware(arguments[i]));
    }
  };

  /**
   * Remove URL encoding from the given `str`.
   * Accommodates whitespace in both x-www-form-urlencoded
   * and regular percent-encoded form.
   *
   * @param {string} val - URL component to decode
   */
  function decodeURLEncodedURIComponent(val) {
    if (typeof val !== 'string') { return val; }
    return decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
  }

  /**
   * Initialize a new "request" `Context`
   * with the given `path` and optional initial `state`.
   *
   * @constructor
   * @param {string} path
   * @param {Object=} state
   * @api public
   */

  function Context(path, state) {
    if ('/' === path[0] && 0 !== path.indexOf(base)) path = base + (hashbang ? '#!' : '') + path;
    var i = path.indexOf('?');

    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';
    if (hashbang) this.path = this.path.replace('#!', '') || '/';

    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
    this.pathname = decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
    this.params = {};

    // fragment
    this.hash = '';
    if (!hashbang) {
      if (!~this.path.indexOf('#')) return;
      var parts = this.path.split('#');
      this.path = parts[0];
      this.hash = decodeURLEncodedURIComponent(parts[1]) || '';
      this.querystring = this.querystring.split('#')[0];
    }
  }

  /**
   * Expose `Context`.
   */

  page.Context = Context;

  /**
   * Push state.
   *
   * @api private
   */

  Context.prototype.pushState = function() {
    page.len++;
    history.pushState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function() {
    history.replaceState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Initialize `Route` with the given HTTP `path`,
   * and an array of `callbacks` and `options`.
   *
   * Options:
   *
   *   - `sensitive`    enable case-sensitive routes
   *   - `strict`       enable strict matching for trailing slashes
   *
   * @constructor
   * @param {string} path
   * @param {Object=} options
   * @api private
   */

  function Route(path, options) {
    options = options || {};
    this.path = (path === '*') ? '(.*)' : path;
    this.method = 'GET';
    this.regexp = pathtoRegexp(this.path,
      this.keys = [],
      options);
  }

  /**
   * Expose `Route`.
   */

  page.Route = Route;

  /**
   * Return route middleware with
   * the given callback `fn()`.
   *
   * @param {Function} fn
   * @return {Function}
   * @api public
   */

  Route.prototype.middleware = function(fn) {
    var self = this;
    return function(ctx, next) {
      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
      next();
    };
  };

  /**
   * Check if this route matches `path`, if so
   * populate `params`.
   *
   * @param {string} path
   * @param {Object} params
   * @return {boolean}
   * @api private
   */

  Route.prototype.match = function(path, params) {
    var keys = this.keys,
      qsIndex = path.indexOf('?'),
      pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
      m = this.regexp.exec(decodeURIComponent(pathname));

    if (!m) return false;

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];
      var val = decodeURLEncodedURIComponent(m[i]);
      if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
        params[key.name] = val;
      }
    }

    return true;
  };


  /**
   * Handle "populate" events.
   */

  var onpopstate = (function () {
    var loaded = false;
    if ('undefined' === typeof window) {
      return;
    }
    if (document.readyState === 'complete') {
      loaded = true;
    } else {
      window.addEventListener('load', function() {
        setTimeout(function() {
          loaded = true;
        }, 0);
      });
    }
    return function onpopstate(e) {
      if (!loaded) return;
      if (e.state) {
        var path = e.state.path;
        page.replace(path, e.state);
      } else {
        page.show(location.pathname + location.hash, undefined, undefined, false);
      }
    };
  })();
  /**
   * Handle "click" events.
   */

  function onclick(e) {

    if (1 !== which(e)) return;

    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;



    // ensure link
    // use shadow dom when available
    var el = e.path ? e.path[0] : e.target;
    while (el && 'A' !== el.nodeName) el = el.parentNode;
    if (!el || 'A' !== el.nodeName) return;



    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (!hashbang && el.pathname === location.pathname && (el.hash || '#' === link)) return;



    // Check for mailto: in the href
    if (link && link.indexOf('mailto:') > -1) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(el.href)) return;



    // rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    // strip leading "/[drive letter]:" on NW.js on Windows
    if (typeof process !== 'undefined' && path.match(/^\/[a-zA-Z]:\//)) {
      path = path.replace(/^\/[a-zA-Z]:\//, '/');
    }

    // same page
    var orig = path;

    if (path.indexOf(base) === 0) {
      path = path.substr(base.length);
    }

    if (hashbang) path = path.replace('#!', '');

    if (base && orig === path) return;

    e.preventDefault();
    page.show(orig);
  }

  /**
   * Event button.
   */

  function which(e) {
    e = e || window.event;
    return null === e.which ? e.button : e.which;
  }

  /**
   * Check if `href` is the same origin.
   */

  function sameOrigin(href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return (href && (0 === href.indexOf(origin)));
  }

  page.sameOrigin = sameOrigin;

}).call(this,require('_process'))

},{"_process":1,"path-to-regexp":28}],28:[function(require,module,exports){
var isarray = require('isarray')

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp
module.exports.parse = parse
module.exports.compile = compile
module.exports.tokensToFunction = tokensToFunction
module.exports.tokensToRegExp = tokensToRegExp

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

/**
 * Parse a string for the raw tokens.
 *
 * @param  {String} str
 * @return {Array}
 */
function parse (str) {
  var tokens = []
  var key = 0
  var index = 0
  var path = ''
  var res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0]
    var escaped = res[1]
    var offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    var prefix = res[2]
    var name = res[3]
    var capture = res[4]
    var group = res[5]
    var suffix = res[6]
    var asterisk = res[7]

    var repeat = suffix === '+' || suffix === '*'
    var optional = suffix === '?' || suffix === '*'
    var delimiter = prefix || '/'
    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?')

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      pattern: escapeGroup(pattern)
    })
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index)
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path)
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {String}   str
 * @return {Function}
 */
function compile (str) {
  return tokensToFunction(parse(str))
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^' + tokens[i].pattern + '$')
    }
  }

  return function (obj) {
    var path = ''
    var data = obj || {}

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]

      if (typeof token === 'string') {
        path += token

        continue
      }

      var value = data[token.name]
      var segment

      if (value == null) {
        if (token.optional) {
          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encodeURIComponent(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      segment = encodeURIComponent(value)

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {String} str
 * @return {String}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g)

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        pattern: null
      })
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = []

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source)
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function stringToRegexp (path, keys, options) {
  var tokens = parse(path)
  var re = tokensToRegExp(tokens, options)

  // Attach keys back to the regexp.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] !== 'string') {
      keys.push(tokens[i])
    }
  }

  return attachKeys(re, keys)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {Array}  tokens
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function tokensToRegExp (tokens, options) {
  options = options || {}

  var strict = options.strict
  var end = options.end !== false
  var route = ''
  var lastToken = tokens[tokens.length - 1]
  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken)

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]

    if (typeof token === 'string') {
      route += escapeString(token)
    } else {
      var prefix = escapeString(token.prefix)
      var capture = token.pattern

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*'
      }

      if (token.optional) {
        if (prefix) {
          capture = '(?:' + prefix + '(' + capture + '))?'
        } else {
          capture = '(' + capture + ')?'
        }
      } else {
        capture = prefix + '(' + capture + ')'
      }

      route += capture
    }
  }

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'
  }

  if (end) {
    route += '$'
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithSlash ? '' : '(?=\\/|$)'
  }

  return new RegExp('^' + route, flags(options))
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */
function pathToRegexp (path, keys, options) {
  keys = keys || []

  if (!isarray(keys)) {
    options = keys
    keys = []
  } else if (!options) {
    options = {}
  }

  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys, options)
  }

  if (isarray(path)) {
    return arrayToRegexp(path, keys, options)
  }

  return stringToRegexp(path, keys, options)
}

},{"isarray":29}],29:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],30:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12}],31:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],32:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"./fonts/system-medium":30,"./fonts/system-micro":31,"dup":14}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _resource = require('../lib/resource');

var _resource2 = _interopRequireDefault(_resource);

var _displayCoupler = require('display-coupler');

var _displayCoupler2 = _interopRequireDefault(_displayCoupler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Display = function () {
  function Display($el, displayKey) {
    _classCallCheck(this, Display);

    this.$el = $el;
    this.displayKey = displayKey;
  }

  _createClass(Display, [{
    key: 'load',
    value: function load(width, dimensions, callback) {
      var _this = this;

      this.render(width, dimensions);

      var displayCoupler = new _displayCoupler2.default(firebase.database());
      displayCoupler.connect(this.displayKey, {
        onReady: function onReady(displayData, next) {
          next();
        },
        onPixelChange: function onPixelChange(y, x, hex, displayData) {
          displayData = displayData || {};
          _this.refreshPixelByCoordinates(y, x, hex, displayData);
        }
      });
      callback();
    }
  }, {
    key: 'demo',
    value: function demo(macro, macroConfig, width, dimensions, callback) {
      var _this2 = this;

      var displayConfig = {
        macro: macro,
        macroConfig: macroConfig,
        width: dimensions.width,
        height: dimensions.height
      };

      this.render(width, dimensions);

      var displayCoupler = new _displayCoupler2.default();
      displayCoupler.demo(displayConfig, {
        onReady: function onReady(displayData, next) {
          next();
        },
        onPixelChange: function onPixelChange(y, x, hex, displayData) {
          displayData = displayData || {};
          _this2.refreshPixelByCoordinates(y, x, hex, displayData);
        }
      });
      callback();
    }
  }, {
    key: 'render',
    value: function render(width, dimensions) {
      this.$el.html('\n      <div class="display">\n        <div class="top"></div>\n        <div class="right"></div>\n        <div class="front"></div>\n      </div>\n    ');

      var adjustedBrightness = (50 + 100 / 2) / 100,
          size = (width - 20) / dimensions.width;

      for (var y = 0; y < dimensions.height; y++) {
        var $row = $('<div class="matrix-row" style="opacity: ' + adjustedBrightness + '; height: ' + size + 'px; line-height: ' + size + 'px;">');
        for (var x = 0; x < dimensions.width; x++) {
          $row.append('\n          <span class="matrix-dot-wrapper" style="width: ' + size + 'px; height: ' + size + 'px;">\n            <div class="matrix-dot" data-y="' + y + '" data-x="' + x + '" data-coordinates="' + y + ':' + x + '" style="background-color: #444">\n          </span>\n        ');
        }
        this.$el.find('.front').append($row);
      }
    }
  }, {
    key: 'refreshPixelByCoordinates',
    value: function refreshPixelByCoordinates(y, x, hex, displayData) {
      var el = document.querySelectorAll('[data-coordinates=\'' + y + ':' + x + '\']');
      if (el.length > 0) {
        el[0].style.background = hex === '#000000' ? '#444' : hex;
      }
    }
  }]);

  return Display;
}();

function shadeHex(color, percent) {
  var f = parseInt(color.slice(1), 16),
      t = percent < 0 ? 0 : 255,
      p = percent < 0 ? percent * -1 : percent,
      R = f >> 16,
      G = f >> 8 & 0x00FF,
      B = f & 0x0000FF;
  return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}

exports.default = Display;

},{"../lib/resource":35,"display-coupler":2}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _userManager = require('../managers/user-manager');

var _userManager2 = _interopRequireDefault(_userManager);

var _displayManager = require('../managers/display-manager');

var _displayManager2 = _interopRequireDefault(_displayManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var userManager = new _userManager2.default(),
    displayManager = new _displayManager2.default();

var Header = function () {
  function Header($el) {
    _classCallCheck(this, Header);

    this.$el = $el;
  }

  _createClass(Header, [{
    key: 'render',
    value: function render() {
      var _this = this;

      this.$el.html('\n      <header class="navbar navbar-static-top" style="border-radius: 0;">\n        <div class="pull-right">\n          <img src="" class="avatar" style="border-radius: 20px; width: 40px; height: 40px;"/>\n        </div>\n        <a class="navbar-brand" href="/">BIGDOTS</a>\n      </header>\n    ');

      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          _this.$el.find('header').removeClass('logged-out');
          _this.$el.find('.avatar').attr('src', user.photoURL);
          $signedOut.hide();
          $signedIn.show();

          var identity = {
            name: user.displayName,
            profileImageUrl: user.photoURL,
            uid: user.uid
          };

          userManager.updateIdentity(user.uid, identity, function () {
            // Something...
          });
        } else {
          _this.$el.find('header').addClass('logged-out');
          _this.$el.find('.user-signed-out').show();
          $signedIn.hide();
          $signedOut.show();
        }
      });

      this.$el.find('.sign-in').click(function (ev) {
        ev.preventDefault();
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function (result) {
          var user = result.user;
          _this.$el.find('.avatar').attr('src', user.photoURL);
          $signedOut.hide();
          $signedIn.show();
        }).catch(function (error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
        });
      });
    }
  }]);

  return Header;
}();

exports.default = Header;

},{"../managers/display-manager":37,"../managers/user-manager":39}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Resource = function () {
  function Resource() {
    _classCallCheck(this, Resource);
  }

  _createClass(Resource, [{
    key: 'matrix',
    value: function matrix(id) {
      return firebase.database().ref('matrices/' + id);
    }
  }, {
    key: 'matrixPixel',
    value: function matrixPixel(id, y, x) {
      return firebase.database().ref('matrices/' + id + '/' + y + ':' + x);
    }
  }, {
    key: 'displays',
    value: function displays() {
      return firebase.database().ref('displays');
    }
  }, {
    key: 'display',
    value: function display(id) {
      return firebase.database().ref('displays/' + id);
    }
  }, {
    key: 'displayConnectedHardware',
    value: function displayConnectedHardware(id) {
      return firebase.database().ref('displays/' + id + '/connectedHardware');
    }
  }, {
    key: 'displayMacroConfig',
    value: function displayMacroConfig(id, mode) {
      return firebase.database().ref('displays/' + id + '/macros/' + mode);
    }
  }, {
    key: 'displayOwners',
    value: function displayOwners(id) {
      return firebase.database().ref('displays/' + id + '/owners');
    }
  }, {
    key: 'macros',
    value: function macros() {
      return firebase.database().ref('macros');
    }
  }, {
    key: 'hardwares',
    value: function hardwares() {
      return firebase.database().ref('hardware');
    }
  }, {
    key: 'hardware',
    value: function hardware(id) {
      return firebase.database().ref('hardware/' + id);
    }
  }, {
    key: 'userIdentity',
    value: function userIdentity(id) {
      return firebase.database().ref('users/public/' + id + '/identity');
    }
  }, {
    key: 'userDisplays',
    value: function userDisplays(id) {
      return firebase.database().ref('users/private/' + id + '/displays');
    }
  }]);

  return Resource;
}();

exports.default = Resource;

},{}],36:[function(require,module,exports){
'use strict';

var _page = require('page');

var _page2 = _interopRequireDefault(_page);

var _displayPage = require('./pages/display-page');

var _displayPage2 = _interopRequireDefault(_displayPage);

var _createDisplayPage = require('./pages/create-display-page');

var _createDisplayPage2 = _interopRequireDefault(_createDisplayPage);

var _homePage = require('./pages/home-page');

var _homePage2 = _interopRequireDefault(_homePage);

var _dashboardPage = require('./pages/dashboard-page');

var _dashboardPage2 = _interopRequireDefault(_dashboardPage);

var _installMacrosPage = require('./pages/install-macros-page');

var _installMacrosPage2 = _interopRequireDefault(_installMacrosPage);

var _howToBuildADisplayPage = require('./pages/how-to-build-a-display-page');

var _howToBuildADisplayPage2 = _interopRequireDefault(_howToBuildADisplayPage);

var _header = require('./components/header');

var _header2 = _interopRequireDefault(_header);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

firebase.initializeApp({
  apiKey: "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
  authDomain: "led-fiesta.firebaseapp.com",
  databaseURL: "https://led-fiesta.firebaseio.com",
  storageBucket: "led-fiesta.appspot.com"
});

(0, _page2.default)('/my/dashboard', function () {
  new _dashboardPage2.default().render();
});

(0, _page2.default)('/displays/new', function () {
  new _createDisplayPage2.default().render();
});

(0, _page2.default)('/displays/:id', function (ctx) {
  new _displayPage2.default({
    id: ctx.params.id
  }).render();
});

(0, _page2.default)('/install-macros', function () {
  new _installMacrosPage2.default().render();
});

(0, _page2.default)('/how-to-build-a-display', function () {
  new _howToBuildADisplayPage2.default().render();
});

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    new _header2.default($('.header')).render();
    (0, _page2.default)();
  }
});

},{"./components/header":34,"./pages/create-display-page":43,"./pages/dashboard-page":44,"./pages/display-page":45,"./pages/home-page":46,"./pages/how-to-build-a-display-page":47,"./pages/install-macros-page":48,"page":27}],37:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _resource = require('../lib/resource');

var _resource2 = _interopRequireDefault(_resource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DisplayManager = function () {
  function DisplayManager() {
    _classCallCheck(this, DisplayManager);
  }

  _createClass(DisplayManager, [{
    key: 'create',
    value: function create(matrix, config, uid, cb) {
      var matrixKey = firebase.database().ref('matrices').push().key,
          displayKey = firebase.database().ref('displays').push().key;

      new _resource2.default().matrix(matrixKey).set(matrix).then(function () {
        new _resource2.default().display(displayKey).set(config).then(function () {
          var data = {};
          data[displayKey] = true;

          new _resource2.default().userDisplays(uid).update(data).then(function () {
            cb(displayKey);
          });
        });
      });
    }
  }, {
    key: 'getUserDisplays',
    value: function getUserDisplays(uid, callback) {
      var _this = this;

      new _resource2.default().userDisplays(uid).once('value').then(function (snapshot) {
        var displayKeys = Object.keys(snapshot.val()),
            assembledDisplays = [];

        displayKeys.forEach(function (displayKey) {
          _this.getDisplay(displayKey, function (displayData) {
            assembledDisplays.push(displayData);

            if (assembledDisplays.length == displayKeys.length) {
              callback(displayKeys, assembledDisplays);
            }
          });
        });
      });
    }
  }, {
    key: 'getOwners',
    value: function getOwners(key, callback) {
      new _resource2.default().displayOwners(key).once('value').then(function (snapshot) {
        var userKeys = Object.keys(snapshot.val()),
            assembledUsers = [];

        userKeys.forEach(function (userKey) {
          new _resource2.default().userIdentity(userKey).once('value').then(function (identity) {
            assembledUsers.push(identity.val());

            if (assembledUsers.length == userKeys.length) {
              callback(userKeys, assembledUsers);
            }
          });
        });
      });
    }
  }, {
    key: 'getDisplay',
    value: function getDisplay(key, callback) {
      new _resource2.default().display(key).once('value').then(function (snapshot) {
        callback(snapshot.val());
      });
    }
  }, {
    key: 'getDisplay',
    value: function getDisplay(key, callback) {
      new _resource2.default().display(key).once('value').then(function (snapshot) {
        callback(snapshot.val());
      });
    }
  }, {
    key: 'update',
    value: function update(key, config, cb) {
      new _resource2.default().display(key).update(config).then(function () {
        cb();
      });
    }
  }]);

  return DisplayManager;
}();

exports.default = DisplayManager;

},{"../lib/resource":35}],38:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _resource = require('../lib/resource');

var _resource2 = _interopRequireDefault(_resource);

var _macroLibrary = require('macro-library');

var _macroLibrary2 = _interopRequireDefault(_macroLibrary);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MacroManager = function () {
  function MacroManager() {
    _classCallCheck(this, MacroManager);
  }

  _createClass(MacroManager, [{
    key: 'install',
    value: function install(key, config, cb) {
      var data = {};
      data[key] = config;

      new _resource2.default().macros().update(data).then(function () {
        cb(key);
      });
    }
  }, {
    key: 'getInstalledMacros',
    value: function getInstalledMacros(callback) {
      new _resource2.default().macros().once('value').then(function (snapshot) {
        callback(snapshot.val());
      });
    }
  }, {
    key: 'getAvailableMacros',
    value: function getAvailableMacros() {
      var macroLibrary = new _macroLibrary2.default();
      macroLibrary.registerMacros();
      return macroLibrary.availableMacros();
    }
  }]);

  return MacroManager;
}();

exports.default = MacroManager;

},{"../lib/resource":35,"macro-library":15}],39:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _resource = require('../lib/resource');

var _resource2 = _interopRequireDefault(_resource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UserManager = function () {
  function UserManager() {
    _classCallCheck(this, UserManager);
  }

  _createClass(UserManager, [{
    key: 'create',
    value: function create(matrix, config, cb) {
      var matrixKey = firebase.database().ref('matrices').push().key,
          displayKey = firebase.database().ref('displays').push().key;

      new _resource2.default().matrix(matrixKey).set(matrix).then(function () {
        new _resource2.default().display(displayKey).set(config).then(function () {
          cb(displayKey);
        });
      });
    }
  }, {
    key: 'getDisplay',
    value: function getDisplay(key, callback) {
      new _resource2.default().display(key).once('value').then(function (snapshot) {
        callback(snapshot.val());
      });
    }
  }, {
    key: 'updateIdentity',
    value: function updateIdentity(key, identity, cb) {
      new _resource2.default().userIdentity(key).update(identity).then(function () {
        cb();
      });
    }
  }]);

  return UserManager;
}();

exports.default = UserManager;

},{"../lib/resource":35}],40:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _page = require('page');

var _page2 = _interopRequireDefault(_page);

var _modal = require('./modal');

var _modal2 = _interopRequireDefault(_modal);

var _displayManager = require('../managers/display-manager');

var _displayManager2 = _interopRequireDefault(_displayManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ApiUsageModal = function (_Modal) {
  _inherits(ApiUsageModal, _Modal);

  function ApiUsageModal($el, displayKey, displayData) {
    _classCallCheck(this, ApiUsageModal);

    var _this = _possibleConstructorReturn(this, (ApiUsageModal.__proto__ || Object.getPrototypeOf(ApiUsageModal)).call(this, $el));

    _this.displayKey = displayKey;
    _this.displayData = displayData;
    return _this;
  }

  _createClass(ApiUsageModal, [{
    key: '$',
    value: function $(selector) {
      return this.$el.find(selector);
    }
  }, {
    key: 'render',
    value: function render() {
      this.$el.html('\n      <div id="api-usage" class="modal fade">\n        <div class="modal-dialog" role="document">\n          <div class="modal-content">\n            <div class="modal-header">\n              <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n                <span aria-hidden="true">&times;</span>\n              </button>\n              <h4 class="modal-title">Using the API</h4>\n            </div>\n            <div class="modal-body">\n              <p class="alert alert-danger">\n                Treat <strong>' + this.displayData.matrix + '</strong> like an <strong>API SECRET</strong>. Whoever possesses it can write to this LED board.\n              </p>\n              <h5>Updating one point</h5>\n              <p>To update a specific point on your Display, replace <strong>Y</strong> and <strong>X</strong> with the coordinate to update</p>\n              <pre>\nhttps://led-fiesta.firebaseio.com/matrices/' + this.displayData.matrix + '/Y:X.json\'</pre>\n              </pre>\n              <p>Then just perform a PATCH request to update the point and pass json with the <strong>hex</strong> color and the <strong>updatedAt</strong> timestamp. Here is a curl example that you can run from the commandline.</p>\n              <pre>\ncurl -X PATCH -d \'{\n  "hex": "#FFFFFF",\n  "updatedAt": ' + new Date().getTime() + '\n}\'   \'https://led-fiesta.firebaseio.com/matrices/' + this.displayData.matrix + '/0:0.json\'\n              </pre>\n              <h5>Updating multiple points</h5>\n              <pre>\ncurl -X PATCH -d \'{\n  "0:0": {\n    "hex": "#FFFFFF",\n    "updatedAt": ' + new Date().getTime() + '\n  },\n  "0:1": {\n    "hex": "#FFFFFF",\n    "updatedAt": ' + new Date().getTime() + '\n  },\n  "0:2": {\n    "hex": "#FFFFFF",\n    "updatedAt": ' + new Date().getTime() + '\n  }\n}\'   \'https://led-fiesta.firebaseio.com/matrices/' + this.displayData.matrix + '.json\'\n              </pre>\n            </div>\n          </div>\n        </div>\n      </div>\n    ');
    }
  }]);

  return ApiUsageModal;
}(_modal2.default);

exports.default = ApiUsageModal;

},{"../managers/display-manager":37,"./modal":42,"page":27}],41:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _page = require('page');

var _page2 = _interopRequireDefault(_page);

var _modal = require('./modal');

var _modal2 = _interopRequireDefault(_modal);

var _displayManager = require('../managers/display-manager');

var _displayManager2 = _interopRequireDefault(_displayManager);

var _macroManager = require('../managers/macro-manager');

var _macroManager2 = _interopRequireDefault(_macroManager);

var _typewriter = require('typewriter');

var _typewriter2 = _interopRequireDefault(_typewriter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var macroManager = new _macroManager2.default(),
    displayManager = new _displayManager2.default();

var EditDisplayModal = function (_Modal) {
  _inherits(EditDisplayModal, _Modal);

  function EditDisplayModal($el, displayKey, displayData) {
    _classCallCheck(this, EditDisplayModal);

    var _this = _possibleConstructorReturn(this, (EditDisplayModal.__proto__ || Object.getPrototypeOf(EditDisplayModal)).call(this, $el));

    _this.displayKey = displayKey;
    _this.displayData = displayData;
    return _this;
  }

  _createClass(EditDisplayModal, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      this.$el.html('\n      <div id="edit-display" class="modal fade">\n        <div class="modal-dialog" role="document">\n          <div class="modal-content">\n            <div class="modal-header">\n              <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n                <span aria-hidden="true">&times;</span>\n              </button>\n              <h4 class="modal-title">Edit Display</h4>\n            </div>\n            <div class="modal-body">\n              <form>\n                <ul class="nav nav-tabs">\n                  <li class="nav-item">\n                    <a class="nav-link active" data-toggle="tab" href="#edit-general">General</a>\n                  </li>\n                  <li class="nav-item">\n                    <a class="nav-link" data-toggle="tab" href="#edit-owners">Owners</a>\n                  </li>\n                  <li class="nav-item">\n                    <a class="nav-link" data-toggle="tab" href="#edit-macro">Macro</a>\n                  </li>\n                </ul>\n                <div class="tab-content">\n                  <br />\n                  <div id="edit-general" class="tab-pane active">\n                    <div class="row">\n                      <div class="col-xs-12">\n                        <fieldset class="form-group">\n                          <label for="display-name">Display name</label>\n                          <input type="name" name="display-name" class="form-control" id="display-name" />\n                        </fieldset>\n                      </div>\n                    </div>\n                    <div class="row">\n                      <div class="col-xs-12 col-sm-6">\n                        <fieldset class="form-group">\n                          <label for="display-width">Select width</label>\n                          <select class="form-control" id="display-width" name="width">\n                            <option value="16">16</option>\n                            <option value="32">32</option>\n                            <option value="64">64</option>\n                            <option value="96">96</option>\n                            <option value="128">128</option>\n                          </select>\n                        </fieldset>\n                      </div>\n                      <div class="col-xs-12 col-sm-6">\n                        <fieldset class="form-group">\n                          <label for="display-height">Select height</label>\n                          <select class="form-control" id="display-height" name="height">\n                            <option value="16">16</option>\n                            <option value="32">32</option>\n                            <option value="64">64</option>\n                            <option value="96">96</option>\n                            <option value="128">128</option>\n                          </select>\n                        </fieldset>\n                      </div>\n                    </div>\n                  </div>\n                  <div id="edit-owners" class="tab-pane">\n                    <ul id="display-owners" class="list-group"></ul>\n                  </div>\n                  <div id="edit-macro" class="tab-pane">\n                    <div class="row">\n                      <div class="col-xs-12">\n                        <fieldset class="form-group">\n                          <label for="macro">Select macro</label>\n                          <select name="macro" class="form-control" id="macro"></select>\n                        </fieldset>\n                      </div>\n                    </div>\n                    <div class="programmable options row" style="display: none;">\n                      <div class="col-xs-12">\n                        <p class="programmable description"></p>\n                        <p>Warning you need programming skills to use this display macro. Learn more about this option <a href="#">here.</a>\n                      </div>\n                    </div>\n                    <div class="twinkle options row" style="display: none;">\n                      <div class="col-xs-12">\n                        <p class="twinkle description"></p>\n                        <fieldset class="form-group">\n                          <h5>Macro options</h5>\n                          <label for="twinkle-base-color">Seed Color</label>\n                          <div class="input-group colorpicker-component">\n                            <input type="text" id="twinkle-seed-color" value="#006e91" class="form-control" />\n                            <span class="input-group-addon"><i></i></span>\n                          </div>\n                          <small class="text-muted">The brightest hex value you want to display</small>\n                        </fieldset>\n                      </div>\n                    </div>\n                    <div class="solid-color options row" style="display: none;">\n                      <div class="col-xs-12">\n                        <p class="solid-color description"></p>\n                        <fieldset class="form-group">\n                          <h5>Macro options</h5>\n                          <label for="solid-color">Color</label>\n                          <div class="input-group colorpicker-component">\n                            <input type="text" id="solid-color" value="#006e91" class="form-control" />\n                            <span class="input-group-addon"><i></i></span>\n                          </div>\n                        </fieldset>\n                      </div>\n                    </div>\n                    <div class="text options row" style="display: none;">\n                      <div class="col-xs-12">\n                        <p class="text description"></p>\n                        <div class="row">\n                          <div class="col-xs-12">\n                            <h5>Macro options</h5>\n                            <div class="form-group">\n                              <label for="solid-color">Color</label>\n                              <div class="input-group colorpicker-component">\n                                <input type="text" id="text-color" value="#006e91" class="form-control" />\n                                <span class="input-group-addon"><i></i></span>\n                              </div>\n                            </div>\n                            <div class="form-group">\n                              <label for="text-value">Text</label>\n                              <input type="text" id="text-value" placeholder="What you want displayed..." class="form-control" />\n                            </div>\n                            <div class="form-group">\n                              <label for="text-font">Select font</label>\n                              <select class="form-control" id="text-fonts"></select>\n                            </div>\n                            <div class="form-group">\n                              <label for="text-speed">Marquee speed</label>\n                              <select class="form-control" id="text-marquee-speed" name="speed">\n                                <option value="1">1</option>\n                                <option value="10">10</option>\n                                <option value="50">50</option>\n                                <option value="100">100</option>\n                                <option value="250">250</option>\n                                <option value="500">500</option>\n                              </select>\n                              <p class="form-text text-muted">\n                                The speed the text is scrolling, in milliseconds\n                              </p>\n                            </div>\n                            <div class="form-group">\n                              <label for="text-speed">Marquee initial delay</label>\n                              <select class="form-control" id="text-marquee-initial-delay">\n                                <option value="100">100</option>\n                                <option value="200">200</option>\n                                <option value="500">500</option>\n                                <option value="1000">1000</option>\n                                <option value="2000">2000</option>\n                                <option value="3000">3000</option>\n                                <option value="4000">4000</option>\n                                <option value="5000">5000</option>\n                              </select>\n                              <p class="form-text text-muted">\n                                The delay before the text starts scrolling, in milliseconds\n                              </p>\n                            </div>\n                          </div>\n                        </div>\n                      </div>\n                    </div>\n                  </div>\n                </div>\n                <br /><br />\n                <button type="submit" class="btn btn-success">Update</button>\n              </form>\n            </div>\n          </div>\n        </div>\n      </div>\n    ');

      this.populateMacros();
      this.populateOwners();
      this.populateFonts();

      this.$('#edit-display').on('show.bs.modal', function () {
        _this2.$('select#macro').val(_this2.displayData.macro).change();
        _this2.$('select#display-width').val(_this2.displayData.width).change();
        _this2.$('select#display-height').val(_this2.displayData.height).change();
      });
      this.$('#display-name').val(this.displayData.name);

      this.$('.colorpicker-component').colorpicker();

      var $twinkleOptions = this.$('.options.twinkle'),
          $programmableOptions = this.$('.options.programmable'),
          $solidColorOptions = this.$('.options.solid-color'),
          $textOptions = this.$('.options.text');

      this.$('select#macro').change(function (el) {
        $twinkleOptions.hide();
        $programmableOptions.hide();
        $solidColorOptions.hide();
        $textOptions.hide();

        if (this.value === 'twinkle') {
          $twinkleOptions.show();
        } else if (this.value == 'programmable') {
          $programmableOptions.show();
        } else if (this.value == 'solid-color') {
          $solidColorOptions.show();
        } else if (this.value == 'text') {
          $textOptions.show();
        }
      });

      this.$('form').submit(function (ev) {
        ev.preventDefault();

        var newData = {
          macro: _this2.$('select#macro').val(),
          name: _this2.$('#display-name').val()
        };

        if (newData.macro === 'twinkle') {
          newData.macroConfig = {
            seedColor: _this2.$('#twinkle-seed-color').val()
          };
        } else if (newData.macro === 'solid-color') {
          newData.macroConfig = {
            color: _this2.$('#solid-color').val()
          };
        } else if (newData.macro === 'text') {
          newData.macroConfig = {
            color: _this2.$('#text-color').val(),
            text: _this2.$('#text-value').val().toUpperCase(),
            font: _this2.$('#text-fonts').val(),
            marqueeSpeed: _this2.$('#text-marquee-speed').val(),
            marqueeInitialDelay: _this2.$('#text-marquee-initial-delay').val()
          };
        }

        displayManager.update(_this2.displayKey, newData, function (displayKey) {
          _this2.$('#edit-display').modal('hide');

          // Why doesn't this happen automatically?!
          $('body').removeClass('modal-open');
          $('.modal-backdrop').remove();

          (0, _page2.default)('/displays/' + _this2.displayKey);
        });
      });
    }
  }, {
    key: 'populateMacros',
    value: function populateMacros() {
      var _this3 = this;

      var $macrosSelect = this.$('select#macro');
      macroManager.getInstalledMacros(function (macros) {
        for (var key in macros) {
          $macrosSelect.append('<option value=' + key + '>' + macros[key].name + '</option>');
          _this3.$('.description.' + key).text(macros[key].description);
        }
      });
    }
  }, {
    key: 'populateFonts',
    value: function populateFonts() {
      var $fontsSelect = this.$('select#text-fonts');
      _typewriter2.default.availableFonts().forEach(function (font) {
        $fontsSelect.append('<option value=' + font + '>' + font + '</option>');
      });
    }
  }, {
    key: 'populateOwners',
    value: function populateOwners() {
      var _this4 = this;

      displayManager.getOwners(this.displayKey, function (userskeys, users) {
        var $displayOwners = _this4.$('#display-owners');
        users.forEach(function (user) {
          $displayOwners.append('\n          <li class="list-group-item">\n            <img src="' + user.profileImageUrl + '" style="width: 40px; height: 40px; border-radius: 20px;" />\n            ' + user.name + '\n          </li>\n        ');
        });
      });
    }
  }]);

  return EditDisplayModal;
}(_modal2.default);

exports.default = EditDisplayModal;

},{"../managers/display-manager":37,"../managers/macro-manager":38,"./modal":42,"page":27,"typewriter":32}],42:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Modal = function () {
  function Modal($el) {
    _classCallCheck(this, Modal);

    this.$el = $el;
  }

  _createClass(Modal, [{
    key: "$",
    value: function $(selector) {
      return this.$el.find(selector);
    }
  }]);

  return Modal;
}();

exports.default = Modal;

},{}],43:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _page = require('page');

var _page2 = _interopRequireDefault(_page);

var _displayManager = require('../managers/display-manager');

var _displayManager2 = _interopRequireDefault(_displayManager);

var _resource = require('../lib/resource');

var _resource2 = _interopRequireDefault(_resource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CreateDisplayPage = function (_Page) {
  _inherits(CreateDisplayPage, _Page);

  function CreateDisplayPage() {
    _classCallCheck(this, CreateDisplayPage);

    return _possibleConstructorReturn(this, (CreateDisplayPage.__proto__ || Object.getPrototypeOf(CreateDisplayPage)).apply(this, arguments));
  }

  _createClass(CreateDisplayPage, [{
    key: 'render',
    value: function render() {
      this.$el.html('\n      <h1>\n        Create a Display\n      </h1>\n      <hr />\n      <div class="row">\n        <div class="col-xs-12 col-sm-6">\n          <form>\n            <fieldset class="form-group">\n              <label for="name">Display name</label>\n              <input type="text" class="form-control" id="display-name" placeholder="My cool display" />\n              <small class="text-muted">This will function as a label</small>\n            </fieldset>\n            <div class="row">\n              <div class="col-xs-12 col-sm-6">\n                <fieldset class="form-group">\n                  <label for="display-width">Select width</label>\n                  <select class="form-control" id="display-width" name="width">\n                    <option value="16">16</option>\n                    <option value="32">32</option>\n                    <option value="64">64</option>\n                    <option value="96">96</option>\n                    <option value="128">128</option>\n                  </select>\n                </fieldset>\n              </div>\n              <div class="col-xs-12 col-sm-6">\n                <fieldset class="form-group">\n                  <label for="display-height">Select height</label>\n                  <select class="form-control" id="display-height" name="height">\n                    <option value="16">16</option>\n                    <option value="32">32</option>\n                    <option value="64">64</option>\n                    <option value="96">96</option>\n                    <option value="128">128</option>\n                  </select>\n                </fieldset>\n              </div>\n            </div>\n            <button type="submit" class="btn btn-success pull-right">Create Display</button>\n          </form>\n        </div>\n      </div>\n    ');

      this.$el.find('form').submit(function (ev) {
        ev.preventDefault();

        var displayName = $('#display-name').val(),
            displayWidth = parseInt($('#display-width').val(), 10),
            displayHeight = parseInt($('#display-height').val(), 10);

        var matrixData = assembleMartix(displayWidth, displayHeight),
            uid = firebase.auth().currentUser.uid;

        new _displayManager2.default().create(matrixData, {
          brightness: 100,
          name: displayName,
          width: displayWidth,
          height: displayHeight
        }, uid, function (displayKey) {
          (0, _page2.default)('/displays/' + displayKey);
        });
      });
    }
  }]);

  return CreateDisplayPage;
}(_page2.default);

function assembleMartix(width, height) {
  var matrix = {};
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      matrix[y + ':' + x] = {
        hex: '#000000',
        updatedAt: Date.now()
      };
    }
  }

  return matrix;
}

exports.default = CreateDisplayPage;

},{"../lib/resource":35,"../managers/display-manager":37,"page":27}],44:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _displayManager = require('../managers/display-manager');

var _displayManager2 = _interopRequireDefault(_displayManager);

var _page = require('./page');

var _page2 = _interopRequireDefault(_page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var displayManager = new _displayManager2.default();

var DashboardPage = function (_Page) {
  _inherits(DashboardPage, _Page);

  function DashboardPage() {
    _classCallCheck(this, DashboardPage);

    return _possibleConstructorReturn(this, (DashboardPage.__proto__ || Object.getPrototypeOf(DashboardPage)).apply(this, arguments));
  }

  _createClass(DashboardPage, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      this.$el.html('\n      <div class="displays"></div>\n    ');

      var uid = firebase.auth().currentUser.uid;
      displayManager.getUserDisplays(uid, function (displayKeys, displays) {
        var $displays = _this2.$el.find('.displays');
        displays.forEach(function (display, i) {
          $displays.append('\n          <a href="/displays/' + displayKeys[i] + '">' + display.name + '</a>\n        ');
        });
      });
    }
  }]);

  return DashboardPage;
}(_page2.default);

exports.default = DashboardPage;

},{"../managers/display-manager":37,"./page":49}],45:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _display = require('../components/display');

var _display2 = _interopRequireDefault(_display);

var _page = require('./page');

var _page2 = _interopRequireDefault(_page);

var _editDisplayModal = require('../modals/edit-display-modal');

var _editDisplayModal2 = _interopRequireDefault(_editDisplayModal);

var _apiUsageModal = require('../modals/api-usage-modal');

var _apiUsageModal2 = _interopRequireDefault(_apiUsageModal);

var _displayManager = require('../managers/display-manager');

var _displayManager2 = _interopRequireDefault(_displayManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var displayManager = new _displayManager2.default();

var DisplayPage = function (_Page) {
  _inherits(DisplayPage, _Page);

  function DisplayPage(config) {
    _classCallCheck(this, DisplayPage);

    var _this = _possibleConstructorReturn(this, (DisplayPage.__proto__ || Object.getPrototypeOf(DisplayPage)).call(this));

    _this.id = config.id;
    return _this;
  }

  _createClass(DisplayPage, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      this.$el.html('\n      <div class="frame" style="display: none;">\n        <div class="display-meta" style="display: none;">\n          <a href="#" class="btn btn-link pull-right change-macro" data-toggle="modal" data-target="#edit-display">\n            <span class="display-macro"></span>\n            <i class="fa fa-pencil"></i>\n          </a>\n          <span class="display-name text-left"></span>\n        </div>\n        <div class=\'matrix-container\'></div>\n        <div class="display-meta" style="display: none;">\n          <a href="#" class="btn btn-link pull-right api-usage" data-toggle="modal" data-target="#api-usage">\n            Using the API...\n          </a>\n        </div>\n        <div class="edit-display-modal"></div>\n        <div class="api-usage-modal"></div>\n      </div>\n    ');

      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          _this2.$('.display-meta').show();
        } else {
          _this2.$('.display-meta').hide();
        }
      });

      var display = new _display2.default(this.$('.matrix-container'), this.id);

      displayManager.getDisplay(this.id, function (displayData) {
        var dimensions = {
          width: displayData.width,
          height: displayData.height
        };

        display.load($('.frame').width(), dimensions, function () {
          _this2.$('.display-name').text(displayData.name);
          _this2.$('.display-macro').text(displayData.macro);
          _this2.$('.frame').fadeIn();
        });

        var $editDisplayModal = _this2.$('.edit-display-modal');
        new _editDisplayModal2.default($editDisplayModal, _this2.id, displayData).render();

        var $apiUsageModal = _this2.$('.api-usage-modal');
        new _apiUsageModal2.default($apiUsageModal, _this2.id, displayData).render();
      });
    }
  }]);

  return DisplayPage;
}(_page2.default);

exports.default = DisplayPage;

},{"../components/display":33,"../managers/display-manager":37,"../modals/api-usage-modal":40,"../modals/edit-display-modal":41,"./page":49}],46:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _display = require('../components/display');

var _display2 = _interopRequireDefault(_display);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HomePage = function () {
  function HomePage() {
    _classCallCheck(this, HomePage);

    this.$el = $('');
  }

  _createClass(HomePage, [{
    key: 'render',
    value: function render() {
      this.$el.html('\n      <header class="navbar navbar-static-top navbar-dark logged-out" style="border-radius: 0;">\n        <div class="pull-right">\n          <a href="#" class="btn btn-secondary sign-in">Sign in</a>\n        </div>\n        <a class="navbar-brand" href="/">BIGDOTS</a>\n        <div class="demo">\n          <div class="matrix" style="width: 650px; margin: auto;"></div>\n          <p style="font-size: 30px; margin: 30px 0;">A programmable LED display for... anything!</p>\n        </div>\n      </header>\n    ');

      var display = new _display2.default(this.$el.find('.matrix'), '-KQBqz3I3aSMgWvPQKxz');
      display.load(650, { width: 128, height: 32 }, function () {
        // Something...
      });
    }
  }]);

  return HomePage;
}();

exports.default = HomePage;

},{"../components/display":33}],47:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _page = require('./page');

var _page2 = _interopRequireDefault(_page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HowToBuildADisplayPage = function (_Page) {
  _inherits(HowToBuildADisplayPage, _Page);

  function HowToBuildADisplayPage() {
    _classCallCheck(this, HowToBuildADisplayPage);

    return _possibleConstructorReturn(this, (HowToBuildADisplayPage.__proto__ || Object.getPrototypeOf(HowToBuildADisplayPage)).apply(this, arguments));
  }

  _createClass(HowToBuildADisplayPage, [{
    key: 'render',
    value: function render() {
      this.$el.html('\n      <div class="container-fluid">\n        <div class="row">\n          <div class="col-lg-6 offset-lg-3" style="margin-top: 100px;">\n            <h1>How To Build An LED Display</h1>\n            <p>Taking it to the next level is easy, let\'s get going..</p>\n            <hr style="margin-bottom: 40px;" />\n            <h4 style="margin: 20px 0;">You will need...</h4>\n            <ul>\n              <li>\n                <strong>At least one RBG LED board</strong>\n                <p>The <a href="http://www.adafruit.com/products/420">16x32</a> or <a href="#">32x32</a> model will work just fine. I would recommend chaining at least 3 together.</p>\n              </li>\n              <li>\n                <strong>Raspberry PI</strong>\n                <p>Sure the previous generation of pi will work, but if you want to update the LEDs as fast as possible, get the <a href="#">latest PI</a>.</p>\n              </li>\n              <li>\n                <strong>Female to Female wires</strong>\n                <p>These <a href="http://www.adafruit.com/products/266">wires</a> are for connecting the first LED board to the GPIO pins on your raspberry PI.</p>\n              </li>\n              <li>\n                <strong>Power supply</strong>\n                <p>You\'ll need a <a href="http://www.adafruit.com/products/276">5v</a> or 10v (if you have a 3 or more chained) powersupply to run your board(s).</p>\n              </li>\n              <li>\n                <strong>2.1mm to Screw Jack Adapter</strong>\n                <p>This <a href="http://www.adafruit.com/products/368">adapter</a> will connect your powersupply to your LED boards.</p>\n              </li>\n            </ul>\n            <h4 style="margin-top: 100px;">Wiring the first LED board to your raspberry PI</h4>\n            <p>Just following the wiring diagram below...</p>\n            <img src="http://placehold.it/350x150" style="width: 100%;">\n\n            <h4 style="margin-top: 100px;">Chaining your boards (if required)</h4>\n            <p>All the boards come with a ribbon cable and a power cable to be used for chaining. Follow the outline below to chain your boards.</p>\n            <img src="http://placehold.it/350x150" style="width: 100%;">\n\n            <h4 style="margin-top: 100px;">Connecting the power adapter to the LED board power cabled</h4>\n            <p>Just following the picture below...</p>\n            <img src="http://placehold.it/350x150" style="width: 100%;">\n\n            <h4 style="margin-top: 100px;">Installing BIGDOTS on your PI</h4>\n            <ol>\n              <li>\n                SSH into your raspberry PI\n              </li>\n              <li>\n                Clone the hardware client into your home directory\n<pre>\n$ cd\n$ git clone git@github.com:bigdots-io/hardware-client.git\n</pre>\n              </li>\n              <li>\n                Run the install script from the cloned directory\n<pre>\ncd hardware-client\nsudo ./install.sh\n</pre>\n              </li>\n              <li>\n                Using an editor, add a <strong>display-config.json</strong> file.\n              <pre>\n{\n  "display": "YOUR DISPLAY ID",\n  "rows": 32,\n  "chains": 3,\n  "parallel": 1\n}\n              </pre>\n              </li>\n              <li>\n                To start the client run..\n                <pre>\nsudo start hardware-client\n                </pre>\n                ...or simple restart the raspberry PI.\n              </li>\n            </ol>\n          </div>\n        </div>\n      </div>\n    ');
    }
  }]);

  return HowToBuildADisplayPage;
}(_page2.default);

exports.default = HowToBuildADisplayPage;

},{"./page":49}],48:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _macroManager = require('../managers/macro-manager');

var _macroManager2 = _interopRequireDefault(_macroManager);

var _page = require('./page');

var _page2 = _interopRequireDefault(_page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var macroManager = new _macroManager2.default();

var InstallMacrosPage = function (_Page) {
  _inherits(InstallMacrosPage, _Page);

  function InstallMacrosPage() {
    _classCallCheck(this, InstallMacrosPage);

    return _possibleConstructorReturn(this, (InstallMacrosPage.__proto__ || Object.getPrototypeOf(InstallMacrosPage)).apply(this, arguments));
  }

  _createClass(InstallMacrosPage, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      this.$el.html('\n      <h1>Macros</h1>\n      <hr />\n      <div class="container-fluid">\n        <div class="row list-group"></div>\n      </div>\n    ');

      var availableMacros = macroManager.getAvailableMacros();

      for (var key in availableMacros) {
        var macro = availableMacros[key];
        this.$el.find('.list-group').append('\n        <div class="list-group-item list-group-item-action">\n          <a href="#" class="btn btn-success pull-right install-macro" data-macro="' + key + '">Install</a>\n          <h5 class="list-group-item-heading">' + macro.name + '</h5>\n          <p class="list-group-item-text">' + macro.description + '</p>\n        </div>\n      ');
      }

      this.$el.find('.install-macro').click(function (ev) {
        ev.preventDefault();

        var $el = $(this),
            key = $el.data('macro'),
            config = availableMacros[key];

        macroManager.install(key, config, function () {
          $el.hide();
        });
      });

      macroManager.getInstalledMacros(function (macros) {
        for (var _key in macros) {
          _this2.$el.find('.install-macro[data-macro=' + _key + ']').hide();
        }
      });
    }
  }]);

  return InstallMacrosPage;
}(_page2.default);

exports.default = InstallMacrosPage;

},{"../managers/macro-manager":38,"./page":49}],49:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Page = function () {
  function Page() {
    _classCallCheck(this, Page);

    this.$el = $('#page');
  }

  _createClass(Page, [{
    key: '$',
    value: function $(selector) {
      return this.$el.find(selector);
    }
  }]);

  return Page;
}();

exports.default = Page;

},{}]},{},[36])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Rpc3BsYXktY291cGxlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kaXNwbGF5LWNvdXBsZXIvbm9kZV9tb2R1bGVzL21hY3JvLWxpYnJhcnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGlzcGxheS1jb3VwbGVyL25vZGVfbW9kdWxlcy9tYWNyby1saWJyYXJ5L21hY3JvLWNvbmZpZy5qc29uIiwibm9kZV9tb2R1bGVzL2Rpc3BsYXktY291cGxlci9ub2RlX21vZHVsZXMvbWFjcm8tbGlicmFyeS9tYWNyb3MvbWFjcm8uanMiLCJub2RlX21vZHVsZXMvZGlzcGxheS1jb3VwbGVyL25vZGVfbW9kdWxlcy9tYWNyby1saWJyYXJ5L21hY3Jvcy9wcm9ncmFtbWFibGUuanMiLCJub2RlX21vZHVsZXMvZGlzcGxheS1jb3VwbGVyL25vZGVfbW9kdWxlcy9tYWNyby1saWJyYXJ5L21hY3Jvcy9zb2xpZC1jb2xvci5qcyIsIm5vZGVfbW9kdWxlcy9kaXNwbGF5LWNvdXBsZXIvbm9kZV9tb2R1bGVzL21hY3JvLWxpYnJhcnkvbWFjcm9zL3N0YXJ0LXVwLmpzIiwibm9kZV9tb2R1bGVzL2Rpc3BsYXktY291cGxlci9ub2RlX21vZHVsZXMvbWFjcm8tbGlicmFyeS9tYWNyb3MvdGV4dC5qcyIsIm5vZGVfbW9kdWxlcy9kaXNwbGF5LWNvdXBsZXIvbm9kZV9tb2R1bGVzL21hY3JvLWxpYnJhcnkvbWFjcm9zL3R3aW5rbGUuanMiLCJub2RlX21vZHVsZXMvZGlzcGxheS1jb3VwbGVyL25vZGVfbW9kdWxlcy9tYWNyby1saWJyYXJ5L21hY3Jvcy91bnN1cHBvcnRlZC5qcyIsIm5vZGVfbW9kdWxlcy9kaXNwbGF5LWNvdXBsZXIvbm9kZV9tb2R1bGVzL21hY3JvLWxpYnJhcnkvbm9kZV9tb2R1bGVzL3R5cGV3cml0ZXIvZm9udHMvc3lzdGVtLW1lZGl1bS5qc29uIiwibm9kZV9tb2R1bGVzL2Rpc3BsYXktY291cGxlci9ub2RlX21vZHVsZXMvbWFjcm8tbGlicmFyeS9ub2RlX21vZHVsZXMvdHlwZXdyaXRlci9mb250cy9zeXN0ZW0tbWljcm8uanNvbiIsIm5vZGVfbW9kdWxlcy9kaXNwbGF5LWNvdXBsZXIvbm9kZV9tb2R1bGVzL21hY3JvLWxpYnJhcnkvbm9kZV9tb2R1bGVzL3R5cGV3cml0ZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcGFnZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wYWdlL25vZGVfbW9kdWxlcy9wYXRoLXRvLXJlZ2V4cC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wYWdlL25vZGVfbW9kdWxlcy9wYXRoLXRvLXJlZ2V4cC9ub2RlX21vZHVsZXMvaXNhcnJheS9pbmRleC5qcyIsInB1YmxpYy9zY3JpcHRzL2NvbXBvbmVudHMvZGlzcGxheS5qcyIsInB1YmxpYy9zY3JpcHRzL2NvbXBvbmVudHMvaGVhZGVyLmpzIiwicHVibGljL3NjcmlwdHMvbGliL3Jlc291cmNlLmpzIiwicHVibGljL3NjcmlwdHMvbG9nZ2VkLWluLmpzIiwicHVibGljL3NjcmlwdHMvbWFuYWdlcnMvZGlzcGxheS1tYW5hZ2VyLmpzIiwicHVibGljL3NjcmlwdHMvbWFuYWdlcnMvbWFjcm8tbWFuYWdlci5qcyIsInB1YmxpYy9zY3JpcHRzL21hbmFnZXJzL3VzZXItbWFuYWdlci5qcyIsInB1YmxpYy9zY3JpcHRzL21vZGFscy9hcGktdXNhZ2UtbW9kYWwuanMiLCJwdWJsaWMvc2NyaXB0cy9tb2RhbHMvZWRpdC1kaXNwbGF5LW1vZGFsLmpzIiwicHVibGljL3NjcmlwdHMvbW9kYWxzL21vZGFsLmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvY3JlYXRlLWRpc3BsYXktcGFnZS5qcyIsInB1YmxpYy9zY3JpcHRzL3BhZ2VzL2Rhc2hib2FyZC1wYWdlLmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvZGlzcGxheS1wYWdlLmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvaG9tZS1wYWdlLmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvaG93LXRvLWJ1aWxkLWEtZGlzcGxheS1wYWdlLmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvaW5zdGFsbC1tYWNyb3MtcGFnZS5qcyIsInB1YmxpYy9zY3JpcHRzL3BhZ2VzL3BhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzl0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25xRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzltQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFlBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ0hBOzs7O0FBQ0E7Ozs7Ozs7O0lBRU0sTztBQUNKLG1CQUFZLEdBQVosRUFBaUIsVUFBakIsRUFBNkI7QUFBQTs7QUFDM0IsU0FBSyxHQUFMLEdBQVcsR0FBWDtBQUNBLFNBQUssVUFBTCxHQUFrQixVQUFsQjtBQUNEOzs7O3lCQUVJLEssRUFBTyxVLEVBQVksUSxFQUFVO0FBQUE7O0FBQ2hDLFdBQUssTUFBTCxDQUFZLEtBQVosRUFBbUIsVUFBbkI7O0FBRUEsVUFBSSxpQkFBaUIsNkJBQW1CLFNBQVMsUUFBVCxFQUFuQixDQUFyQjtBQUNBLHFCQUFlLE9BQWYsQ0FBdUIsS0FBSyxVQUE1QixFQUF3QztBQUN0QyxpQkFBUyxpQkFBUyxXQUFULEVBQXNCLElBQXRCLEVBQTRCO0FBQ25DO0FBQ0QsU0FIcUM7QUFJdEMsdUJBQWUsdUJBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxHQUFQLEVBQVksV0FBWixFQUE0QjtBQUN6Qyx3QkFBYyxlQUFlLEVBQTdCO0FBQ0EsZ0JBQUsseUJBQUwsQ0FBK0IsQ0FBL0IsRUFBa0MsQ0FBbEMsRUFBcUMsR0FBckMsRUFBMEMsV0FBMUM7QUFDRDtBQVBxQyxPQUF4QztBQVNBO0FBQ0Q7Ozt5QkFFSSxLLEVBQU8sVyxFQUFhLEssRUFBTyxVLEVBQVksUSxFQUFVO0FBQUE7O0FBQ3BELFVBQUksZ0JBQWdCO0FBQ2xCLGVBQU8sS0FEVztBQUVsQixxQkFBYSxXQUZLO0FBR2xCLGVBQU8sV0FBVyxLQUhBO0FBSWxCLGdCQUFRLFdBQVc7QUFKRCxPQUFwQjs7QUFPQSxXQUFLLE1BQUwsQ0FBWSxLQUFaLEVBQW1CLFVBQW5COztBQUVBLFVBQUksaUJBQWlCLDhCQUFyQjtBQUNBLHFCQUFlLElBQWYsQ0FBb0IsYUFBcEIsRUFBbUM7QUFDakMsaUJBQVMsaUJBQVMsV0FBVCxFQUFzQixJQUF0QixFQUE0QjtBQUNuQztBQUNELFNBSGdDO0FBSWpDLHVCQUFlLHVCQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sR0FBUCxFQUFZLFdBQVosRUFBNEI7QUFDekMsd0JBQWMsZUFBZSxFQUE3QjtBQUNBLGlCQUFLLHlCQUFMLENBQStCLENBQS9CLEVBQWtDLENBQWxDLEVBQXFDLEdBQXJDLEVBQTBDLFdBQTFDO0FBQ0Q7QUFQZ0MsT0FBbkM7QUFTQTtBQUNEOzs7MkJBRU0sSyxFQUFPLFUsRUFBWTtBQUN4QixXQUFLLEdBQUwsQ0FBUyxJQUFUOztBQVFBLFVBQUkscUJBQXFCLENBQUMsS0FBTSxNQUFNLENBQWIsSUFBbUIsR0FBNUM7QUFBQSxVQUNJLE9BQU8sQ0FBQyxRQUFRLEVBQVQsSUFBZSxXQUFXLEtBRHJDOztBQUdBLFdBQUksSUFBSSxJQUFJLENBQVosRUFBZSxJQUFJLFdBQVcsTUFBOUIsRUFBc0MsR0FBdEMsRUFBMkM7QUFDekMsWUFBSSxPQUFPLCtDQUE2QyxrQkFBN0Msa0JBQTRFLElBQTVFLHlCQUFvRyxJQUFwRyxXQUFYO0FBQ0EsYUFBSSxJQUFJLElBQUksQ0FBWixFQUFlLElBQUksV0FBVyxLQUE5QixFQUFxQyxHQUFyQyxFQUEwQztBQUN4QyxlQUFLLE1BQUwsaUVBQ21ELElBRG5ELG9CQUNzRSxJQUR0RSwyREFFc0MsQ0FGdEMsa0JBRW9ELENBRnBELDRCQUU0RSxDQUY1RSxTQUVpRixDQUZqRjtBQUtEO0FBQ0QsYUFBSyxHQUFMLENBQVMsSUFBVCxDQUFjLFFBQWQsRUFBd0IsTUFBeEIsQ0FBK0IsSUFBL0I7QUFDRDtBQUNGOzs7OENBRXlCLEMsRUFBRyxDLEVBQUcsRyxFQUFLLFcsRUFBYTtBQUNoRCxVQUFJLEtBQUssU0FBUyxnQkFBVCwwQkFBZ0QsQ0FBaEQsU0FBcUQsQ0FBckQsU0FBVDtBQUNBLFVBQUcsR0FBRyxNQUFILEdBQVksQ0FBZixFQUFrQjtBQUNoQixXQUFHLENBQUgsRUFBTSxLQUFOLENBQVksVUFBWixHQUEwQixRQUFRLFNBQVIsWUFBNkIsR0FBdkQ7QUFDRDtBQUNGOzs7Ozs7QUFHSCxTQUFTLFFBQVQsQ0FBa0IsS0FBbEIsRUFBeUIsT0FBekIsRUFBa0M7QUFDOUIsTUFBSSxJQUFFLFNBQVMsTUFBTSxLQUFOLENBQVksQ0FBWixDQUFULEVBQXdCLEVBQXhCLENBQU47QUFBQSxNQUFrQyxJQUFFLFVBQVEsQ0FBUixHQUFVLENBQVYsR0FBWSxHQUFoRDtBQUFBLE1BQW9ELElBQUUsVUFBUSxDQUFSLEdBQVUsVUFBUSxDQUFDLENBQW5CLEdBQXFCLE9BQTNFO0FBQUEsTUFBbUYsSUFBRSxLQUFHLEVBQXhGO0FBQUEsTUFBMkYsSUFBRSxLQUFHLENBQUgsR0FBSyxNQUFsRztBQUFBLE1BQXlHLElBQUUsSUFBRSxRQUE3RztBQUNBLFNBQU8sTUFBSSxDQUFDLFlBQVUsQ0FBQyxLQUFLLEtBQUwsQ0FBVyxDQUFDLElBQUUsQ0FBSCxJQUFNLENBQWpCLElBQW9CLENBQXJCLElBQXdCLE9BQWxDLEdBQTBDLENBQUMsS0FBSyxLQUFMLENBQVcsQ0FBQyxJQUFFLENBQUgsSUFBTSxDQUFqQixJQUFvQixDQUFyQixJQUF3QixLQUFsRSxJQUF5RSxLQUFLLEtBQUwsQ0FBVyxDQUFDLElBQUUsQ0FBSCxJQUFNLENBQWpCLElBQW9CLENBQTdGLENBQUQsRUFBa0csUUFBbEcsQ0FBMkcsRUFBM0csRUFBK0csS0FBL0csQ0FBcUgsQ0FBckgsQ0FBWDtBQUNIOztRQUVtQixPLEdBQVgsTzs7Ozs7Ozs7Ozs7O0FDdEZUOzs7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBSSxjQUFjLDJCQUFsQjtBQUFBLElBQ0ksaUJBQWlCLDhCQURyQjs7SUFHTSxNO0FBQ0osa0JBQVksR0FBWixFQUFpQjtBQUFBOztBQUNmLFNBQUssR0FBTCxHQUFXLEdBQVg7QUFDRDs7Ozs2QkFFUTtBQUFBOztBQUNQLFdBQUssR0FBTCxDQUFTLElBQVQ7O0FBU0EsZUFBUyxJQUFULEdBQWdCLGtCQUFoQixDQUFtQyxVQUFDLElBQUQsRUFBVTtBQUMzQyxZQUFHLElBQUgsRUFBUztBQUNQLGdCQUFLLEdBQUwsQ0FBUyxJQUFULENBQWMsUUFBZCxFQUF3QixXQUF4QixDQUFvQyxZQUFwQztBQUNBLGdCQUFLLEdBQUwsQ0FBUyxJQUFULENBQWMsU0FBZCxFQUF5QixJQUF6QixDQUE4QixLQUE5QixFQUFxQyxLQUFLLFFBQTFDO0FBQ0EscUJBQVcsSUFBWDtBQUNBLG9CQUFVLElBQVY7O0FBRUEsY0FBSSxXQUFXO0FBQ2Isa0JBQU0sS0FBSyxXQURFO0FBRWIsNkJBQWlCLEtBQUssUUFGVDtBQUdiLGlCQUFLLEtBQUs7QUFIRyxXQUFmOztBQU1BLHNCQUFZLGNBQVosQ0FBMkIsS0FBSyxHQUFoQyxFQUFxQyxRQUFyQyxFQUErQyxZQUFXO0FBQ3hEO0FBQ0QsV0FGRDtBQUlELFNBaEJELE1BZ0JPO0FBQ0wsZ0JBQUssR0FBTCxDQUFTLElBQVQsQ0FBYyxRQUFkLEVBQXdCLFFBQXhCLENBQWlDLFlBQWpDO0FBQ0EsZ0JBQUssR0FBTCxDQUFTLElBQVQsQ0FBYyxrQkFBZCxFQUFrQyxJQUFsQztBQUNBLG9CQUFVLElBQVY7QUFDQSxxQkFBVyxJQUFYO0FBQ0Q7QUFDRixPQXZCRDs7QUF5QkEsV0FBSyxHQUFMLENBQVMsSUFBVCxDQUFjLFVBQWQsRUFBMEIsS0FBMUIsQ0FBZ0MsVUFBQyxFQUFELEVBQVE7QUFDdEMsV0FBRyxjQUFIO0FBQ0EsWUFBSSxXQUFXLElBQUksU0FBUyxJQUFULENBQWMsa0JBQWxCLEVBQWY7QUFDQSxpQkFBUyxJQUFULEdBQWdCLGVBQWhCLENBQWdDLFFBQWhDLEVBQTBDLElBQTFDLENBQStDLFVBQUMsTUFBRCxFQUFZO0FBQ3pELGNBQUksT0FBTyxPQUFPLElBQWxCO0FBQ0EsZ0JBQUssR0FBTCxDQUFTLElBQVQsQ0FBYyxTQUFkLEVBQXlCLElBQXpCLENBQThCLEtBQTlCLEVBQXFDLEtBQUssUUFBMUM7QUFDQSxxQkFBVyxJQUFYO0FBQ0Esb0JBQVUsSUFBVjtBQUNELFNBTEQsRUFLRyxLQUxILENBS1MsVUFBUyxLQUFULEVBQWdCO0FBQ3ZCO0FBQ0EsY0FBSSxZQUFZLE1BQU0sSUFBdEI7QUFDQSxjQUFJLGVBQWUsTUFBTSxPQUF6QjtBQUNBO0FBQ0EsY0FBSSxRQUFRLE1BQU0sS0FBbEI7QUFDQTtBQUNBLGNBQUksYUFBYSxNQUFNLFVBQXZCO0FBQ0E7QUFDRCxTQWREO0FBZUQsT0FsQkQ7QUFtQkQ7Ozs7OztRQUdnQixPLEdBQVYsTTs7Ozs7Ozs7Ozs7OztJQ3BFSCxROzs7Ozs7OzJCQUNHLEUsRUFBSTtBQUNULGFBQU8sU0FBUyxRQUFULEdBQW9CLEdBQXBCLGVBQW9DLEVBQXBDLENBQVA7QUFDRDs7O2dDQUVXLEUsRUFBSSxDLEVBQUcsQyxFQUFHO0FBQ3BCLGFBQU8sU0FBUyxRQUFULEdBQW9CLEdBQXBCLGVBQW9DLEVBQXBDLFNBQTBDLENBQTFDLFNBQStDLENBQS9DLENBQVA7QUFDRDs7OytCQUVVO0FBQ1QsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsQ0FBd0IsVUFBeEIsQ0FBUDtBQUNEOzs7NEJBRU8sRSxFQUFJO0FBQ1YsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsZUFBb0MsRUFBcEMsQ0FBUDtBQUNEOzs7NkNBRXdCLEUsRUFBSTtBQUMzQixhQUFPLFNBQVMsUUFBVCxHQUFvQixHQUFwQixlQUFvQyxFQUFwQyx3QkFBUDtBQUNEOzs7dUNBRWtCLEUsRUFBSSxJLEVBQU07QUFDM0IsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsZUFBb0MsRUFBcEMsZ0JBQWlELElBQWpELENBQVA7QUFDRDs7O2tDQUVhLEUsRUFBSTtBQUNoQixhQUFPLFNBQVMsUUFBVCxHQUFvQixHQUFwQixlQUFvQyxFQUFwQyxhQUFQO0FBQ0Q7Ozs2QkFFUTtBQUNQLGFBQU8sU0FBUyxRQUFULEdBQW9CLEdBQXBCLENBQXdCLFFBQXhCLENBQVA7QUFDRDs7O2dDQUVXO0FBQ1YsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsQ0FBd0IsVUFBeEIsQ0FBUDtBQUNEOzs7NkJBRVEsRSxFQUFJO0FBQ1gsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsZUFBb0MsRUFBcEMsQ0FBUDtBQUNEOzs7aUNBRVksRSxFQUFJO0FBQ2YsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsbUJBQXdDLEVBQXhDLGVBQVA7QUFDRDs7O2lDQUNZLEUsRUFBSTtBQUNmLGFBQU8sU0FBUyxRQUFULEdBQW9CLEdBQXBCLG9CQUF5QyxFQUF6QyxlQUFQO0FBQ0Q7Ozs7OztRQUdrQixPLEdBQVosUTs7Ozs7QUNqRFQ7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7Ozs7O0FBRUEsU0FBUyxhQUFULENBQXVCO0FBQ3JCLFVBQVEseUNBRGE7QUFFckIsY0FBWSw0QkFGUztBQUdyQixlQUFhLG1DQUhRO0FBSXJCLGlCQUFlO0FBSk0sQ0FBdkI7O0FBT0Esb0JBQUssZUFBTCxFQUFzQixZQUFXO0FBQy9CLGdDQUFvQixNQUFwQjtBQUNELENBRkQ7O0FBSUEsb0JBQUssZUFBTCxFQUFzQixZQUFXO0FBQy9CLG9DQUF3QixNQUF4QjtBQUNELENBRkQ7O0FBSUEsb0JBQUssZUFBTCxFQUFzQixVQUFTLEdBQVQsRUFBYztBQUNsQyw0QkFBZ0I7QUFDZCxRQUFJLElBQUksTUFBSixDQUFXO0FBREQsR0FBaEIsRUFFRyxNQUZIO0FBR0QsQ0FKRDs7QUFNQSxvQkFBSyxpQkFBTCxFQUF3QixZQUFXO0FBQ2pDLG9DQUF3QixNQUF4QjtBQUNELENBRkQ7O0FBSUEsb0JBQUsseUJBQUwsRUFBZ0MsWUFBVztBQUN6Qyx5Q0FBNkIsTUFBN0I7QUFDRCxDQUZEOztBQUlBLFNBQVMsSUFBVCxHQUFnQixrQkFBaEIsQ0FBbUMsVUFBUyxJQUFULEVBQWU7QUFDaEQsTUFBRyxJQUFILEVBQVM7QUFDUCx5QkFBVyxFQUFFLFNBQUYsQ0FBWCxFQUF5QixNQUF6QjtBQUNBO0FBQ0Q7QUFDRixDQUxEOzs7Ozs7Ozs7Ozs7QUN4Q0E7Ozs7Ozs7O0lBRU0sYzs7Ozs7OzsyQkFDRyxNLEVBQVEsTSxFQUFRLEcsRUFBSyxFLEVBQUk7QUFDOUIsVUFBSSxZQUFZLFNBQVMsUUFBVCxHQUFvQixHQUFwQixDQUF3QixVQUF4QixFQUFvQyxJQUFwQyxHQUEyQyxHQUEzRDtBQUFBLFVBQ0ksYUFBYSxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsQ0FBd0IsVUFBeEIsRUFBb0MsSUFBcEMsR0FBMkMsR0FENUQ7O0FBR0EsK0JBQWUsTUFBZixDQUFzQixTQUF0QixFQUFpQyxHQUFqQyxDQUFxQyxNQUFyQyxFQUE2QyxJQUE3QyxDQUFrRCxZQUFXO0FBQzNELGlDQUFlLE9BQWYsQ0FBdUIsVUFBdkIsRUFBbUMsR0FBbkMsQ0FBdUMsTUFBdkMsRUFBK0MsSUFBL0MsQ0FBb0QsWUFBVztBQUM3RCxjQUFJLE9BQU8sRUFBWDtBQUNBLGVBQUssVUFBTCxJQUFtQixJQUFuQjs7QUFFQSxtQ0FBZSxZQUFmLENBQTRCLEdBQTVCLEVBQWlDLE1BQWpDLENBQXdDLElBQXhDLEVBQThDLElBQTlDLENBQW1ELFlBQVc7QUFDNUQsZUFBRyxVQUFIO0FBQ0QsV0FGRDtBQUdELFNBUEQ7QUFRRCxPQVREO0FBVUQ7OztvQ0FFZSxHLEVBQUssUSxFQUFVO0FBQUE7O0FBQzdCLCtCQUFlLFlBQWYsQ0FBNEIsR0FBNUIsRUFBaUMsSUFBakMsQ0FBc0MsT0FBdEMsRUFBK0MsSUFBL0MsQ0FBb0QsVUFBQyxRQUFELEVBQWM7QUFDaEUsWUFBSSxjQUFjLE9BQU8sSUFBUCxDQUFZLFNBQVMsR0FBVCxFQUFaLENBQWxCO0FBQUEsWUFDSSxvQkFBb0IsRUFEeEI7O0FBR0Esb0JBQVksT0FBWixDQUFvQixVQUFDLFVBQUQsRUFBZ0I7QUFDbEMsZ0JBQUssVUFBTCxDQUFnQixVQUFoQixFQUE0QixVQUFDLFdBQUQsRUFBaUI7QUFDM0MsOEJBQWtCLElBQWxCLENBQXVCLFdBQXZCOztBQUVBLGdCQUFHLGtCQUFrQixNQUFsQixJQUE0QixZQUFZLE1BQTNDLEVBQW1EO0FBQ2pELHVCQUFTLFdBQVQsRUFBc0IsaUJBQXRCO0FBQ0Q7QUFDRixXQU5EO0FBT0QsU0FSRDtBQVNELE9BYkQ7QUFjRDs7OzhCQUVTLEcsRUFBSyxRLEVBQVU7QUFDdkIsK0JBQWUsYUFBZixDQUE2QixHQUE3QixFQUFrQyxJQUFsQyxDQUF1QyxPQUF2QyxFQUFnRCxJQUFoRCxDQUFxRCxVQUFDLFFBQUQsRUFBYztBQUNqRSxZQUFJLFdBQVcsT0FBTyxJQUFQLENBQVksU0FBUyxHQUFULEVBQVosQ0FBZjtBQUFBLFlBQ0ksaUJBQWlCLEVBRHJCOztBQUdBLGlCQUFTLE9BQVQsQ0FBaUIsVUFBQyxPQUFELEVBQWE7QUFDNUIsbUNBQWUsWUFBZixDQUE0QixPQUE1QixFQUFxQyxJQUFyQyxDQUEwQyxPQUExQyxFQUFtRCxJQUFuRCxDQUF3RCxVQUFDLFFBQUQsRUFBYztBQUNwRSwyQkFBZSxJQUFmLENBQW9CLFNBQVMsR0FBVCxFQUFwQjs7QUFFQSxnQkFBRyxlQUFlLE1BQWYsSUFBeUIsU0FBUyxNQUFyQyxFQUE2QztBQUMzQyx1QkFBUyxRQUFULEVBQW1CLGNBQW5CO0FBQ0Q7QUFDRixXQU5EO0FBT0QsU0FSRDtBQVNELE9BYkQ7QUFjRDs7OytCQUVVLEcsRUFBSyxRLEVBQVU7QUFDeEIsK0JBQWUsT0FBZixDQUF1QixHQUF2QixFQUE0QixJQUE1QixDQUFpQyxPQUFqQyxFQUEwQyxJQUExQyxDQUErQyxVQUFTLFFBQVQsRUFBbUI7QUFDaEUsaUJBQVMsU0FBUyxHQUFULEVBQVQ7QUFDRCxPQUZEO0FBR0Q7OzsrQkFFVSxHLEVBQUssUSxFQUFVO0FBQ3hCLCtCQUFlLE9BQWYsQ0FBdUIsR0FBdkIsRUFBNEIsSUFBNUIsQ0FBaUMsT0FBakMsRUFBMEMsSUFBMUMsQ0FBK0MsVUFBUyxRQUFULEVBQW1CO0FBQ2hFLGlCQUFTLFNBQVMsR0FBVCxFQUFUO0FBQ0QsT0FGRDtBQUdEOzs7MkJBRU0sRyxFQUFLLE0sRUFBUSxFLEVBQUk7QUFDdEIsK0JBQWUsT0FBZixDQUF1QixHQUF2QixFQUE0QixNQUE1QixDQUFtQyxNQUFuQyxFQUEyQyxJQUEzQyxDQUFnRCxZQUFXO0FBQ3pEO0FBQ0QsT0FGRDtBQUdEOzs7Ozs7UUFHd0IsTyxHQUFsQixjOzs7Ozs7Ozs7Ozs7QUN4RVQ7Ozs7QUFDQTs7Ozs7Ozs7SUFFTSxZOzs7Ozs7OzRCQUNJLEcsRUFBSyxNLEVBQVEsRSxFQUFJO0FBQ3ZCLFVBQUksT0FBTyxFQUFYO0FBQ0EsV0FBSyxHQUFMLElBQVksTUFBWjs7QUFFQSwrQkFBZSxNQUFmLEdBQXdCLE1BQXhCLENBQStCLElBQS9CLEVBQXFDLElBQXJDLENBQTBDLFlBQVc7QUFDbkQsV0FBRyxHQUFIO0FBQ0QsT0FGRDtBQUdEOzs7dUNBRWtCLFEsRUFBVTtBQUMzQiwrQkFBZSxNQUFmLEdBQXdCLElBQXhCLENBQTZCLE9BQTdCLEVBQXNDLElBQXRDLENBQTJDLFVBQUMsUUFBRCxFQUFjO0FBQ3ZELGlCQUFTLFNBQVMsR0FBVCxFQUFUO0FBQ0QsT0FGRDtBQUdEOzs7eUNBRW9CO0FBQ25CLFVBQUksZUFBZSw0QkFBbkI7QUFDQSxtQkFBYSxjQUFiO0FBQ0EsYUFBTyxhQUFhLGVBQWIsRUFBUDtBQUNEOzs7Ozs7UUFHc0IsTyxHQUFoQixZOzs7Ozs7Ozs7Ozs7QUMxQlQ7Ozs7Ozs7O0lBRU0sVzs7Ozs7OzsyQkFDRyxNLEVBQVEsTSxFQUFRLEUsRUFBSTtBQUN6QixVQUFJLFlBQVksU0FBUyxRQUFULEdBQW9CLEdBQXBCLENBQXdCLFVBQXhCLEVBQW9DLElBQXBDLEdBQTJDLEdBQTNEO0FBQUEsVUFDSSxhQUFhLFNBQVMsUUFBVCxHQUFvQixHQUFwQixDQUF3QixVQUF4QixFQUFvQyxJQUFwQyxHQUEyQyxHQUQ1RDs7QUFHQSwrQkFBZSxNQUFmLENBQXNCLFNBQXRCLEVBQWlDLEdBQWpDLENBQXFDLE1BQXJDLEVBQTZDLElBQTdDLENBQWtELFlBQVc7QUFDM0QsaUNBQWUsT0FBZixDQUF1QixVQUF2QixFQUFtQyxHQUFuQyxDQUF1QyxNQUF2QyxFQUErQyxJQUEvQyxDQUFvRCxZQUFXO0FBQzdELGFBQUcsVUFBSDtBQUNELFNBRkQ7QUFHRCxPQUpEO0FBS0Q7OzsrQkFFVSxHLEVBQUssUSxFQUFVO0FBQ3hCLCtCQUFlLE9BQWYsQ0FBdUIsR0FBdkIsRUFBNEIsSUFBNUIsQ0FBaUMsT0FBakMsRUFBMEMsSUFBMUMsQ0FBK0MsVUFBUyxRQUFULEVBQW1CO0FBQ2hFLGlCQUFTLFNBQVMsR0FBVCxFQUFUO0FBQ0QsT0FGRDtBQUdEOzs7bUNBRWMsRyxFQUFLLFEsRUFBVSxFLEVBQUk7QUFDaEMsK0JBQWUsWUFBZixDQUE0QixHQUE1QixFQUFpQyxNQUFqQyxDQUF3QyxRQUF4QyxFQUFrRCxJQUFsRCxDQUF1RCxZQUFXO0FBQ2hFO0FBQ0QsT0FGRDtBQUdEOzs7Ozs7UUFHcUIsTyxHQUFmLFc7Ozs7Ozs7Ozs7OztBQzNCVDs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7OztJQUVNLGE7OztBQUNKLHlCQUFZLEdBQVosRUFBaUIsVUFBakIsRUFBNkIsV0FBN0IsRUFBMEM7QUFBQTs7QUFBQSw4SEFDbEMsR0FEa0M7O0FBRXhDLFVBQUssVUFBTCxHQUFrQixVQUFsQjtBQUNBLFVBQUssV0FBTCxHQUFtQixXQUFuQjtBQUh3QztBQUl6Qzs7OztzQkFFQyxRLEVBQVU7QUFDVixhQUFPLEtBQUssR0FBTCxDQUFTLElBQVQsQ0FBYyxRQUFkLENBQVA7QUFDRDs7OzZCQUVRO0FBQ1AsV0FBSyxHQUFMLENBQVMsSUFBVCx3aUJBWTRCLEtBQUssV0FBTCxDQUFpQixNQVo3QywyWEFpQnlDLEtBQUssV0FBTCxDQUFpQixNQWpCMUQsMFdBdUJhLElBQUksSUFBSixHQUFXLE9BQVgsRUF2QmIsNkRBeUI0QyxLQUFLLFdBQUwsQ0FBaUIsTUF6QjdELDJMQWdDZSxJQUFJLElBQUosR0FBVyxPQUFYLEVBaENmLG9FQW9DZSxJQUFJLElBQUosR0FBVyxPQUFYLEVBcENmLG9FQXdDZSxJQUFJLElBQUosR0FBVyxPQUFYLEVBeENmLGtFQTJDNEMsS0FBSyxXQUFMLENBQWlCLE1BM0M3RDtBQWtERDs7Ozs7O1FBR3VCLE8sR0FBakIsYTs7Ozs7Ozs7Ozs7O0FDckVUOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUVBLElBQUksZUFBZSw0QkFBbkI7QUFBQSxJQUNJLGlCQUFpQiw4QkFEckI7O0lBR00sZ0I7OztBQUNKLDRCQUFZLEdBQVosRUFBaUIsVUFBakIsRUFBNkIsV0FBN0IsRUFBMEM7QUFBQTs7QUFBQSxvSUFDbEMsR0FEa0M7O0FBRXhDLFVBQUssVUFBTCxHQUFrQixVQUFsQjtBQUNBLFVBQUssV0FBTCxHQUFtQixXQUFuQjtBQUh3QztBQUl6Qzs7Ozs2QkFFUTtBQUFBOztBQUNQLFdBQUssR0FBTCxDQUFTLElBQVQ7O0FBNEtBLFdBQUssY0FBTDtBQUNBLFdBQUssY0FBTDtBQUNBLFdBQUssYUFBTDs7QUFFQSxXQUFLLENBQUwsQ0FBTyxlQUFQLEVBQXdCLEVBQXhCLENBQTJCLGVBQTNCLEVBQTRDLFlBQU07QUFDaEQsZUFBSyxDQUFMLENBQU8sY0FBUCxFQUF1QixHQUF2QixDQUEyQixPQUFLLFdBQUwsQ0FBaUIsS0FBNUMsRUFBbUQsTUFBbkQ7QUFDQSxlQUFLLENBQUwsQ0FBTyxzQkFBUCxFQUErQixHQUEvQixDQUFtQyxPQUFLLFdBQUwsQ0FBaUIsS0FBcEQsRUFBMkQsTUFBM0Q7QUFDQSxlQUFLLENBQUwsQ0FBTyx1QkFBUCxFQUFnQyxHQUFoQyxDQUFvQyxPQUFLLFdBQUwsQ0FBaUIsTUFBckQsRUFBNkQsTUFBN0Q7QUFDRCxPQUpEO0FBS0EsV0FBSyxDQUFMLENBQU8sZUFBUCxFQUF3QixHQUF4QixDQUE0QixLQUFLLFdBQUwsQ0FBaUIsSUFBN0M7O0FBRUEsV0FBSyxDQUFMLENBQU8sd0JBQVAsRUFBaUMsV0FBakM7O0FBRUEsVUFBSSxrQkFBa0IsS0FBSyxDQUFMLENBQU8sa0JBQVAsQ0FBdEI7QUFBQSxVQUNJLHVCQUF1QixLQUFLLENBQUwsQ0FBTyx1QkFBUCxDQUQzQjtBQUFBLFVBRUkscUJBQXFCLEtBQUssQ0FBTCxDQUFPLHNCQUFQLENBRnpCO0FBQUEsVUFHSSxlQUFlLEtBQUssQ0FBTCxDQUFPLGVBQVAsQ0FIbkI7O0FBS0EsV0FBSyxDQUFMLENBQU8sY0FBUCxFQUF1QixNQUF2QixDQUE4QixVQUFTLEVBQVQsRUFBYTtBQUN6Qyx3QkFBZ0IsSUFBaEI7QUFDQSw2QkFBcUIsSUFBckI7QUFDQSwyQkFBbUIsSUFBbkI7QUFDQSxxQkFBYSxJQUFiOztBQUVBLFlBQUcsS0FBSyxLQUFMLEtBQWUsU0FBbEIsRUFBNkI7QUFDM0IsMEJBQWdCLElBQWhCO0FBQ0QsU0FGRCxNQUVPLElBQUcsS0FBSyxLQUFMLElBQWMsY0FBakIsRUFBaUM7QUFDdEMsK0JBQXFCLElBQXJCO0FBQ0QsU0FGTSxNQUVBLElBQUcsS0FBSyxLQUFMLElBQWMsYUFBakIsRUFBZ0M7QUFDckMsNkJBQW1CLElBQW5CO0FBQ0QsU0FGTSxNQUVBLElBQUcsS0FBSyxLQUFMLElBQWMsTUFBakIsRUFBeUI7QUFDOUIsdUJBQWEsSUFBYjtBQUNEO0FBQ0YsT0FmRDs7QUFpQkEsV0FBSyxDQUFMLENBQU8sTUFBUCxFQUFlLE1BQWYsQ0FBc0IsVUFBQyxFQUFELEVBQVE7QUFDNUIsV0FBRyxjQUFIOztBQUVBLFlBQUksVUFBVTtBQUNaLGlCQUFPLE9BQUssQ0FBTCxDQUFPLGNBQVAsRUFBdUIsR0FBdkIsRUFESztBQUVaLGdCQUFNLE9BQUssQ0FBTCxDQUFPLGVBQVAsRUFBd0IsR0FBeEI7QUFGTSxTQUFkOztBQUtBLFlBQUcsUUFBUSxLQUFSLEtBQWtCLFNBQXJCLEVBQWdDO0FBQzlCLGtCQUFRLFdBQVIsR0FBc0I7QUFDcEIsdUJBQVcsT0FBSyxDQUFMLENBQU8scUJBQVAsRUFBOEIsR0FBOUI7QUFEUyxXQUF0QjtBQUdELFNBSkQsTUFJTyxJQUFHLFFBQVEsS0FBUixLQUFrQixhQUFyQixFQUFvQztBQUN6QyxrQkFBUSxXQUFSLEdBQXNCO0FBQ3BCLG1CQUFPLE9BQUssQ0FBTCxDQUFPLGNBQVAsRUFBdUIsR0FBdkI7QUFEYSxXQUF0QjtBQUdELFNBSk0sTUFJQSxJQUFHLFFBQVEsS0FBUixLQUFrQixNQUFyQixFQUE2QjtBQUNsQyxrQkFBUSxXQUFSLEdBQXNCO0FBQ3BCLG1CQUFPLE9BQUssQ0FBTCxDQUFPLGFBQVAsRUFBc0IsR0FBdEIsRUFEYTtBQUVwQixrQkFBTSxPQUFLLENBQUwsQ0FBTyxhQUFQLEVBQXNCLEdBQXRCLEdBQTRCLFdBQTVCLEVBRmM7QUFHcEIsa0JBQU0sT0FBSyxDQUFMLENBQU8sYUFBUCxFQUFzQixHQUF0QixFQUhjO0FBSXBCLDBCQUFjLE9BQUssQ0FBTCxDQUFPLHFCQUFQLEVBQThCLEdBQTlCLEVBSk07QUFLcEIsaUNBQXFCLE9BQUssQ0FBTCxDQUFPLDZCQUFQLEVBQXNDLEdBQXRDO0FBTEQsV0FBdEI7QUFPRDs7QUFFRCx1QkFBZSxNQUFmLENBQXNCLE9BQUssVUFBM0IsRUFBdUMsT0FBdkMsRUFBZ0QsVUFBQyxVQUFELEVBQWdCO0FBQzlELGlCQUFLLENBQUwsQ0FBTyxlQUFQLEVBQXdCLEtBQXhCLENBQThCLE1BQTlCOztBQUVBO0FBQ0EsWUFBRSxNQUFGLEVBQVUsV0FBVixDQUFzQixZQUF0QjtBQUNBLFlBQUUsaUJBQUYsRUFBcUIsTUFBckI7O0FBRUEsNkNBQWtCLE9BQUssVUFBdkI7QUFDRCxTQVJEO0FBU0QsT0FuQ0Q7QUFvQ0Q7OztxQ0FFZ0I7QUFBQTs7QUFDZixVQUFJLGdCQUFnQixLQUFLLENBQUwsQ0FBTyxjQUFQLENBQXBCO0FBQ0EsbUJBQWEsa0JBQWIsQ0FBZ0MsVUFBQyxNQUFELEVBQVk7QUFDMUMsYUFBSSxJQUFJLEdBQVIsSUFBZSxNQUFmLEVBQXVCO0FBQ3JCLHdCQUFjLE1BQWQsb0JBQXNDLEdBQXRDLFNBQTZDLE9BQU8sR0FBUCxFQUFZLElBQXpEO0FBQ0EsaUJBQUssQ0FBTCxtQkFBdUIsR0FBdkIsRUFBOEIsSUFBOUIsQ0FBbUMsT0FBTyxHQUFQLEVBQVksV0FBL0M7QUFDRDtBQUNGLE9BTEQ7QUFNRDs7O29DQUVlO0FBQ2QsVUFBSSxlQUFlLEtBQUssQ0FBTCxDQUFPLG1CQUFQLENBQW5CO0FBQ0EsMkJBQVcsY0FBWCxHQUE0QixPQUE1QixDQUFvQyxVQUFDLElBQUQsRUFBVTtBQUM1QyxxQkFBYSxNQUFiLG9CQUFxQyxJQUFyQyxTQUE2QyxJQUE3QztBQUNELE9BRkQ7QUFHRDs7O3FDQUVnQjtBQUFBOztBQUNmLHFCQUFlLFNBQWYsQ0FBeUIsS0FBSyxVQUE5QixFQUEwQyxVQUFDLFNBQUQsRUFBWSxLQUFaLEVBQXNCO0FBQzlELFlBQUksaUJBQWlCLE9BQUssQ0FBTCxDQUFPLGlCQUFQLENBQXJCO0FBQ0EsY0FBTSxPQUFOLENBQWMsVUFBUyxJQUFULEVBQWU7QUFDM0IseUJBQWUsTUFBZixzRUFFZ0IsS0FBSyxlQUZyQixrRkFHTSxLQUFLLElBSFg7QUFNRCxTQVBEO0FBUUQsT0FWRDtBQVdEOzs7Ozs7UUFHMEIsTyxHQUFwQixnQjs7Ozs7Ozs7Ozs7OztJQ3RTSCxLO0FBQ0osaUJBQVksR0FBWixFQUFpQjtBQUFBOztBQUNmLFNBQUssR0FBTCxHQUFXLEdBQVg7QUFDRDs7OztzQkFFQyxRLEVBQVU7QUFDVixhQUFPLEtBQUssR0FBTCxDQUFTLElBQVQsQ0FBYyxRQUFkLENBQVA7QUFDRDs7Ozs7O1FBR2UsTyxHQUFULEs7Ozs7Ozs7Ozs7OztBQ1ZUOzs7O0FBRUE7Ozs7QUFDQTs7Ozs7Ozs7Ozs7O0lBRU0saUI7Ozs7Ozs7Ozs7OzZCQUNLO0FBQ1AsV0FBSyxHQUFMLENBQVMsSUFBVDs7QUE2Q0EsV0FBSyxHQUFMLENBQVMsSUFBVCxDQUFjLE1BQWQsRUFBc0IsTUFBdEIsQ0FBNkIsVUFBQyxFQUFELEVBQVE7QUFDbkMsV0FBRyxjQUFIOztBQUVBLFlBQUksY0FBYyxFQUFFLGVBQUYsRUFBbUIsR0FBbkIsRUFBbEI7QUFBQSxZQUNJLGVBQWUsU0FBUyxFQUFFLGdCQUFGLEVBQW9CLEdBQXBCLEVBQVQsRUFBb0MsRUFBcEMsQ0FEbkI7QUFBQSxZQUVJLGdCQUFnQixTQUFTLEVBQUUsaUJBQUYsRUFBcUIsR0FBckIsRUFBVCxFQUFxQyxFQUFyQyxDQUZwQjs7QUFJQSxZQUFJLGFBQWEsZUFBZSxZQUFmLEVBQTZCLGFBQTdCLENBQWpCO0FBQUEsWUFDSSxNQUFNLFNBQVMsSUFBVCxHQUFnQixXQUFoQixDQUE0QixHQUR0Qzs7QUFHQSx1Q0FBcUIsTUFBckIsQ0FBNEIsVUFBNUIsRUFBd0M7QUFDdEMsc0JBQVksR0FEMEI7QUFFdEMsZ0JBQU0sV0FGZ0M7QUFHdEMsaUJBQU8sWUFIK0I7QUFJdEMsa0JBQVE7QUFKOEIsU0FBeEMsRUFLRyxHQUxILEVBS1EsVUFBUyxVQUFULEVBQXFCO0FBQzNCLDZDQUFrQixVQUFsQjtBQUNELFNBUEQ7QUFRRCxPQWxCRDtBQW1CRDs7Ozs7O0FBR0gsU0FBUyxjQUFULENBQXdCLEtBQXhCLEVBQStCLE1BQS9CLEVBQXVDO0FBQ3JDLE1BQUksU0FBUyxFQUFiO0FBQ0EsT0FBSSxJQUFJLElBQUksQ0FBWixFQUFlLElBQUksTUFBbkIsRUFBMkIsR0FBM0IsRUFBZ0M7QUFDOUIsU0FBSSxJQUFJLElBQUksQ0FBWixFQUFlLElBQUksS0FBbkIsRUFBMEIsR0FBMUIsRUFBK0I7QUFDN0IsYUFBVSxDQUFWLFNBQWUsQ0FBZixJQUFzQjtBQUNwQixhQUFLLFNBRGU7QUFFcEIsbUJBQVcsS0FBSyxHQUFMO0FBRlMsT0FBdEI7QUFJRDtBQUNGOztBQUVELFNBQU8sTUFBUDtBQUNEOztRQUU2QixPLEdBQXJCLGlCOzs7Ozs7Ozs7Ozs7QUN4RlQ7Ozs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBSSxpQkFBaUIsOEJBQXJCOztJQUVNLGE7Ozs7Ozs7Ozs7OzZCQUNLO0FBQUE7O0FBQ1AsV0FBSyxHQUFMLENBQVMsSUFBVDs7QUFJQSxVQUFJLE1BQU0sU0FBUyxJQUFULEdBQWdCLFdBQWhCLENBQTRCLEdBQXRDO0FBQ0EscUJBQWUsZUFBZixDQUErQixHQUEvQixFQUFvQyxVQUFDLFdBQUQsRUFBYyxRQUFkLEVBQTJCO0FBQzdELFlBQUksWUFBWSxPQUFLLEdBQUwsQ0FBUyxJQUFULENBQWMsV0FBZCxDQUFoQjtBQUNBLGlCQUFTLE9BQVQsQ0FBaUIsVUFBQyxPQUFELEVBQVUsQ0FBVixFQUFnQjtBQUMvQixvQkFBVSxNQUFWLHFDQUN1QixZQUFZLENBQVosQ0FEdkIsVUFDMEMsUUFBUSxJQURsRDtBQUdELFNBSkQ7QUFLRCxPQVBEO0FBUUQ7Ozs7OztRQUd1QixPLEdBQWpCLGE7Ozs7Ozs7Ozs7OztBQ3ZCVDs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7QUFFQSxJQUFJLGlCQUFpQiw4QkFBckI7O0lBRU0sVzs7O0FBQ0osdUJBQVksTUFBWixFQUFvQjtBQUFBOztBQUFBOztBQUVsQixVQUFLLEVBQUwsR0FBVSxPQUFPLEVBQWpCO0FBRmtCO0FBR25COzs7OzZCQUVRO0FBQUE7O0FBQ1AsV0FBSyxHQUFMLENBQVMsSUFBVDs7QUFvQkEsZUFBUyxJQUFULEdBQWdCLGtCQUFoQixDQUFtQyxVQUFDLElBQUQsRUFBVTtBQUMzQyxZQUFJLElBQUosRUFBVTtBQUNSLGlCQUFLLENBQUwsQ0FBTyxlQUFQLEVBQXdCLElBQXhCO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsaUJBQUssQ0FBTCxDQUFPLGVBQVAsRUFBd0IsSUFBeEI7QUFDRDtBQUNGLE9BTkQ7O0FBUUEsVUFBSSxVQUFVLHNCQUFZLEtBQUssQ0FBTCxDQUFPLG1CQUFQLENBQVosRUFBeUMsS0FBSyxFQUE5QyxDQUFkOztBQUVBLHFCQUFlLFVBQWYsQ0FBMEIsS0FBSyxFQUEvQixFQUFtQyxVQUFDLFdBQUQsRUFBaUI7QUFDbEQsWUFBSSxhQUFhO0FBQ2YsaUJBQU8sWUFBWSxLQURKO0FBRWYsa0JBQVEsWUFBWTtBQUZMLFNBQWpCOztBQUtBLGdCQUFRLElBQVIsQ0FBYSxFQUFFLFFBQUYsRUFBWSxLQUFaLEVBQWIsRUFBa0MsVUFBbEMsRUFBOEMsWUFBTTtBQUNsRCxpQkFBSyxDQUFMLENBQU8sZUFBUCxFQUF3QixJQUF4QixDQUE2QixZQUFZLElBQXpDO0FBQ0EsaUJBQUssQ0FBTCxDQUFPLGdCQUFQLEVBQXlCLElBQXpCLENBQThCLFlBQVksS0FBMUM7QUFDQSxpQkFBSyxDQUFMLENBQU8sUUFBUCxFQUFpQixNQUFqQjtBQUNELFNBSkQ7O0FBTUEsWUFBSSxvQkFBb0IsT0FBSyxDQUFMLENBQU8scUJBQVAsQ0FBeEI7QUFDQSx1Q0FBcUIsaUJBQXJCLEVBQXdDLE9BQUssRUFBN0MsRUFBaUQsV0FBakQsRUFBOEQsTUFBOUQ7O0FBRUEsWUFBSSxpQkFBaUIsT0FBSyxDQUFMLENBQU8sa0JBQVAsQ0FBckI7QUFDQSxvQ0FBa0IsY0FBbEIsRUFBa0MsT0FBSyxFQUF2QyxFQUEyQyxXQUEzQyxFQUF3RCxNQUF4RDtBQUNELE9BakJEO0FBa0JEOzs7Ozs7UUFHcUIsTyxHQUFmLFc7Ozs7Ozs7Ozs7OztBQ2xFVDs7Ozs7Ozs7SUFFTSxRO0FBQ0osc0JBQWM7QUFBQTs7QUFDVixTQUFLLEdBQUwsR0FBVyxFQUFFLEVBQUYsQ0FBWDtBQUNIOzs7OzZCQUVRO0FBQ1AsV0FBSyxHQUFMLENBQVMsSUFBVDs7QUFhQSxVQUFJLFVBQVUsc0JBQVksS0FBSyxHQUFMLENBQVMsSUFBVCxDQUFjLFNBQWQsQ0FBWixFQUFzQyxzQkFBdEMsQ0FBZDtBQUNBLGNBQVEsSUFBUixDQUFhLEdBQWIsRUFBa0IsRUFBRSxPQUFPLEdBQVQsRUFBYyxRQUFRLEVBQXRCLEVBQWxCLEVBQThDLFlBQU07QUFDbEQ7QUFDRCxPQUZEO0FBR0Q7Ozs7OztRQUdrQixPLEdBQVosUTs7Ozs7Ozs7Ozs7O0FDNUJUOzs7Ozs7Ozs7Ozs7SUFFTSxzQjs7Ozs7Ozs7Ozs7NkJBQ0s7QUFDUCxXQUFLLEdBQUwsQ0FBUyxJQUFUO0FBb0ZEOzs7Ozs7UUFHZ0MsTyxHQUExQixzQjs7Ozs7Ozs7Ozs7O0FDM0ZUOzs7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUVBLElBQUksZUFBZSw0QkFBbkI7O0lBRU0saUI7Ozs7Ozs7Ozs7OzZCQUNLO0FBQUE7O0FBQ1AsV0FBSyxHQUFMLENBQVMsSUFBVDs7QUFRQSxVQUFJLGtCQUFrQixhQUFhLGtCQUFiLEVBQXRCOztBQUVBLFdBQUksSUFBSSxHQUFSLElBQWUsZUFBZixFQUFnQztBQUM5QixZQUFJLFFBQVEsZ0JBQWdCLEdBQWhCLENBQVo7QUFDQSxhQUFLLEdBQUwsQ0FBUyxJQUFULENBQWMsYUFBZCxFQUE2QixNQUE3Qix5SkFFK0UsR0FGL0UscUVBRzBDLE1BQU0sSUFIaEQseURBSXNDLE1BQU0sV0FKNUM7QUFPRDs7QUFFRCxXQUFLLEdBQUwsQ0FBUyxJQUFULENBQWMsZ0JBQWQsRUFBZ0MsS0FBaEMsQ0FBc0MsVUFBUyxFQUFULEVBQWE7QUFDakQsV0FBRyxjQUFIOztBQUVBLFlBQUksTUFBTSxFQUFFLElBQUYsQ0FBVjtBQUFBLFlBQ0ksTUFBTSxJQUFJLElBQUosQ0FBUyxPQUFULENBRFY7QUFBQSxZQUVJLFNBQVMsZ0JBQWdCLEdBQWhCLENBRmI7O0FBSUEscUJBQWEsT0FBYixDQUFxQixHQUFyQixFQUEwQixNQUExQixFQUFrQyxZQUFXO0FBQzNDLGNBQUksSUFBSjtBQUNELFNBRkQ7QUFHRCxPQVZEOztBQVlBLG1CQUFhLGtCQUFiLENBQWdDLFVBQUMsTUFBRCxFQUFZO0FBQzFDLGFBQUksSUFBSSxJQUFSLElBQWUsTUFBZixFQUF1QjtBQUNyQixpQkFBSyxHQUFMLENBQVMsSUFBVCxnQ0FBMkMsSUFBM0MsUUFBbUQsSUFBbkQ7QUFDRDtBQUNGLE9BSkQ7QUFLRDs7Ozs7O1FBRzJCLE8sR0FBckIsaUI7Ozs7Ozs7Ozs7Ozs7SUNoREgsSTtBQUNKLGtCQUFjO0FBQUE7O0FBQ1osU0FBSyxHQUFMLEdBQVcsRUFBRSxPQUFGLENBQVg7QUFDRDs7OztzQkFFQyxRLEVBQVU7QUFDVixhQUFPLEtBQUssR0FBTCxDQUFTLElBQVQsQ0FBYyxRQUFkLENBQVA7QUFDRDs7Ozs7O1FBR2MsTyxHQUFSLEkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgTWFjcm9MaWJyYXJ5ID0gcmVxdWlyZSgnbWFjcm8tbGlicmFyeScpO1xuXG52YXIgbWFjcm9MaWJyYXJ5ID0gbmV3IE1hY3JvTGlicmFyeSgpO1xubWFjcm9MaWJyYXJ5LnJlZ2lzdGVyTWFjcm9zKCk7XG5cbmNsYXNzIERpc3BsYXlDb3VwbGVyIHtcbiAgY29uc3RydWN0b3IoZGIpIHtcbiAgICB0aGlzLmRiID0gZGI7XG4gICAgdGhpcy5zdGFydGluZ1VwID0gdHJ1ZTtcbiAgfVxuXG4gIHN0YXRpYyByZWdpc3RlcmVkTWFjcm9zKCkge1xuICAgIHJldHVybiBtYWNyb0xpYnJhcnkucmVnaXN0ZXJlZE1hY3JvcygpO1xuICB9XG5cbiAgc3RhcnRVcCh7ZGltZW5zaW9ucywgY2FsbGJhY2tzfSkge1xuICAgIHRoaXMuYWN0aXZhdGVNYWNybyA9IG1hY3JvTGlicmFyeS5sb2FkTWFjcm8oJ3N0YXJ0LXVwJywge1xuICAgICAgZGltZW5zaW9uczogZGltZW5zaW9ucyxcbiAgICAgIGNhbGxiYWNrczogY2FsbGJhY2tzXG4gICAgfSk7XG4gICAgdGhpcy5hY3RpdmF0ZU1hY3JvLnN0YXJ0KCk7XG4gIH1cblxuICBkZW1vKGRpc3BsYXlDb25maWcsIGNhbGxiYWNrcykge1xuICAgIHZhciBuZXh0ID0gKCkgPT4ge1xuICAgICAgdmFyIG1hY3JvID0gZGlzcGxheUNvbmZpZy5tYWNybyxcbiAgICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgICAgY29uZmlnOiBkaXNwbGF5Q29uZmlnLm1hY3JvQ29uZmlnIHx8IHt9LFxuICAgICAgICAgICAgZGltZW5zaW9uczoge1xuICAgICAgICAgICAgICB3aWR0aDogZGlzcGxheUNvbmZpZy53aWR0aCxcbiAgICAgICAgICAgICAgaGVpZ2h0OiBkaXNwbGF5Q29uZmlnLmhlaWdodFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNhbGxiYWNrczoge1xuICAgICAgICAgICAgICBvblBpeGVsQ2hhbmdlOiAoeSwgeCwgaGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2tzLm9uUGl4ZWxDaGFuZ2UoeSwgeCwgaGV4LCBkaXNwbGF5Q29uZmlnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG5cbiAgICAgIGlmKHRoaXMuYWN0aXZhdGVNYWNybykge1xuICAgICAgICB0aGlzLmFjdGl2YXRlTWFjcm8uc3RvcCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5hY3RpdmF0ZU1hY3JvID0gbWFjcm9MaWJyYXJ5LmxvYWRNYWNybyhtYWNybywgb3B0aW9ucyk7XG4gICAgICB0aGlzLmFjdGl2YXRlTWFjcm8uc3RhcnQoKTtcbiAgICB9O1xuXG4gICAgaWYodGhpcy5zdGFydGluZ1VwKSB7XG4gICAgICBjYWxsYmFja3Mub25SZWFkeShkaXNwbGF5Q29uZmlnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuc3RhcnRpbmdVcCA9IGZhbHNlO1xuICAgICAgICBuZXh0KCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dCgpXG4gICAgfVxuICB9XG5cbiAgY29ubmVjdChkaXNwbGF5S2V5LCBjYWxsYmFja3MpIHtcbiAgICB0aGlzLmRiLnJlZihgZGlzcGxheXMvJHtkaXNwbGF5S2V5fS9gKS5vbigndmFsdWUnLCAoc25hcHNob3QpID0+IHtcbiAgICAgIHZhciBkaXNwbGF5RGF0YSA9IHNuYXBzaG90LnZhbCgpO1xuXG4gICAgICB2YXIgbmV4dCA9ICgpID0+IHtcbiAgICAgICAgdmFyIG1hY3JvID0gZGlzcGxheURhdGEubWFjcm8sXG4gICAgICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgICAgICBjb25maWc6IGRpc3BsYXlEYXRhLm1hY3JvQ29uZmlnIHx8IHt9LFxuICAgICAgICAgICAgICBkaW1lbnNpb25zOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IGRpc3BsYXlEYXRhLndpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogZGlzcGxheURhdGEuaGVpZ2h0XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGRiOiB0aGlzLmRiLFxuICAgICAgICAgICAgICBjYWxsYmFja3M6IHtcbiAgICAgICAgICAgICAgICBvblBpeGVsQ2hhbmdlOiAoeSwgeCwgaGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICBjYWxsYmFja3Mub25QaXhlbENoYW5nZSh5LCB4LCBoZXgsIGRpc3BsYXlEYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgaWYobWFjcm8gPT09IFwicHJvZ3JhbW1hYmxlXCIpIHtcbiAgICAgICAgICBvcHRpb25zLmNvbmZpZy5tYXRyaXggPSBkaXNwbGF5RGF0YS5tYXRyaXg7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLmFjdGl2YXRlTWFjcm8pIHtcbiAgICAgICAgICB0aGlzLmFjdGl2YXRlTWFjcm8uc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWN0aXZhdGVNYWNybyA9IG1hY3JvTGlicmFyeS5sb2FkTWFjcm8obWFjcm8sIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmFjdGl2YXRlTWFjcm8uc3RhcnQoKTtcbiAgICAgIH07XG5cbiAgICAgIGlmKHRoaXMuc3RhcnRpbmdVcCkge1xuICAgICAgICBjYWxsYmFja3Mub25SZWFkeShkaXNwbGF5RGF0YSwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuc3RhcnRpbmdVcCA9IGZhbHNlO1xuICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0KClcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpc3BsYXlDb3VwbGVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBQcm9ncmFtbWFibGVNYWNybyA9IHJlcXVpcmUoJy4vbWFjcm9zL3Byb2dyYW1tYWJsZScpLFxuICAgIFR3aW5rbGVNYWNybyA9IHJlcXVpcmUoJy4vbWFjcm9zL3R3aW5rbGUnKSxcbiAgICBTdGFydFVwTWFjcm8gPSByZXF1aXJlKCcuL21hY3Jvcy9zdGFydC11cCcpLFxuICAgIFNvbGlkQ29sb3JNYWNybyA9IHJlcXVpcmUoJy4vbWFjcm9zL3NvbGlkLWNvbG9yJyksXG4gICAgVW5zdXBwb3J0ZWRNYWNybyA9IHJlcXVpcmUoJy4vbWFjcm9zL3Vuc3VwcG9ydGVkJyksXG4gICAgVGV4dE1hY3JvID0gcmVxdWlyZSgnLi9tYWNyb3MvdGV4dCcpO1xuXG52YXIgTWFjcm9Db25maWcgPSByZXF1aXJlKCcuL21hY3JvLWNvbmZpZycpO1xuXG5jbGFzcyBNYWNyb0xpYnJhcnkge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLk1hY3JvcyA9IHt9O1xuICB9XG5cbiAgcmVnaXN0ZXJNYWNyb3MoKSB7XG4gICAgdGhpcy5NYWNyb3NbUHJvZ3JhbW1hYmxlTWFjcm8uaWRlbnRpZmllcl0gPSBQcm9ncmFtbWFibGVNYWNybztcbiAgICB0aGlzLk1hY3Jvc1tUd2lua2xlTWFjcm8uaWRlbnRpZmllcl0gPSBUd2lua2xlTWFjcm87XG4gICAgdGhpcy5NYWNyb3NbU3RhcnRVcE1hY3JvLmlkZW50aWZpZXJdID0gU3RhcnRVcE1hY3JvO1xuICAgIHRoaXMuTWFjcm9zW1NvbGlkQ29sb3JNYWNyby5pZGVudGlmaWVyXSA9IFNvbGlkQ29sb3JNYWNybztcbiAgICB0aGlzLk1hY3Jvc1tUZXh0TWFjcm8uaWRlbnRpZmllcl0gPSBUZXh0TWFjcm87XG4gIH1cblxuICBhdmFpbGFibGVNYWNyb3MoKSB7XG4gICAgcmV0dXJuIE1hY3JvQ29uZmlnO1xuICB9XG5cbiAgbG9hZE1hY3JvKG5hbWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgTWFjcm8gPSB0aGlzLk1hY3Jvc1tuYW1lXSB8fCBVbnN1cHBvcnRlZE1hY3JvO1xuICAgIHJldHVybiBuZXcgTWFjcm8ob3B0aW9ucyk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNYWNyb0xpYnJhcnk7XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwidHdpbmtsZVwiOiB7XG4gICAgXCJuYW1lXCI6IFwiVHdpbmtsZVwiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJDaG9vc2UgYSBjb2xvciBhbmQgcmFuZG9tbHkgdG9nZ2xlIHRoZSBicmlnaHRuZXNzIG9mIGVhY2ggTEVEIG9uIHRoZSBib2FyZC5cIlxuICB9LFxuICBcInByb2dyYW1tYWJsZVwiOiB7XG4gICAgXCJuYW1lXCI6IFwiUHJvZ3JhbW1hYmxlXCIsXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIlVwZGF0ZSBlYWNoIExFRCB2aWEgYSByZXN0ZnVsIGludGVyZmFjZSBwcm9ncmFtbWF0aWNhbGx5LlwiXG4gIH0sXG4gIFwic29saWQtY29sb3JcIjoge1xuICAgIFwibmFtZVwiOiBcIlNvbGlkIENvbG9yXCIsXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIkZpbGwgdGhlIGJvYXJkIHdpdGggb25lIHNvbGlkIGNvbG9yLlwiXG4gIH0sXG4gIFwic3RhcnQtdXBcIjoge1xuICAgIFwibmFtZVwiOiBcIlN0YXJ0IHVwXCIsXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIlRoZSBzdGFydGluZyB1cCBhbmltYXRpb25cIlxuICB9LFxuICBcInRleHRcIjoge1xuICAgIFwibmFtZVwiOiBcIlRleHRcIixcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiRGlzcGxheSBhbnkgdGV4dCB3aXRoIGEgc3BlY2lmaWMgY29sb3IgYW5kIGZvbnRcIlxuICB9LFxuICBcInVuc3VwcG9ydGVkXCI6IHtcbiAgICBcIm5hbWVcIjogXCJVbnN1cHBvcnRlZFwiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaGVuIGEgbWFjcm8gY2FuJ3QgYmUgZm91bmQsIHRoaXMgaXMgbWFjcm8gaXMgdXNlZFwiXG4gIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5jbGFzcyBNYWNybyB7XG4gIGNvbnN0cnVjdG9yKHtjb25maWcsIGRpbWVuc2lvbnMsIGRiLCBjYWxsYmFja3N9KSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5kaW1lbnNpb25zID0gZGltZW5zaW9ucztcbiAgICB0aGlzLmRiID0gZGI7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBjYWxsYmFja3M7XG5cbiAgICBpZighdGhpcy5jb25zdHJ1Y3Rvci5pZGVudGlmaWVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBIG1hY3JvIGlzIG1pc3NpbmcgaXQncyBjbGFzcyBpZGVudGlmaWVyIGZ1bmN0aW9uXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZighdGhpcy5zdGFydCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7dGhpcy5pZGVudGlmaWVyKCl9IGRpZCBub3QgaW1wbGVtZW50IGEgc3RhcnQgbWV0aG9kYCk7XG4gICAgICB9XG5cbiAgICAgIGlmKCF0aGlzLnN0b3ApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3RoaXMuaWRlbnRpZmllcigpfSBkaWQgbm90IGltcGxlbWVudCBhIHN0b3AgbWV0aG9kYCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0Q29sb3IoY29sb3IpIHtcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5kaW1lbnNpb25zLmhlaWdodCxcbiAgICAgICAgd2lkdGggPSB0aGlzLmRpbWVuc2lvbnMud2lkdGg7XG4gICAgICAgIFxuICAgIGZvcih2YXIgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgICAgZm9yKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcbiAgICAgICAgdGhpcy5jYWxsYmFja3Mub25QaXhlbENoYW5nZSh5LCB4LCBjb2xvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFjcm87XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIE1hY3JvID0gcmVxdWlyZSgnLi9tYWNybycpO1xuXG5jb25zdCBpZGVudGlmaWVyID0gJ3Byb2dyYW1tYWJsZSc7XG5cbmNsYXNzIFByb2dyYW1tYWJsZU1hY3JvIGV4dGVuZHMgTWFjcm8ge1xuICBzdGF0aWMgZ2V0IGlkZW50aWZpZXIoKSB7XG4gICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB2YXIgbWF0cml4S2V5ID0gdGhpcy5jb25maWcubWF0cml4O1xuICAgIHRoaXMubWF0cml4UmVmID0gdGhpcy5kYi5yZWYoYG1hdHJpY2VzLyR7bWF0cml4S2V5fWApO1xuICAgIHRoaXMubWF0cml4UmVmLm9uY2UoJ3ZhbHVlJykudGhlbigoc25hcHNob3QpID0+IHtcbiAgICAgIHZhciBkYXRhID0gc25hcHNob3QudmFsKCk7XG5cbiAgICAgIGZvcihsZXQga2V5IGluIHNuYXBzaG90LnZhbCgpKSB7XG4gICAgICAgIHZhciBoZXggPSBkYXRhW2tleV0uaGV4LFxuICAgICAgICAgICAgW3ksIHhdID0ga2V5LnNwbGl0KCc6Jyk7XG5cbiAgICAgICAgdGhpcy5jYWxsYmFja3Mub25QaXhlbENoYW5nZSh5LCB4LCBoZXgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5jaGlsZENoYW5nZWRDYWxsYmFjayA9IHRoaXMubWF0cml4UmVmLm9uKCdjaGlsZF9jaGFuZ2VkJywgKHNuYXBzaG90KSA9PiB7XG4gICAgICB2YXIgaGV4ID0gc25hcHNob3QudmFsKCkuaGV4LFxuICAgICAgICAgIFt5LCB4XSA9IHNuYXBzaG90LmtleS5zcGxpdCgnOicpO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrcy5vblBpeGVsQ2hhbmdlKHksIHgsIGhleCk7XG4gICAgfSk7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIHRoaXMubWF0cml4UmVmLm9mZignY2hpbGRfY2hhbmdlZCcsIHRoaXMuY2hpbGRDaGFuZ2VkQ2FsbGJhY2spO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvZ3JhbW1hYmxlTWFjcm87XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIE1hY3JvID0gcmVxdWlyZSgnLi9tYWNybycpO1xuXG5jb25zdCBpZGVudGlmaWVyID0gJ3NvbGlkLWNvbG9yJztcblxuY2xhc3MgU29saWRDb2xvck1hY3JvIGV4dGVuZHMgTWFjcm8ge1xuICBzdGF0aWMgZ2V0IGlkZW50aWZpZXIoKSB7XG4gICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5jb25maWcgfHwgdGhpcy5kZWZhdWx0Q29uZmlnKCk7XG5cbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5kaW1lbnNpb25zLmhlaWdodCxcbiAgICAgICAgd2lkdGggPSB0aGlzLmRpbWVuc2lvbnMud2lkdGgsXG4gICAgICAgIGNvbG9yID0gdGhpcy5jb25maWcuY29sb3I7XG5cbiAgICBmb3IodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgIGZvcih2YXIgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLm9uUGl4ZWxDaGFuZ2UoeSwgeCwgY29sb3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgLy8gbm90aGluZy4uLlxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU29saWRDb2xvck1hY3JvO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBNYWNybyA9IHJlcXVpcmUoJy4vbWFjcm8nKTtcblxuY29uc3QgaWRlbnRpZmllciA9ICdzdGFydC11cCc7XG5cbmNsYXNzIFN0YXJ0VXBNYWNybyBleHRlbmRzIE1hY3JvIHtcbiAgc3RhdGljIGdldCBpZGVudGlmaWVyKCkge1xuICAgIHJldHVybiBpZGVudGlmaWVyO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5zZXRDb2xvcignIzAwMDAwMCcpO1xuXG4gICAgdGhpcy5mcmFtZUluZGV4ID0gMDtcbiAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgZm9yIChsZXQga2V5IGluIGZyYW1lc1t0aGlzLmZyYW1lSW5kZXhdKSB7XG4gICAgICAgIHZhciBbeSwgeF0gPSBrZXkuc3BsaXQoJzonKSxcbiAgICAgICAgICAgIGhleCA9IGZyYW1lc1t0aGlzLmZyYW1lSW5kZXhdW2tleV0uaGV4O1xuICAgICAgICB0aGlzLmNhbGxiYWNrcy5vblBpeGVsQ2hhbmdlKHksIHgsIGhleCk7XG4gICAgICB9XG5cbiAgICAgIGlmKHRoaXMuZnJhbWVJbmRleCA9PSBmcmFtZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICB0aGlzLmZyYW1lSW5kZXggPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5mcmFtZUluZGV4ID0gdGhpcy5mcmFtZUluZGV4ICsgMTtcbiAgICAgIH1cblxuICAgIH0sIDEwMCk7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XG4gIH1cbn1cblxudmFyIGZyYW1lcyA9IFtcbiAge1xuICAgICcwOjAnOiB7aGV4OiAnIzk5MDAwMCd9LFxuICAgICcwOjEnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjInOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjMnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjQnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjUnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjYnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjcnOiB7aGV4OiAnIzAwMDAwMCd9XG4gIH0sIHtcbiAgICAnMDowJzoge2hleDogJyM5OTAwMDAnfSxcbiAgICAnMDoxJzoge2hleDogJyNDQzQ0MDAnfSxcbiAgICAnMDoyJzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDozJzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo0Jzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo1Jzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo2Jzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo3Jzoge2hleDogJyMwMDAwMDAnfVxuICB9LCB7XG4gICAgJzA6MCc6IHtoZXg6ICcjOTkwMDAwJ30sXG4gICAgJzA6MSc6IHtoZXg6ICcjQ0M0NDAwJ30sXG4gICAgJzA6Mic6IHtoZXg6ICcjRkZBQTAwJ30sXG4gICAgJzA6Myc6IHtoZXg6ICcjMDAwMDAwJ30sXG4gICAgJzA6NCc6IHtoZXg6ICcjMDAwMDAwJ30sXG4gICAgJzA6NSc6IHtoZXg6ICcjMDAwMDAwJ30sXG4gICAgJzA6Nic6IHtoZXg6ICcjMDAwMDAwJ30sXG4gICAgJzA6Nyc6IHtoZXg6ICcjMDAwMDAwJ31cbiAgfSwge1xuICAgICcwOjAnOiB7aGV4OiAnIzk5MDAwMCd9LFxuICAgICcwOjEnOiB7aGV4OiAnI0NDNDQwMCd9LFxuICAgICcwOjInOiB7aGV4OiAnI0ZGQUEwMCd9LFxuICAgICcwOjMnOiB7aGV4OiAnI0NDQ0MwMCd9LFxuICAgICcwOjQnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjUnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjYnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjcnOiB7aGV4OiAnIzAwMDAwMCd9XG4gIH0sIHtcbiAgICAnMDowJzoge2hleDogJyM5OTAwMDAnfSxcbiAgICAnMDoxJzoge2hleDogJyNDQzQ0MDAnfSxcbiAgICAnMDoyJzoge2hleDogJyNGRkFBMDAnfSxcbiAgICAnMDozJzoge2hleDogJyNDQ0NDMDAnfSxcbiAgICAnMDo0Jzoge2hleDogJyM4OENDMDAnfSxcbiAgICAnMDo1Jzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo2Jzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo3Jzoge2hleDogJyMwMDAwMDAnfVxuICB9LCB7XG4gICAgJzA6MCc6IHtoZXg6ICcjOTkwMDAwJ30sXG4gICAgJzA6MSc6IHtoZXg6ICcjQ0M0NDAwJ30sXG4gICAgJzA6Mic6IHtoZXg6ICcjRkZBQTAwJ30sXG4gICAgJzA6Myc6IHtoZXg6ICcjQ0NDQzAwJ30sXG4gICAgJzA6NCc6IHtoZXg6ICcjODhDQzAwJ30sXG4gICAgJzA6NSc6IHtoZXg6ICcjMDBDQzg4J30sXG4gICAgJzA6Nic6IHtoZXg6ICcjMDAwMDAwJ30sXG4gICAgJzA6Nyc6IHtoZXg6ICcjMDAwMDAwJ31cbiAgfSwge1xuICAgICcwOjAnOiB7aGV4OiAnIzk5MDAwMCd9LFxuICAgICcwOjEnOiB7aGV4OiAnI0NDNDQwMCd9LFxuICAgICcwOjInOiB7aGV4OiAnI0ZGQUEwMCd9LFxuICAgICcwOjMnOiB7aGV4OiAnI0NDQ0MwMCd9LFxuICAgICcwOjQnOiB7aGV4OiAnIzg4Q0MwMCd9LFxuICAgICcwOjUnOiB7aGV4OiAnIzAwQ0M4OCd9LFxuICAgICcwOjYnOiB7aGV4OiAnIzAwNjZDQyd9LFxuICAgICcwOjcnOiB7aGV4OiAnIzAwMDAwMCd9XG4gIH0sIHtcbiAgICAnMDowJzoge2hleDogJyM5OTAwMDAnfSxcbiAgICAnMDoxJzoge2hleDogJyNDQzQ0MDAnfSxcbiAgICAnMDoyJzoge2hleDogJyNGRkFBMDAnfSxcbiAgICAnMDozJzoge2hleDogJyNDQ0NDMDAnfSxcbiAgICAnMDo0Jzoge2hleDogJyM4OENDMDAnfSxcbiAgICAnMDo1Jzoge2hleDogJyMwMENDODgnfSxcbiAgICAnMDo2Jzoge2hleDogJyMwMDY2Q0MnfSxcbiAgICAnMDo3Jzoge2hleDogJyNDQzAwQ0MnfVxuICB9XG5dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJ0VXBNYWNybztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgTWFjcm8gPSByZXF1aXJlKCcuL21hY3JvJyk7XG52YXIgVHlwZVdyaXRlciA9IHJlcXVpcmUoJ3R5cGV3cml0ZXInKTtcblxuY29uc3QgaWRlbnRpZmllciA9ICd0ZXh0JztcblxuY2xhc3MgU29saWRDb2xvck1hY3JvIGV4dGVuZHMgTWFjcm8ge1xuICBzdGF0aWMgZ2V0IGlkZW50aWZpZXIoKSB7XG4gICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5jb25maWc7XG4gICAgdmFyIGNvb3JkaW5hdGVzID0gW107XG4gICAgdmFyIHR5cGVXcml0ZXIgPSBuZXcgVHlwZVdyaXRlcih7IGZvbnQ6IHRoaXMuY29uZmlnLmZvbnR9KTtcbiAgICB0eXBlV3JpdGVyLnRleHQodGhpcy5jb25maWcudGV4dCwgKGl0ZW0pID0+IHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLm9uUGl4ZWxDaGFuZ2UoaXRlbS55LCBpdGVtLngsIHRoaXMuY29uZmlnLmNvbG9yKTtcbiAgICAgIGNvb3JkaW5hdGVzLnB1c2goe3k6IGl0ZW0ueSwgeDogaXRlbS54fSk7XG4gICAgfSk7XG5cbiAgICB2YXIgbWVzc2FnZUxlbmd0aCA9IE1hdGgubWF4LmFwcGx5KE1hdGgsIGNvb3JkaW5hdGVzLm1hcChmdW5jdGlvbihjb29yZGluYXRlKSB7XG4gICAgICByZXR1cm4gY29vcmRpbmF0ZS54O1xuICAgIH0pKTtcblxuICAgIGlmIChtZXNzYWdlTGVuZ3RoID4gdGhpcy5kaW1lbnNpb25zLndpZHRoKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdmFyIG9mZnNldCA9IDA7XG4gICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgY29vcmRpbmF0ZXMuZm9yRWFjaCgoY29vcmRpbmF0ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFja3Mub25QaXhlbENoYW5nZShjb29yZGluYXRlLnksIGNvb3JkaW5hdGUueCAtIG9mZnNldCwgJyMwMDAwMDAnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb29yZGluYXRlcy5mb3JFYWNoKChjb29yZGluYXRlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5vblBpeGVsQ2hhbmdlKGNvb3JkaW5hdGUueSwgY29vcmRpbmF0ZS54IC0gKG9mZnNldCArIDEpLCB0aGlzLmNvbmZpZy5jb2xvcik7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZihvZmZzZXQgPiBtZXNzYWdlTGVuZ3RoKSB7XG4gICAgICAgICAgICBvZmZzZXQgPSAtKHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgb2Zmc2V0ICs9IDE7XG4gICAgICAgIH0sIHRoaXMuY29uZmlnLm1hcnF1ZWVTcGVlZCk7XG4gICAgICB9LCB0aGlzLmNvbmZpZy5tYXJxdWVlSW5pdGlhbERlbGF5KTtcbiAgICB9XG4gIH1cblxuICBzdG9wKCkge1xuICAgIGlmICh0aGlzLmNvbmZpZy5tYXJxdWVlKSB7XG4gICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNvbGlkQ29sb3JNYWNybztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgTWFjcm8gPSByZXF1aXJlKCcuL21hY3JvJyk7XG5cbmNvbnN0IGlkZW50aWZpZXIgPSAndHdpbmtsZSc7XG5cbmNsYXNzIFR3aW5rbGVNYWNybyBleHRlbmRzIE1hY3JvIHtcbiAgc3RhdGljIGdldCBpZGVudGlmaWVyKCkge1xuICAgIHJldHVybiBpZGVudGlmaWVyO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdmFyIGhlaWdodCA9IHRoaXMuZGltZW5zaW9ucy5oZWlnaHQsXG4gICAgICAgIHdpZHRoID0gdGhpcy5kaW1lbnNpb25zLndpZHRoLFxuICAgICAgICBzZWVkQ29sb3IgPSB0aGlzLmNvbmZpZy5zZWVkQ29sb3I7XG5cbiAgICBmb3IodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgIGZvcih2YXIgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLm9uUGl4ZWxDaGFuZ2UoeSwgeCwgZ2VuZXJhdGVDb2xvclNoYWRlKHNlZWRDb2xvcikpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgMTAwOyBpKyspIHtcbiAgICAgICAgdmFyIHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoKGhlaWdodCAtIDEpIC0gMCArIDEpKSArIDA7XG4gICAgICAgIHZhciB4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKCh3aWR0aCAtIDEpIC0gMCArIDEpKSArIDA7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLm9uUGl4ZWxDaGFuZ2UoeSwgeCwgZ2VuZXJhdGVDb2xvclNoYWRlKHNlZWRDb2xvcikpO1xuICAgICAgfVxuICAgIH0sIDEwMClcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUNvbG9yU2hhZGUoc2VlZENvbG9yKSB7XG4gIHZhciBjb2xvcnMgPSBbXTtcblxuICBjb2xvcnMucHVzaChjb2xvckx1bWluYW5jZShzZWVkQ29sb3IsIDApKVxuICBjb2xvcnMucHVzaChjb2xvckx1bWluYW5jZShzZWVkQ29sb3IsIC0wLjUpKVxuICBjb2xvcnMucHVzaChjb2xvckx1bWluYW5jZShzZWVkQ29sb3IsIC0wLjgpKVxuICBjb2xvcnMucHVzaChjb2xvckx1bWluYW5jZShzZWVkQ29sb3IsIC0wLjgpKVxuICBjb2xvcnMucHVzaChjb2xvckx1bWluYW5jZShzZWVkQ29sb3IsIC0wLjgpKVxuICBjb2xvcnMucHVzaChjb2xvckx1bWluYW5jZShzZWVkQ29sb3IsIC0xKSlcblxuICB2YXIgaW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoNSAtIDAgKyAxKSkgKyAwO1xuXG4gIHJldHVybiBjb2xvcnNbaW5kZXhdO1xufVxuXG5mdW5jdGlvbiBjb2xvckx1bWluYW5jZShoZXgsIGx1bSkge1xuXHRoZXggPSBTdHJpbmcoaGV4KS5yZXBsYWNlKC9bXjAtOWEtZl0vZ2ksICcnKTtcblx0aWYgKGhleC5sZW5ndGggPCA2KSB7XG5cdFx0aGV4ID0gaGV4WzBdK2hleFswXStoZXhbMV0raGV4WzFdK2hleFsyXStoZXhbMl07XG5cdH1cblx0bHVtID0gbHVtIHx8IDA7XG5cdHZhciByZ2IgPSBcIiNcIiwgYywgaTtcblx0Zm9yIChpID0gMDsgaSA8IDM7IGkrKykge1xuXHRcdGMgPSBwYXJzZUludChoZXguc3Vic3RyKGkqMiwyKSwgMTYpO1xuXHRcdGMgPSBNYXRoLnJvdW5kKE1hdGgubWluKE1hdGgubWF4KDAsIGMgKyAoYyAqIGx1bSkpLCAyNTUpKS50b1N0cmluZygxNik7XG5cdFx0cmdiICs9IChcIjAwXCIrYykuc3Vic3RyKGMubGVuZ3RoKTtcblx0fVxuXHRyZXR1cm4gcmdiO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFR3aW5rbGVNYWNybztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgTWFjcm8gPSByZXF1aXJlKCcuL21hY3JvJyk7XG52YXIgVHlwZVdyaXRlciA9IHJlcXVpcmUoJ3R5cGV3cml0ZXInKTtcblxuY29uc3QgaWRlbnRpZmllciA9ICd1bnN1cHBvcnRlZCc7XG5cbmNsYXNzIFVuc3VwcG9ydGVkTWFjcm8gZXh0ZW5kcyBNYWNybyB7XG4gIHN0YXRpYyBnZXQgaWRlbnRpZmllcigpIHtcbiAgICByZXR1cm4gaWRlbnRpZmllcjtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuc2V0Q29sb3IoJyMwMDAwMDAnKTtcblxuICAgIHZhciB0eXBlV3JpdGVyID0gbmV3IFR5cGVXcml0ZXIoeyBmb250OiAnc3lzdGVtLW1pY3JvJ30pO1xuICAgIHR5cGVXcml0ZXIudGV4dChcIlVOU1VQUE9SVEVEXCIsIChpdGVtKSA9PiB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5vblBpeGVsQ2hhbmdlKGl0ZW0ueSwgaXRlbS54LCAnI0ZGRkZGRicpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RvcCgpIHtcbiAgICAvLyBOb3RoaW5nLi5cbiAgfVxufVxuXG52YXIgZGF0YSA9IFtcbiAgWzEsIDBdLFxuICBbMiwgMF0sXG4gIFszLCAwXSxcbiAgWzQsIDBdXG5dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVuc3VwcG9ydGVkTWFjcm87XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiaGVpZ2h0XCI6IDE0LFxuICBcIndpZHRoXCI6IDYsXG4gIFwiY2hhcmFjdGVyc1wiOiB7XG4gICAgXCIwXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNyxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDgsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA5LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTAsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDExLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA5LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDcsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIjFcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDgsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCIyXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDksXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiM1wiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNyxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDgsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA5LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTAsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCI0XCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDcsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA4LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTEsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCI1XCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNyxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDgsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA5LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTAsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCI2XCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDksXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDExLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDgsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIjdcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDksXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDExLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCI4XCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDksXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDExLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDgsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiOVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDcsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA4LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTEsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDExLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiLFwiOiB7XG4gICAgICBcIndpZHRoXCI6IDMsXG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJoZWlnaHRcIjogNixcbiAgXCJ3aWR0aFwiOiA1LFxuICBcImNoYXJhY3RlcnNcIjoge1xuICAgIFwiIFwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtdXG4gICAgfSxcbiAgICBcIjBcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCIxXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCIyXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCIzXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCI0XCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCI1XCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIjZcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiN1wiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiOFwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCI5XCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJSXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiWVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiT1wiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIlVcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJOXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIlNcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIlBcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiVFwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiQVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIkJcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIkNcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiRFwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiRVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiRlwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJHXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIkhcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiSVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIkpcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiS1wiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiTVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiUVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIlZcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJMXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJXXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiWFwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIlpcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH1cbiAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBGb250cyA9IHtcbiAgJ3N5c3RlbS1taWNybyc6IHJlcXVpcmUoJy4vZm9udHMvc3lzdGVtLW1pY3JvJyksXG4gICdzeXN0ZW0tbWVkaXVtJzogcmVxdWlyZSgnLi9mb250cy9zeXN0ZW0tbWVkaXVtJylcbn07XG5cbmNsYXNzIFR5cGVXcml0ZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5mb250ID0gb3B0aW9ucy5mb250O1xuICAgIHRoaXMuY29sdW1uID0gb3B0aW9ucy5zdGFydGluZ0NvbHVtbiB8fCAwO1xuICAgIHRoaXMucm93ID0gb3B0aW9ucy5zdGFydGluZ1JvdyB8fCAwO1xuICAgIHRoaXMuc3BhY2VCZXR3ZWVuTGV0dGVycyA9IG9wdGlvbnMuc3BhY2VCZXR3ZWVuTGV0dGVycyB8fCAxO1xuICAgIHRoaXMuYWxpZ25tZW50ID0gb3B0aW9ucy5hbGlnbm1lbnQgfHwgJ2xlZnQnO1xuICB9XG5cbiAgc3RhdGljIGF2YWlsYWJsZUZvbnRzKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhGb250cyk7XG4gIH1cblxuICB0ZXh0KGNvcHksIGNhbGxiYWNrKSB7XG4gICAgdmFyIGZvbnQgPSBGb250c1t0aGlzLmZvbnRdLFxuICAgICAgICBjaGFyYWN0ZXJzID0gZm9udC5jaGFyYWN0ZXJzO1xuXG4gICAgaWYodGhpcy5hbGlnbm1lbnQgPT09ICdsZWZ0Jykge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3B5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGFyYWN0ZXIgPSBjaGFyYWN0ZXJzW2NvcHlbaV1dO1xuXG4gICAgICAgIGlmKGNoYXJhY3Rlcikge1xuICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9IGNoYXJhY3Rlci5jb29yZGluYXRlcztcblxuICAgICAgICAgIGlmKGNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgICBjb29yZGluYXRlcy5mb3JFYWNoKChwb2ludCkgPT4ge1xuICAgICAgICAgICAgICBjYWxsYmFjayh7XG4gICAgICAgICAgICAgICAgeTogdGhpcy5yb3cgKyBwb2ludC55LFxuICAgICAgICAgICAgICAgIHg6IHRoaXMuY29sdW1uICsgcG9pbnQueFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgd2lkdGggPSBjaGFyYWN0ZXIud2lkdGggfHwgZm9udC53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuY29sdW1uID0gdGhpcy5jb2x1bW4gKyB3aWR0aCArIHRoaXMuc3BhY2VCZXR3ZWVuTGV0dGVycztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb2x1bW4gLT0gY2hhcmFjdGVyc1tjb3B5W2NvcHkubGVuZ3RoIC0gMV1dLndpZHRoIHx8IGZvbnQud2lkdGg7XG4gICAgICBmb3IgKGxldCBpID0gY29weS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICB2YXIgY2hhcmFjdGVyID0gY2hhcmFjdGVyc1tjb3B5W2ldXTtcblxuICAgICAgICBpZihjaGFyYWN0ZXIpIHtcbiAgICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSBjaGFyYWN0ZXIuY29vcmRpbmF0ZXM7XG5cbiAgICAgICAgICBpZihjb29yZGluYXRlcykge1xuICAgICAgICAgICAgY29vcmRpbmF0ZXMuZm9yRWFjaCgocG9pbnQpID0+IHtcbiAgICAgICAgICAgICAgY2FsbGJhY2soe1xuICAgICAgICAgICAgICAgIHk6IHRoaXMucm93ICsgcG9pbnQueSxcbiAgICAgICAgICAgICAgICB4OiB0aGlzLmNvbHVtbiArIHBvaW50LnhcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIHdpZHRoID0gY2hhcmFjdGVyLndpZHRoIHx8IGZvbnQud2lkdGg7XG4gICAgICAgICAgICB0aGlzLmNvbHVtbiA9IHRoaXMuY29sdW1uIC0gd2lkdGggLSB0aGlzLnNwYWNlQmV0d2VlbkxldHRlcnM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHlwZVdyaXRlcjtcbiIsIiAgLyogZ2xvYmFscyByZXF1aXJlLCBtb2R1bGUgKi9cblxuICAndXNlIHN0cmljdCc7XG5cbiAgLyoqXG4gICAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gICAqL1xuXG4gIHZhciBwYXRodG9SZWdleHAgPSByZXF1aXJlKCdwYXRoLXRvLXJlZ2V4cCcpO1xuXG4gIC8qKlxuICAgKiBNb2R1bGUgZXhwb3J0cy5cbiAgICovXG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBwYWdlO1xuXG4gIC8qKlxuICAgKiBEZXRlY3QgY2xpY2sgZXZlbnRcbiAgICovXG4gIHZhciBjbGlja0V2ZW50ID0gKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgZG9jdW1lbnQpICYmIGRvY3VtZW50Lm9udG91Y2hzdGFydCA/ICd0b3VjaHN0YXJ0JyA6ICdjbGljayc7XG5cbiAgLyoqXG4gICAqIFRvIHdvcmsgcHJvcGVybHkgd2l0aCB0aGUgVVJMXG4gICAqIGhpc3RvcnkubG9jYXRpb24gZ2VuZXJhdGVkIHBvbHlmaWxsIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9kZXZvdGUvSFRNTDUtSGlzdG9yeS1BUElcbiAgICovXG5cbiAgdmFyIGxvY2F0aW9uID0gKCd1bmRlZmluZWQnICE9PSB0eXBlb2Ygd2luZG93KSAmJiAod2luZG93Lmhpc3RvcnkubG9jYXRpb24gfHwgd2luZG93LmxvY2F0aW9uKTtcblxuICAvKipcbiAgICogUGVyZm9ybSBpbml0aWFsIGRpc3BhdGNoLlxuICAgKi9cblxuICB2YXIgZGlzcGF0Y2ggPSB0cnVlO1xuXG5cbiAgLyoqXG4gICAqIERlY29kZSBVUkwgY29tcG9uZW50cyAocXVlcnkgc3RyaW5nLCBwYXRobmFtZSwgaGFzaCkuXG4gICAqIEFjY29tbW9kYXRlcyBib3RoIHJlZ3VsYXIgcGVyY2VudCBlbmNvZGluZyBhbmQgeC13d3ctZm9ybS11cmxlbmNvZGVkIGZvcm1hdC5cbiAgICovXG4gIHZhciBkZWNvZGVVUkxDb21wb25lbnRzID0gdHJ1ZTtcblxuICAvKipcbiAgICogQmFzZSBwYXRoLlxuICAgKi9cblxuICB2YXIgYmFzZSA9ICcnO1xuXG4gIC8qKlxuICAgKiBSdW5uaW5nIGZsYWcuXG4gICAqL1xuXG4gIHZhciBydW5uaW5nO1xuXG4gIC8qKlxuICAgKiBIYXNoQmFuZyBvcHRpb25cbiAgICovXG5cbiAgdmFyIGhhc2hiYW5nID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFByZXZpb3VzIGNvbnRleHQsIGZvciBjYXB0dXJpbmdcbiAgICogcGFnZSBleGl0IGV2ZW50cy5cbiAgICovXG5cbiAgdmFyIHByZXZDb250ZXh0O1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBgcGF0aGAgd2l0aCBjYWxsYmFjayBgZm4oKWAsXG4gICAqIG9yIHJvdXRlIGBwYXRoYCwgb3IgcmVkaXJlY3Rpb24sXG4gICAqIG9yIGBwYWdlLnN0YXJ0KClgLlxuICAgKlxuICAgKiAgIHBhZ2UoZm4pO1xuICAgKiAgIHBhZ2UoJyonLCBmbik7XG4gICAqICAgcGFnZSgnL3VzZXIvOmlkJywgbG9hZCwgdXNlcik7XG4gICAqICAgcGFnZSgnL3VzZXIvJyArIHVzZXIuaWQsIHsgc29tZTogJ3RoaW5nJyB9KTtcbiAgICogICBwYWdlKCcvdXNlci8nICsgdXNlci5pZCk7XG4gICAqICAgcGFnZSgnL2Zyb20nLCAnL3RvJylcbiAgICogICBwYWdlKCk7XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfCFGdW5jdGlvbnwhT2JqZWN0fSBwYXRoXG4gICAqIEBwYXJhbSB7RnVuY3Rpb249fSBmblxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBwYWdlKHBhdGgsIGZuKSB7XG4gICAgLy8gPGNhbGxiYWNrPlxuICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgcGF0aCkge1xuICAgICAgcmV0dXJuIHBhZ2UoJyonLCBwYXRoKTtcbiAgICB9XG5cbiAgICAvLyByb3V0ZSA8cGF0aD4gdG8gPGNhbGxiYWNrIC4uLj5cbiAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGZuKSB7XG4gICAgICB2YXIgcm91dGUgPSBuZXcgUm91dGUoLyoqIEB0eXBlIHtzdHJpbmd9ICovIChwYXRoKSk7XG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgICBwYWdlLmNhbGxiYWNrcy5wdXNoKHJvdXRlLm1pZGRsZXdhcmUoYXJndW1lbnRzW2ldKSk7XG4gICAgICB9XG4gICAgICAvLyBzaG93IDxwYXRoPiB3aXRoIFtzdGF0ZV1cbiAgICB9IGVsc2UgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgcGF0aCkge1xuICAgICAgcGFnZVsnc3RyaW5nJyA9PT0gdHlwZW9mIGZuID8gJ3JlZGlyZWN0JyA6ICdzaG93J10ocGF0aCwgZm4pO1xuICAgICAgLy8gc3RhcnQgW29wdGlvbnNdXG4gICAgfSBlbHNlIHtcbiAgICAgIHBhZ2Uuc3RhcnQocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZ1bmN0aW9ucy5cbiAgICovXG5cbiAgcGFnZS5jYWxsYmFja3MgPSBbXTtcbiAgcGFnZS5leGl0cyA9IFtdO1xuXG4gIC8qKlxuICAgKiBDdXJyZW50IHBhdGggYmVpbmcgcHJvY2Vzc2VkXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqL1xuICBwYWdlLmN1cnJlbnQgPSAnJztcblxuICAvKipcbiAgICogTnVtYmVyIG9mIHBhZ2VzIG5hdmlnYXRlZCB0by5cbiAgICogQHR5cGUge251bWJlcn1cbiAgICpcbiAgICogICAgIHBhZ2UubGVuID09IDA7XG4gICAqICAgICBwYWdlKCcvbG9naW4nKTtcbiAgICogICAgIHBhZ2UubGVuID09IDE7XG4gICAqL1xuXG4gIHBhZ2UubGVuID0gMDtcblxuICAvKipcbiAgICogR2V0IG9yIHNldCBiYXNlcGF0aCB0byBgcGF0aGAuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHBhZ2UuYmFzZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICBpZiAoMCA9PT0gYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGJhc2U7XG4gICAgYmFzZSA9IHBhdGg7XG4gIH07XG5cbiAgLyoqXG4gICAqIEJpbmQgd2l0aCB0aGUgZ2l2ZW4gYG9wdGlvbnNgLlxuICAgKlxuICAgKiBPcHRpb25zOlxuICAgKlxuICAgKiAgICAtIGBjbGlja2AgYmluZCB0byBjbGljayBldmVudHMgW3RydWVdXG4gICAqICAgIC0gYHBvcHN0YXRlYCBiaW5kIHRvIHBvcHN0YXRlIFt0cnVlXVxuICAgKiAgICAtIGBkaXNwYXRjaGAgcGVyZm9ybSBpbml0aWFsIGRpc3BhdGNoIFt0cnVlXVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBwYWdlLnN0YXJ0ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIGlmIChydW5uaW5nKSByZXR1cm47XG4gICAgcnVubmluZyA9IHRydWU7XG4gICAgaWYgKGZhbHNlID09PSBvcHRpb25zLmRpc3BhdGNoKSBkaXNwYXRjaCA9IGZhbHNlO1xuICAgIGlmIChmYWxzZSA9PT0gb3B0aW9ucy5kZWNvZGVVUkxDb21wb25lbnRzKSBkZWNvZGVVUkxDb21wb25lbnRzID0gZmFsc2U7XG4gICAgaWYgKGZhbHNlICE9PSBvcHRpb25zLnBvcHN0YXRlKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBvbnBvcHN0YXRlLCBmYWxzZSk7XG4gICAgaWYgKGZhbHNlICE9PSBvcHRpb25zLmNsaWNrKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGNsaWNrRXZlbnQsIG9uY2xpY2ssIGZhbHNlKTtcbiAgICB9XG4gICAgaWYgKHRydWUgPT09IG9wdGlvbnMuaGFzaGJhbmcpIGhhc2hiYW5nID0gdHJ1ZTtcbiAgICBpZiAoIWRpc3BhdGNoKSByZXR1cm47XG4gICAgdmFyIHVybCA9IChoYXNoYmFuZyAmJiB+bG9jYXRpb24uaGFzaC5pbmRleE9mKCcjIScpKSA/IGxvY2F0aW9uLmhhc2guc3Vic3RyKDIpICsgbG9jYXRpb24uc2VhcmNoIDogbG9jYXRpb24ucGF0aG5hbWUgKyBsb2NhdGlvbi5zZWFyY2ggKyBsb2NhdGlvbi5oYXNoO1xuICAgIHBhZ2UucmVwbGFjZSh1cmwsIG51bGwsIHRydWUsIGRpc3BhdGNoKTtcbiAgfTtcblxuICAvKipcbiAgICogVW5iaW5kIGNsaWNrIGFuZCBwb3BzdGF0ZSBldmVudCBoYW5kbGVycy5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFnZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFydW5uaW5nKSByZXR1cm47XG4gICAgcGFnZS5jdXJyZW50ID0gJyc7XG4gICAgcGFnZS5sZW4gPSAwO1xuICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGNsaWNrRXZlbnQsIG9uY2xpY2ssIGZhbHNlKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBvbnBvcHN0YXRlLCBmYWxzZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNob3cgYHBhdGhgIHdpdGggb3B0aW9uYWwgYHN0YXRlYCBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0PX0gc3RhdGVcbiAgICogQHBhcmFtIHtib29sZWFuPX0gZGlzcGF0Y2hcbiAgICogQHBhcmFtIHtib29sZWFuPX0gcHVzaFxuICAgKiBAcmV0dXJuIHshQ29udGV4dH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFnZS5zaG93ID0gZnVuY3Rpb24ocGF0aCwgc3RhdGUsIGRpc3BhdGNoLCBwdXNoKSB7XG4gICAgdmFyIGN0eCA9IG5ldyBDb250ZXh0KHBhdGgsIHN0YXRlKTtcbiAgICBwYWdlLmN1cnJlbnQgPSBjdHgucGF0aDtcbiAgICBpZiAoZmFsc2UgIT09IGRpc3BhdGNoKSBwYWdlLmRpc3BhdGNoKGN0eCk7XG4gICAgaWYgKGZhbHNlICE9PSBjdHguaGFuZGxlZCAmJiBmYWxzZSAhPT0gcHVzaCkgY3R4LnB1c2hTdGF0ZSgpO1xuICAgIHJldHVybiBjdHg7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdvZXMgYmFjayBpbiB0aGUgaGlzdG9yeVxuICAgKiBCYWNrIHNob3VsZCBhbHdheXMgbGV0IHRoZSBjdXJyZW50IHJvdXRlIHB1c2ggc3RhdGUgYW5kIHRoZW4gZ28gYmFjay5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggLSBmYWxsYmFjayBwYXRoIHRvIGdvIGJhY2sgaWYgbm8gbW9yZSBoaXN0b3J5IGV4aXN0cywgaWYgdW5kZWZpbmVkIGRlZmF1bHRzIHRvIHBhZ2UuYmFzZVxuICAgKiBAcGFyYW0ge09iamVjdD19IHN0YXRlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHBhZ2UuYmFjayA9IGZ1bmN0aW9uKHBhdGgsIHN0YXRlKSB7XG4gICAgaWYgKHBhZ2UubGVuID4gMCkge1xuICAgICAgLy8gdGhpcyBtYXkgbmVlZCBtb3JlIHRlc3RpbmcgdG8gc2VlIGlmIGFsbCBicm93c2Vyc1xuICAgICAgLy8gd2FpdCBmb3IgdGhlIG5leHQgdGljayB0byBnbyBiYWNrIGluIGhpc3RvcnlcbiAgICAgIGhpc3RvcnkuYmFjaygpO1xuICAgICAgcGFnZS5sZW4tLTtcbiAgICB9IGVsc2UgaWYgKHBhdGgpIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHBhZ2Uuc2hvdyhwYXRoLCBzdGF0ZSk7XG4gICAgICB9KTtcbiAgICB9ZWxzZXtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHBhZ2Uuc2hvdyhiYXNlLCBzdGF0ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cblxuICAvKipcbiAgICogUmVnaXN0ZXIgcm91dGUgdG8gcmVkaXJlY3QgZnJvbSBvbmUgcGF0aCB0byBvdGhlclxuICAgKiBvciBqdXN0IHJlZGlyZWN0IHRvIGFub3RoZXIgcm91dGVcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZyb20gLSBpZiBwYXJhbSAndG8nIGlzIHVuZGVmaW5lZCByZWRpcmVjdHMgdG8gJ2Zyb20nXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gdG9cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHBhZ2UucmVkaXJlY3QgPSBmdW5jdGlvbihmcm9tLCB0bykge1xuICAgIC8vIERlZmluZSByb3V0ZSBmcm9tIGEgcGF0aCB0byBhbm90aGVyXG4gICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgZnJvbSAmJiAnc3RyaW5nJyA9PT0gdHlwZW9mIHRvKSB7XG4gICAgICBwYWdlKGZyb20sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBwYWdlLnJlcGxhY2UoLyoqIEB0eXBlIHshc3RyaW5nfSAqLyAodG8pKTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBXYWl0IGZvciB0aGUgcHVzaCBzdGF0ZSBhbmQgcmVwbGFjZSBpdCB3aXRoIGFub3RoZXJcbiAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBmcm9tICYmICd1bmRlZmluZWQnID09PSB0eXBlb2YgdG8pIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHBhZ2UucmVwbGFjZShmcm9tKTtcbiAgICAgIH0sIDApO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogUmVwbGFjZSBgcGF0aGAgd2l0aCBvcHRpb25hbCBgc3RhdGVgIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3Q9fSBzdGF0ZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBpbml0XG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGRpc3BhdGNoXG4gICAqIEByZXR1cm4geyFDb250ZXh0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuXG4gIHBhZ2UucmVwbGFjZSA9IGZ1bmN0aW9uKHBhdGgsIHN0YXRlLCBpbml0LCBkaXNwYXRjaCkge1xuICAgIHZhciBjdHggPSBuZXcgQ29udGV4dChwYXRoLCBzdGF0ZSk7XG4gICAgcGFnZS5jdXJyZW50ID0gY3R4LnBhdGg7XG4gICAgY3R4LmluaXQgPSBpbml0O1xuICAgIGN0eC5zYXZlKCk7IC8vIHNhdmUgYmVmb3JlIGRpc3BhdGNoaW5nLCB3aGljaCBtYXkgcmVkaXJlY3RcbiAgICBpZiAoZmFsc2UgIT09IGRpc3BhdGNoKSBwYWdlLmRpc3BhdGNoKGN0eCk7XG4gICAgcmV0dXJuIGN0eDtcbiAgfTtcblxuICAvKipcbiAgICogRGlzcGF0Y2ggdGhlIGdpdmVuIGBjdHhgLlxuICAgKlxuICAgKiBAcGFyYW0ge0NvbnRleHR9IGN0eFxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIHBhZ2UuZGlzcGF0Y2ggPSBmdW5jdGlvbihjdHgpIHtcbiAgICB2YXIgcHJldiA9IHByZXZDb250ZXh0LFxuICAgICAgaSA9IDAsXG4gICAgICBqID0gMDtcblxuICAgIHByZXZDb250ZXh0ID0gY3R4O1xuXG4gICAgZnVuY3Rpb24gbmV4dEV4aXQoKSB7XG4gICAgICB2YXIgZm4gPSBwYWdlLmV4aXRzW2orK107XG4gICAgICBpZiAoIWZuKSByZXR1cm4gbmV4dEVudGVyKCk7XG4gICAgICBmbihwcmV2LCBuZXh0RXhpdCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbmV4dEVudGVyKCkge1xuICAgICAgdmFyIGZuID0gcGFnZS5jYWxsYmFja3NbaSsrXTtcblxuICAgICAgaWYgKGN0eC5wYXRoICE9PSBwYWdlLmN1cnJlbnQpIHtcbiAgICAgICAgY3R4LmhhbmRsZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCFmbikgcmV0dXJuIHVuaGFuZGxlZChjdHgpO1xuICAgICAgZm4oY3R4LCBuZXh0RW50ZXIpO1xuICAgIH1cblxuICAgIGlmIChwcmV2KSB7XG4gICAgICBuZXh0RXhpdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0RW50ZXIoKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFVuaGFuZGxlZCBgY3R4YC4gV2hlbiBpdCdzIG5vdCB0aGUgaW5pdGlhbFxuICAgKiBwb3BzdGF0ZSB0aGVuIHJlZGlyZWN0LiBJZiB5b3Ugd2lzaCB0byBoYW5kbGVcbiAgICogNDA0cyBvbiB5b3VyIG93biB1c2UgYHBhZ2UoJyonLCBjYWxsYmFjaylgLlxuICAgKlxuICAgKiBAcGFyYW0ge0NvbnRleHR9IGN0eFxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIGZ1bmN0aW9uIHVuaGFuZGxlZChjdHgpIHtcbiAgICBpZiAoY3R4LmhhbmRsZWQpIHJldHVybjtcbiAgICB2YXIgY3VycmVudDtcblxuICAgIGlmIChoYXNoYmFuZykge1xuICAgICAgY3VycmVudCA9IGJhc2UgKyBsb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMhJywgJycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyZW50ID0gbG9jYXRpb24ucGF0aG5hbWUgKyBsb2NhdGlvbi5zZWFyY2g7XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnQgPT09IGN0eC5jYW5vbmljYWxQYXRoKSByZXR1cm47XG4gICAgcGFnZS5zdG9wKCk7XG4gICAgY3R4LmhhbmRsZWQgPSBmYWxzZTtcbiAgICBsb2NhdGlvbi5ocmVmID0gY3R4LmNhbm9uaWNhbFBhdGg7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYW4gZXhpdCByb3V0ZSBvbiBgcGF0aGAgd2l0aFxuICAgKiBjYWxsYmFjayBgZm4oKWAsIHdoaWNoIHdpbGwgYmUgY2FsbGVkXG4gICAqIG9uIHRoZSBwcmV2aW91cyBjb250ZXh0IHdoZW4gYSBuZXdcbiAgICogcGFnZSBpcyB2aXNpdGVkLlxuICAgKi9cbiAgcGFnZS5leGl0ID0gZnVuY3Rpb24ocGF0aCwgZm4pIHtcbiAgICBpZiAodHlwZW9mIHBhdGggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBwYWdlLmV4aXQoJyonLCBwYXRoKTtcbiAgICB9XG5cbiAgICB2YXIgcm91dGUgPSBuZXcgUm91dGUocGF0aCk7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHBhZ2UuZXhpdHMucHVzaChyb3V0ZS5taWRkbGV3YXJlKGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogUmVtb3ZlIFVSTCBlbmNvZGluZyBmcm9tIHRoZSBnaXZlbiBgc3RyYC5cbiAgICogQWNjb21tb2RhdGVzIHdoaXRlc3BhY2UgaW4gYm90aCB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAgICogYW5kIHJlZ3VsYXIgcGVyY2VudC1lbmNvZGVkIGZvcm0uXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWwgLSBVUkwgY29tcG9uZW50IHRvIGRlY29kZVxuICAgKi9cbiAgZnVuY3Rpb24gZGVjb2RlVVJMRW5jb2RlZFVSSUNvbXBvbmVudCh2YWwpIHtcbiAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ3N0cmluZycpIHsgcmV0dXJuIHZhbDsgfVxuICAgIHJldHVybiBkZWNvZGVVUkxDb21wb25lbnRzID8gZGVjb2RlVVJJQ29tcG9uZW50KHZhbC5yZXBsYWNlKC9cXCsvZywgJyAnKSkgOiB2YWw7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBhIG5ldyBcInJlcXVlc3RcIiBgQ29udGV4dGBcbiAgICogd2l0aCB0aGUgZ2l2ZW4gYHBhdGhgIGFuZCBvcHRpb25hbCBpbml0aWFsIGBzdGF0ZWAuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdD19IHN0YXRlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIENvbnRleHQocGF0aCwgc3RhdGUpIHtcbiAgICBpZiAoJy8nID09PSBwYXRoWzBdICYmIDAgIT09IHBhdGguaW5kZXhPZihiYXNlKSkgcGF0aCA9IGJhc2UgKyAoaGFzaGJhbmcgPyAnIyEnIDogJycpICsgcGF0aDtcbiAgICB2YXIgaSA9IHBhdGguaW5kZXhPZignPycpO1xuXG4gICAgdGhpcy5jYW5vbmljYWxQYXRoID0gcGF0aDtcbiAgICB0aGlzLnBhdGggPSBwYXRoLnJlcGxhY2UoYmFzZSwgJycpIHx8ICcvJztcbiAgICBpZiAoaGFzaGJhbmcpIHRoaXMucGF0aCA9IHRoaXMucGF0aC5yZXBsYWNlKCcjIScsICcnKSB8fCAnLyc7XG5cbiAgICB0aGlzLnRpdGxlID0gZG9jdW1lbnQudGl0bGU7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlIHx8IHt9O1xuICAgIHRoaXMuc3RhdGUucGF0aCA9IHBhdGg7XG4gICAgdGhpcy5xdWVyeXN0cmluZyA9IH5pID8gZGVjb2RlVVJMRW5jb2RlZFVSSUNvbXBvbmVudChwYXRoLnNsaWNlKGkgKyAxKSkgOiAnJztcbiAgICB0aGlzLnBhdGhuYW1lID0gZGVjb2RlVVJMRW5jb2RlZFVSSUNvbXBvbmVudCh+aSA/IHBhdGguc2xpY2UoMCwgaSkgOiBwYXRoKTtcbiAgICB0aGlzLnBhcmFtcyA9IHt9O1xuXG4gICAgLy8gZnJhZ21lbnRcbiAgICB0aGlzLmhhc2ggPSAnJztcbiAgICBpZiAoIWhhc2hiYW5nKSB7XG4gICAgICBpZiAoIX50aGlzLnBhdGguaW5kZXhPZignIycpKSByZXR1cm47XG4gICAgICB2YXIgcGFydHMgPSB0aGlzLnBhdGguc3BsaXQoJyMnKTtcbiAgICAgIHRoaXMucGF0aCA9IHBhcnRzWzBdO1xuICAgICAgdGhpcy5oYXNoID0gZGVjb2RlVVJMRW5jb2RlZFVSSUNvbXBvbmVudChwYXJ0c1sxXSkgfHwgJyc7XG4gICAgICB0aGlzLnF1ZXJ5c3RyaW5nID0gdGhpcy5xdWVyeXN0cmluZy5zcGxpdCgnIycpWzBdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBvc2UgYENvbnRleHRgLlxuICAgKi9cblxuICBwYWdlLkNvbnRleHQgPSBDb250ZXh0O1xuXG4gIC8qKlxuICAgKiBQdXNoIHN0YXRlLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgQ29udGV4dC5wcm90b3R5cGUucHVzaFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcGFnZS5sZW4rKztcbiAgICBoaXN0b3J5LnB1c2hTdGF0ZSh0aGlzLnN0YXRlLCB0aGlzLnRpdGxlLCBoYXNoYmFuZyAmJiB0aGlzLnBhdGggIT09ICcvJyA/ICcjIScgKyB0aGlzLnBhdGggOiB0aGlzLmNhbm9uaWNhbFBhdGgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTYXZlIHRoZSBjb250ZXh0IHN0YXRlLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBDb250ZXh0LnByb3RvdHlwZS5zYXZlID0gZnVuY3Rpb24oKSB7XG4gICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUodGhpcy5zdGF0ZSwgdGhpcy50aXRsZSwgaGFzaGJhbmcgJiYgdGhpcy5wYXRoICE9PSAnLycgPyAnIyEnICsgdGhpcy5wYXRoIDogdGhpcy5jYW5vbmljYWxQYXRoKTtcbiAgfTtcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBgUm91dGVgIHdpdGggdGhlIGdpdmVuIEhUVFAgYHBhdGhgLFxuICAgKiBhbmQgYW4gYXJyYXkgb2YgYGNhbGxiYWNrc2AgYW5kIGBvcHRpb25zYC5cbiAgICpcbiAgICogT3B0aW9uczpcbiAgICpcbiAgICogICAtIGBzZW5zaXRpdmVgICAgIGVuYWJsZSBjYXNlLXNlbnNpdGl2ZSByb3V0ZXNcbiAgICogICAtIGBzdHJpY3RgICAgICAgIGVuYWJsZSBzdHJpY3QgbWF0Y2hpbmcgZm9yIHRyYWlsaW5nIHNsYXNoZXNcbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0aW9uc1xuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gUm91dGUocGF0aCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMucGF0aCA9IChwYXRoID09PSAnKicpID8gJyguKiknIDogcGF0aDtcbiAgICB0aGlzLm1ldGhvZCA9ICdHRVQnO1xuICAgIHRoaXMucmVnZXhwID0gcGF0aHRvUmVnZXhwKHRoaXMucGF0aCxcbiAgICAgIHRoaXMua2V5cyA9IFtdLFxuICAgICAgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogRXhwb3NlIGBSb3V0ZWAuXG4gICAqL1xuXG4gIHBhZ2UuUm91dGUgPSBSb3V0ZTtcblxuICAvKipcbiAgICogUmV0dXJuIHJvdXRlIG1pZGRsZXdhcmUgd2l0aFxuICAgKiB0aGUgZ2l2ZW4gY2FsbGJhY2sgYGZuKClgLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgUm91dGUucHJvdG90eXBlLm1pZGRsZXdhcmUgPSBmdW5jdGlvbihmbikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24oY3R4LCBuZXh0KSB7XG4gICAgICBpZiAoc2VsZi5tYXRjaChjdHgucGF0aCwgY3R4LnBhcmFtcykpIHJldHVybiBmbihjdHgsIG5leHQpO1xuICAgICAgbmV4dCgpO1xuICAgIH07XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoaXMgcm91dGUgbWF0Y2hlcyBgcGF0aGAsIGlmIHNvXG4gICAqIHBvcHVsYXRlIGBwYXJhbXNgLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBSb3V0ZS5wcm90b3R5cGUubWF0Y2ggPSBmdW5jdGlvbihwYXRoLCBwYXJhbXMpIHtcbiAgICB2YXIga2V5cyA9IHRoaXMua2V5cyxcbiAgICAgIHFzSW5kZXggPSBwYXRoLmluZGV4T2YoJz8nKSxcbiAgICAgIHBhdGhuYW1lID0gfnFzSW5kZXggPyBwYXRoLnNsaWNlKDAsIHFzSW5kZXgpIDogcGF0aCxcbiAgICAgIG0gPSB0aGlzLnJlZ2V4cC5leGVjKGRlY29kZVVSSUNvbXBvbmVudChwYXRobmFtZSkpO1xuXG4gICAgaWYgKCFtKSByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMSwgbGVuID0gbS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgdmFyIGtleSA9IGtleXNbaSAtIDFdO1xuICAgICAgdmFyIHZhbCA9IGRlY29kZVVSTEVuY29kZWRVUklDb21wb25lbnQobVtpXSk7XG4gICAgICBpZiAodmFsICE9PSB1bmRlZmluZWQgfHwgIShoYXNPd25Qcm9wZXJ0eS5jYWxsKHBhcmFtcywga2V5Lm5hbWUpKSkge1xuICAgICAgICBwYXJhbXNba2V5Lm5hbWVdID0gdmFsO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG5cbiAgLyoqXG4gICAqIEhhbmRsZSBcInBvcHVsYXRlXCIgZXZlbnRzLlxuICAgKi9cblxuICB2YXIgb25wb3BzdGF0ZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGxvYWRlZCA9IGZhbHNlO1xuICAgIGlmICgndW5kZWZpbmVkJyA9PT0gdHlwZW9mIHdpbmRvdykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgbG9hZGVkID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBsb2FkZWQgPSB0cnVlO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gb25wb3BzdGF0ZShlKSB7XG4gICAgICBpZiAoIWxvYWRlZCkgcmV0dXJuO1xuICAgICAgaWYgKGUuc3RhdGUpIHtcbiAgICAgICAgdmFyIHBhdGggPSBlLnN0YXRlLnBhdGg7XG4gICAgICAgIHBhZ2UucmVwbGFjZShwYXRoLCBlLnN0YXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhZ2Uuc2hvdyhsb2NhdGlvbi5wYXRobmFtZSArIGxvY2F0aW9uLmhhc2gsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSkoKTtcbiAgLyoqXG4gICAqIEhhbmRsZSBcImNsaWNrXCIgZXZlbnRzLlxuICAgKi9cblxuICBmdW5jdGlvbiBvbmNsaWNrKGUpIHtcblxuICAgIGlmICgxICE9PSB3aGljaChlKSkgcmV0dXJuO1xuXG4gICAgaWYgKGUubWV0YUtleSB8fCBlLmN0cmxLZXkgfHwgZS5zaGlmdEtleSkgcmV0dXJuO1xuICAgIGlmIChlLmRlZmF1bHRQcmV2ZW50ZWQpIHJldHVybjtcblxuXG5cbiAgICAvLyBlbnN1cmUgbGlua1xuICAgIC8vIHVzZSBzaGFkb3cgZG9tIHdoZW4gYXZhaWxhYmxlXG4gICAgdmFyIGVsID0gZS5wYXRoID8gZS5wYXRoWzBdIDogZS50YXJnZXQ7XG4gICAgd2hpbGUgKGVsICYmICdBJyAhPT0gZWwubm9kZU5hbWUpIGVsID0gZWwucGFyZW50Tm9kZTtcbiAgICBpZiAoIWVsIHx8ICdBJyAhPT0gZWwubm9kZU5hbWUpIHJldHVybjtcblxuXG5cbiAgICAvLyBJZ25vcmUgaWYgdGFnIGhhc1xuICAgIC8vIDEuIFwiZG93bmxvYWRcIiBhdHRyaWJ1dGVcbiAgICAvLyAyLiByZWw9XCJleHRlcm5hbFwiIGF0dHJpYnV0ZVxuICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoJ2Rvd25sb2FkJykgfHwgZWwuZ2V0QXR0cmlidXRlKCdyZWwnKSA9PT0gJ2V4dGVybmFsJykgcmV0dXJuO1xuXG4gICAgLy8gZW5zdXJlIG5vbi1oYXNoIGZvciB0aGUgc2FtZSBwYXRoXG4gICAgdmFyIGxpbmsgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICBpZiAoIWhhc2hiYW5nICYmIGVsLnBhdGhuYW1lID09PSBsb2NhdGlvbi5wYXRobmFtZSAmJiAoZWwuaGFzaCB8fCAnIycgPT09IGxpbmspKSByZXR1cm47XG5cblxuXG4gICAgLy8gQ2hlY2sgZm9yIG1haWx0bzogaW4gdGhlIGhyZWZcbiAgICBpZiAobGluayAmJiBsaW5rLmluZGV4T2YoJ21haWx0bzonKSA+IC0xKSByZXR1cm47XG5cbiAgICAvLyBjaGVjayB0YXJnZXRcbiAgICBpZiAoZWwudGFyZ2V0KSByZXR1cm47XG5cbiAgICAvLyB4LW9yaWdpblxuICAgIGlmICghc2FtZU9yaWdpbihlbC5ocmVmKSkgcmV0dXJuO1xuXG5cblxuICAgIC8vIHJlYnVpbGQgcGF0aFxuICAgIHZhciBwYXRoID0gZWwucGF0aG5hbWUgKyBlbC5zZWFyY2ggKyAoZWwuaGFzaCB8fCAnJyk7XG5cbiAgICAvLyBzdHJpcCBsZWFkaW5nIFwiL1tkcml2ZSBsZXR0ZXJdOlwiIG9uIE5XLmpzIG9uIFdpbmRvd3NcbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHBhdGgubWF0Y2goL15cXC9bYS16QS1aXTpcXC8vKSkge1xuICAgICAgcGF0aCA9IHBhdGgucmVwbGFjZSgvXlxcL1thLXpBLVpdOlxcLy8sICcvJyk7XG4gICAgfVxuXG4gICAgLy8gc2FtZSBwYWdlXG4gICAgdmFyIG9yaWcgPSBwYXRoO1xuXG4gICAgaWYgKHBhdGguaW5kZXhPZihiYXNlKSA9PT0gMCkge1xuICAgICAgcGF0aCA9IHBhdGguc3Vic3RyKGJhc2UubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZiAoaGFzaGJhbmcpIHBhdGggPSBwYXRoLnJlcGxhY2UoJyMhJywgJycpO1xuXG4gICAgaWYgKGJhc2UgJiYgb3JpZyA9PT0gcGF0aCkgcmV0dXJuO1xuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHBhZ2Uuc2hvdyhvcmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmVudCBidXR0b24uXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHdoaWNoKGUpIHtcbiAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG4gICAgcmV0dXJuIG51bGwgPT09IGUud2hpY2ggPyBlLmJ1dHRvbiA6IGUud2hpY2g7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGhyZWZgIGlzIHRoZSBzYW1lIG9yaWdpbi5cbiAgICovXG5cbiAgZnVuY3Rpb24gc2FtZU9yaWdpbihocmVmKSB7XG4gICAgdmFyIG9yaWdpbiA9IGxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIGxvY2F0aW9uLmhvc3RuYW1lO1xuICAgIGlmIChsb2NhdGlvbi5wb3J0KSBvcmlnaW4gKz0gJzonICsgbG9jYXRpb24ucG9ydDtcbiAgICByZXR1cm4gKGhyZWYgJiYgKDAgPT09IGhyZWYuaW5kZXhPZihvcmlnaW4pKSk7XG4gIH1cblxuICBwYWdlLnNhbWVPcmlnaW4gPSBzYW1lT3JpZ2luO1xuIiwidmFyIGlzYXJyYXkgPSByZXF1aXJlKCdpc2FycmF5JylcblxuLyoqXG4gKiBFeHBvc2UgYHBhdGhUb1JlZ2V4cGAuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gcGF0aFRvUmVnZXhwXG5tb2R1bGUuZXhwb3J0cy5wYXJzZSA9IHBhcnNlXG5tb2R1bGUuZXhwb3J0cy5jb21waWxlID0gY29tcGlsZVxubW9kdWxlLmV4cG9ydHMudG9rZW5zVG9GdW5jdGlvbiA9IHRva2Vuc1RvRnVuY3Rpb25cbm1vZHVsZS5leHBvcnRzLnRva2Vuc1RvUmVnRXhwID0gdG9rZW5zVG9SZWdFeHBcblxuLyoqXG4gKiBUaGUgbWFpbiBwYXRoIG1hdGNoaW5nIHJlZ2V4cCB1dGlsaXR5LlxuICpcbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cbnZhciBQQVRIX1JFR0VYUCA9IG5ldyBSZWdFeHAoW1xuICAvLyBNYXRjaCBlc2NhcGVkIGNoYXJhY3RlcnMgdGhhdCB3b3VsZCBvdGhlcndpc2UgYXBwZWFyIGluIGZ1dHVyZSBtYXRjaGVzLlxuICAvLyBUaGlzIGFsbG93cyB0aGUgdXNlciB0byBlc2NhcGUgc3BlY2lhbCBjaGFyYWN0ZXJzIHRoYXQgd29uJ3QgdHJhbnNmb3JtLlxuICAnKFxcXFxcXFxcLiknLFxuICAvLyBNYXRjaCBFeHByZXNzLXN0eWxlIHBhcmFtZXRlcnMgYW5kIHVuLW5hbWVkIHBhcmFtZXRlcnMgd2l0aCBhIHByZWZpeFxuICAvLyBhbmQgb3B0aW9uYWwgc3VmZml4ZXMuIE1hdGNoZXMgYXBwZWFyIGFzOlxuICAvL1xuICAvLyBcIi86dGVzdChcXFxcZCspP1wiID0+IFtcIi9cIiwgXCJ0ZXN0XCIsIFwiXFxkK1wiLCB1bmRlZmluZWQsIFwiP1wiLCB1bmRlZmluZWRdXG4gIC8vIFwiL3JvdXRlKFxcXFxkKylcIiAgPT4gW3VuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFwiXFxkK1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZF1cbiAgLy8gXCIvKlwiICAgICAgICAgICAgPT4gW1wiL1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFwiKlwiXVxuICAnKFtcXFxcLy5dKT8oPzooPzpcXFxcOihcXFxcdyspKD86XFxcXCgoKD86XFxcXFxcXFwufFteKCldKSspXFxcXCkpP3xcXFxcKCgoPzpcXFxcXFxcXC58W14oKV0pKylcXFxcKSkoWysqP10pP3woXFxcXCopKSdcbl0uam9pbignfCcpLCAnZycpXG5cbi8qKlxuICogUGFyc2UgYSBzdHJpbmcgZm9yIHRoZSByYXcgdG9rZW5zLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuZnVuY3Rpb24gcGFyc2UgKHN0cikge1xuICB2YXIgdG9rZW5zID0gW11cbiAgdmFyIGtleSA9IDBcbiAgdmFyIGluZGV4ID0gMFxuICB2YXIgcGF0aCA9ICcnXG4gIHZhciByZXNcblxuICB3aGlsZSAoKHJlcyA9IFBBVEhfUkVHRVhQLmV4ZWMoc3RyKSkgIT0gbnVsbCkge1xuICAgIHZhciBtID0gcmVzWzBdXG4gICAgdmFyIGVzY2FwZWQgPSByZXNbMV1cbiAgICB2YXIgb2Zmc2V0ID0gcmVzLmluZGV4XG4gICAgcGF0aCArPSBzdHIuc2xpY2UoaW5kZXgsIG9mZnNldClcbiAgICBpbmRleCA9IG9mZnNldCArIG0ubGVuZ3RoXG5cbiAgICAvLyBJZ25vcmUgYWxyZWFkeSBlc2NhcGVkIHNlcXVlbmNlcy5cbiAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgcGF0aCArPSBlc2NhcGVkWzFdXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIC8vIFB1c2ggdGhlIGN1cnJlbnQgcGF0aCBvbnRvIHRoZSB0b2tlbnMuXG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIHRva2Vucy5wdXNoKHBhdGgpXG4gICAgICBwYXRoID0gJydcbiAgICB9XG5cbiAgICB2YXIgcHJlZml4ID0gcmVzWzJdXG4gICAgdmFyIG5hbWUgPSByZXNbM11cbiAgICB2YXIgY2FwdHVyZSA9IHJlc1s0XVxuICAgIHZhciBncm91cCA9IHJlc1s1XVxuICAgIHZhciBzdWZmaXggPSByZXNbNl1cbiAgICB2YXIgYXN0ZXJpc2sgPSByZXNbN11cblxuICAgIHZhciByZXBlYXQgPSBzdWZmaXggPT09ICcrJyB8fCBzdWZmaXggPT09ICcqJ1xuICAgIHZhciBvcHRpb25hbCA9IHN1ZmZpeCA9PT0gJz8nIHx8IHN1ZmZpeCA9PT0gJyonXG4gICAgdmFyIGRlbGltaXRlciA9IHByZWZpeCB8fCAnLydcbiAgICB2YXIgcGF0dGVybiA9IGNhcHR1cmUgfHwgZ3JvdXAgfHwgKGFzdGVyaXNrID8gJy4qJyA6ICdbXicgKyBkZWxpbWl0ZXIgKyAnXSs/JylcblxuICAgIHRva2Vucy5wdXNoKHtcbiAgICAgIG5hbWU6IG5hbWUgfHwga2V5KyssXG4gICAgICBwcmVmaXg6IHByZWZpeCB8fCAnJyxcbiAgICAgIGRlbGltaXRlcjogZGVsaW1pdGVyLFxuICAgICAgb3B0aW9uYWw6IG9wdGlvbmFsLFxuICAgICAgcmVwZWF0OiByZXBlYXQsXG4gICAgICBwYXR0ZXJuOiBlc2NhcGVHcm91cChwYXR0ZXJuKVxuICAgIH0pXG4gIH1cblxuICAvLyBNYXRjaCBhbnkgY2hhcmFjdGVycyBzdGlsbCByZW1haW5pbmcuXG4gIGlmIChpbmRleCA8IHN0ci5sZW5ndGgpIHtcbiAgICBwYXRoICs9IHN0ci5zdWJzdHIoaW5kZXgpXG4gIH1cblxuICAvLyBJZiB0aGUgcGF0aCBleGlzdHMsIHB1c2ggaXQgb250byB0aGUgZW5kLlxuICBpZiAocGF0aCkge1xuICAgIHRva2Vucy5wdXNoKHBhdGgpXG4gIH1cblxuICByZXR1cm4gdG9rZW5zXG59XG5cbi8qKlxuICogQ29tcGlsZSBhIHN0cmluZyB0byBhIHRlbXBsYXRlIGZ1bmN0aW9uIGZvciB0aGUgcGF0aC5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9ICAgc3RyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuZnVuY3Rpb24gY29tcGlsZSAoc3RyKSB7XG4gIHJldHVybiB0b2tlbnNUb0Z1bmN0aW9uKHBhcnNlKHN0cikpXG59XG5cbi8qKlxuICogRXhwb3NlIGEgbWV0aG9kIGZvciB0cmFuc2Zvcm1pbmcgdG9rZW5zIGludG8gdGhlIHBhdGggZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHRva2Vuc1RvRnVuY3Rpb24gKHRva2Vucykge1xuICAvLyBDb21waWxlIGFsbCB0aGUgdG9rZW5zIGludG8gcmVnZXhwcy5cbiAgdmFyIG1hdGNoZXMgPSBuZXcgQXJyYXkodG9rZW5zLmxlbmd0aClcblxuICAvLyBDb21waWxlIGFsbCB0aGUgcGF0dGVybnMgYmVmb3JlIGNvbXBpbGF0aW9uLlxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0eXBlb2YgdG9rZW5zW2ldID09PSAnb2JqZWN0Jykge1xuICAgICAgbWF0Y2hlc1tpXSA9IG5ldyBSZWdFeHAoJ14nICsgdG9rZW5zW2ldLnBhdHRlcm4gKyAnJCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgcGF0aCA9ICcnXG4gICAgdmFyIGRhdGEgPSBvYmogfHwge31cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdG9rZW4gPSB0b2tlbnNbaV1cblxuICAgICAgaWYgKHR5cGVvZiB0b2tlbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcGF0aCArPSB0b2tlblxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHZhciB2YWx1ZSA9IGRhdGFbdG9rZW4ubmFtZV1cbiAgICAgIHZhciBzZWdtZW50XG5cbiAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICAgIGlmICh0b2tlbi5vcHRpb25hbCkge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgXCInICsgdG9rZW4ubmFtZSArICdcIiB0byBiZSBkZWZpbmVkJylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNhcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgaWYgKCF0b2tlbi5yZXBlYXQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBcIicgKyB0b2tlbi5uYW1lICsgJ1wiIHRvIG5vdCByZXBlYXQsIGJ1dCByZWNlaXZlZCBcIicgKyB2YWx1ZSArICdcIicpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgaWYgKHRva2VuLm9wdGlvbmFsKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBcIicgKyB0b2tlbi5uYW1lICsgJ1wiIHRvIG5vdCBiZSBlbXB0eScpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWx1ZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgIHNlZ21lbnQgPSBlbmNvZGVVUklDb21wb25lbnQodmFsdWVbal0pXG5cbiAgICAgICAgICBpZiAoIW1hdGNoZXNbaV0udGVzdChzZWdtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYWxsIFwiJyArIHRva2VuLm5hbWUgKyAnXCIgdG8gbWF0Y2ggXCInICsgdG9rZW4ucGF0dGVybiArICdcIiwgYnV0IHJlY2VpdmVkIFwiJyArIHNlZ21lbnQgKyAnXCInKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHBhdGggKz0gKGogPT09IDAgPyB0b2tlbi5wcmVmaXggOiB0b2tlbi5kZWxpbWl0ZXIpICsgc2VnbWVudFxuICAgICAgICB9XG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgc2VnbWVudCA9IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSlcblxuICAgICAgaWYgKCFtYXRjaGVzW2ldLnRlc3Qoc2VnbWVudCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgXCInICsgdG9rZW4ubmFtZSArICdcIiB0byBtYXRjaCBcIicgKyB0b2tlbi5wYXR0ZXJuICsgJ1wiLCBidXQgcmVjZWl2ZWQgXCInICsgc2VnbWVudCArICdcIicpXG4gICAgICB9XG5cbiAgICAgIHBhdGggKz0gdG9rZW4ucHJlZml4ICsgc2VnbWVudFxuICAgIH1cblxuICAgIHJldHVybiBwYXRoXG4gIH1cbn1cblxuLyoqXG4gKiBFc2NhcGUgYSByZWd1bGFyIGV4cHJlc3Npb24gc3RyaW5nLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGVzY2FwZVN0cmluZyAoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvKFsuKyo/PV4hOiR7fSgpW1xcXXxcXC9dKS9nLCAnXFxcXCQxJylcbn1cblxuLyoqXG4gKiBFc2NhcGUgdGhlIGNhcHR1cmluZyBncm91cCBieSBlc2NhcGluZyBzcGVjaWFsIGNoYXJhY3RlcnMgYW5kIG1lYW5pbmcuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBncm91cFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBlc2NhcGVHcm91cCAoZ3JvdXApIHtcbiAgcmV0dXJuIGdyb3VwLnJlcGxhY2UoLyhbPSE6JFxcLygpXSkvZywgJ1xcXFwkMScpXG59XG5cbi8qKlxuICogQXR0YWNoIHRoZSBrZXlzIGFzIGEgcHJvcGVydHkgb2YgdGhlIHJlZ2V4cC5cbiAqXG4gKiBAcGFyYW0gIHtSZWdFeHB9IHJlXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gYXR0YWNoS2V5cyAocmUsIGtleXMpIHtcbiAgcmUua2V5cyA9IGtleXNcbiAgcmV0dXJuIHJlXG59XG5cbi8qKlxuICogR2V0IHRoZSBmbGFncyBmb3IgYSByZWdleHAgZnJvbSB0aGUgb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZmxhZ3MgKG9wdGlvbnMpIHtcbiAgcmV0dXJuIG9wdGlvbnMuc2Vuc2l0aXZlID8gJycgOiAnaSdcbn1cblxuLyoqXG4gKiBQdWxsIG91dCBrZXlzIGZyb20gYSByZWdleHAuXG4gKlxuICogQHBhcmFtICB7UmVnRXhwfSBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gcmVnZXhwVG9SZWdleHAgKHBhdGgsIGtleXMpIHtcbiAgLy8gVXNlIGEgbmVnYXRpdmUgbG9va2FoZWFkIHRvIG1hdGNoIG9ubHkgY2FwdHVyaW5nIGdyb3Vwcy5cbiAgdmFyIGdyb3VwcyA9IHBhdGguc291cmNlLm1hdGNoKC9cXCgoPyFcXD8pL2cpXG5cbiAgaWYgKGdyb3Vwcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JvdXBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBrZXlzLnB1c2goe1xuICAgICAgICBuYW1lOiBpLFxuICAgICAgICBwcmVmaXg6IG51bGwsXG4gICAgICAgIGRlbGltaXRlcjogbnVsbCxcbiAgICAgICAgb3B0aW9uYWw6IGZhbHNlLFxuICAgICAgICByZXBlYXQ6IGZhbHNlLFxuICAgICAgICBwYXR0ZXJuOiBudWxsXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhdHRhY2hLZXlzKHBhdGgsIGtleXMpXG59XG5cbi8qKlxuICogVHJhbnNmb3JtIGFuIGFycmF5IGludG8gYSByZWdleHAuXG4gKlxuICogQHBhcmFtICB7QXJyYXl9ICBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEBwYXJhbSAge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiBhcnJheVRvUmVnZXhwIChwYXRoLCBrZXlzLCBvcHRpb25zKSB7XG4gIHZhciBwYXJ0cyA9IFtdXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKSB7XG4gICAgcGFydHMucHVzaChwYXRoVG9SZWdleHAocGF0aFtpXSwga2V5cywgb3B0aW9ucykuc291cmNlKVxuICB9XG5cbiAgdmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAoJyg/OicgKyBwYXJ0cy5qb2luKCd8JykgKyAnKScsIGZsYWdzKG9wdGlvbnMpKVxuXG4gIHJldHVybiBhdHRhY2hLZXlzKHJlZ2V4cCwga2V5cylcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBwYXRoIHJlZ2V4cCBmcm9tIHN0cmluZyBpbnB1dC5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGhcbiAqIEBwYXJhbSAge0FycmF5fSAga2V5c1xuICogQHBhcmFtICB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIHN0cmluZ1RvUmVnZXhwIChwYXRoLCBrZXlzLCBvcHRpb25zKSB7XG4gIHZhciB0b2tlbnMgPSBwYXJzZShwYXRoKVxuICB2YXIgcmUgPSB0b2tlbnNUb1JlZ0V4cCh0b2tlbnMsIG9wdGlvbnMpXG5cbiAgLy8gQXR0YWNoIGtleXMgYmFjayB0byB0aGUgcmVnZXhwLlxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0eXBlb2YgdG9rZW5zW2ldICE9PSAnc3RyaW5nJykge1xuICAgICAga2V5cy5wdXNoKHRva2Vuc1tpXSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXR0YWNoS2V5cyhyZSwga2V5cylcbn1cblxuLyoqXG4gKiBFeHBvc2UgYSBmdW5jdGlvbiBmb3IgdGFraW5nIHRva2VucyBhbmQgcmV0dXJuaW5nIGEgUmVnRXhwLlxuICpcbiAqIEBwYXJhbSAge0FycmF5fSAgdG9rZW5zXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEBwYXJhbSAge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiB0b2tlbnNUb1JlZ0V4cCAodG9rZW5zLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgdmFyIHN0cmljdCA9IG9wdGlvbnMuc3RyaWN0XG4gIHZhciBlbmQgPSBvcHRpb25zLmVuZCAhPT0gZmFsc2VcbiAgdmFyIHJvdXRlID0gJydcbiAgdmFyIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV1cbiAgdmFyIGVuZHNXaXRoU2xhc2ggPSB0eXBlb2YgbGFzdFRva2VuID09PSAnc3RyaW5nJyAmJiAvXFwvJC8udGVzdChsYXN0VG9rZW4pXG5cbiAgLy8gSXRlcmF0ZSBvdmVyIHRoZSB0b2tlbnMgYW5kIGNyZWF0ZSBvdXIgcmVnZXhwIHN0cmluZy5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdG9rZW4gPSB0b2tlbnNbaV1cblxuICAgIGlmICh0eXBlb2YgdG9rZW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICByb3V0ZSArPSBlc2NhcGVTdHJpbmcodG9rZW4pXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBwcmVmaXggPSBlc2NhcGVTdHJpbmcodG9rZW4ucHJlZml4KVxuICAgICAgdmFyIGNhcHR1cmUgPSB0b2tlbi5wYXR0ZXJuXG5cbiAgICAgIGlmICh0b2tlbi5yZXBlYXQpIHtcbiAgICAgICAgY2FwdHVyZSArPSAnKD86JyArIHByZWZpeCArIGNhcHR1cmUgKyAnKSonXG4gICAgICB9XG5cbiAgICAgIGlmICh0b2tlbi5vcHRpb25hbCkge1xuICAgICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgICAgY2FwdHVyZSA9ICcoPzonICsgcHJlZml4ICsgJygnICsgY2FwdHVyZSArICcpKT8nXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FwdHVyZSA9ICcoJyArIGNhcHR1cmUgKyAnKT8nXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhcHR1cmUgPSBwcmVmaXggKyAnKCcgKyBjYXB0dXJlICsgJyknXG4gICAgICB9XG5cbiAgICAgIHJvdXRlICs9IGNhcHR1cmVcbiAgICB9XG4gIH1cblxuICAvLyBJbiBub24tc3RyaWN0IG1vZGUgd2UgYWxsb3cgYSBzbGFzaCBhdCB0aGUgZW5kIG9mIG1hdGNoLiBJZiB0aGUgcGF0aCB0b1xuICAvLyBtYXRjaCBhbHJlYWR5IGVuZHMgd2l0aCBhIHNsYXNoLCB3ZSByZW1vdmUgaXQgZm9yIGNvbnNpc3RlbmN5LiBUaGUgc2xhc2hcbiAgLy8gaXMgdmFsaWQgYXQgdGhlIGVuZCBvZiBhIHBhdGggbWF0Y2gsIG5vdCBpbiB0aGUgbWlkZGxlLiBUaGlzIGlzIGltcG9ydGFudFxuICAvLyBpbiBub24tZW5kaW5nIG1vZGUsIHdoZXJlIFwiL3Rlc3QvXCIgc2hvdWxkbid0IG1hdGNoIFwiL3Rlc3QvL3JvdXRlXCIuXG4gIGlmICghc3RyaWN0KSB7XG4gICAgcm91dGUgPSAoZW5kc1dpdGhTbGFzaCA/IHJvdXRlLnNsaWNlKDAsIC0yKSA6IHJvdXRlKSArICcoPzpcXFxcLyg/PSQpKT8nXG4gIH1cblxuICBpZiAoZW5kKSB7XG4gICAgcm91dGUgKz0gJyQnXG4gIH0gZWxzZSB7XG4gICAgLy8gSW4gbm9uLWVuZGluZyBtb2RlLCB3ZSBuZWVkIHRoZSBjYXB0dXJpbmcgZ3JvdXBzIHRvIG1hdGNoIGFzIG11Y2ggYXNcbiAgICAvLyBwb3NzaWJsZSBieSB1c2luZyBhIHBvc2l0aXZlIGxvb2thaGVhZCB0byB0aGUgZW5kIG9yIG5leHQgcGF0aCBzZWdtZW50LlxuICAgIHJvdXRlICs9IHN0cmljdCAmJiBlbmRzV2l0aFNsYXNoID8gJycgOiAnKD89XFxcXC98JCknXG4gIH1cblxuICByZXR1cm4gbmV3IFJlZ0V4cCgnXicgKyByb3V0ZSwgZmxhZ3Mob3B0aW9ucykpXG59XG5cbi8qKlxuICogTm9ybWFsaXplIHRoZSBnaXZlbiBwYXRoIHN0cmluZywgcmV0dXJuaW5nIGEgcmVndWxhciBleHByZXNzaW9uLlxuICpcbiAqIEFuIGVtcHR5IGFycmF5IGNhbiBiZSBwYXNzZWQgaW4gZm9yIHRoZSBrZXlzLCB3aGljaCB3aWxsIGhvbGQgdGhlXG4gKiBwbGFjZWhvbGRlciBrZXkgZGVzY3JpcHRpb25zLiBGb3IgZXhhbXBsZSwgdXNpbmcgYC91c2VyLzppZGAsIGBrZXlzYCB3aWxsXG4gKiBjb250YWluIGBbeyBuYW1lOiAnaWQnLCBkZWxpbWl0ZXI6ICcvJywgb3B0aW9uYWw6IGZhbHNlLCByZXBlYXQ6IGZhbHNlIH1dYC5cbiAqXG4gKiBAcGFyYW0gIHsoU3RyaW5nfFJlZ0V4cHxBcnJheSl9IHBhdGhcbiAqIEBwYXJhbSAge0FycmF5fSAgICAgICAgICAgICAgICAgW2tleXNdXG4gKiBAcGFyYW0gIHtPYmplY3R9ICAgICAgICAgICAgICAgIFtvcHRpb25zXVxuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiBwYXRoVG9SZWdleHAgKHBhdGgsIGtleXMsIG9wdGlvbnMpIHtcbiAga2V5cyA9IGtleXMgfHwgW11cblxuICBpZiAoIWlzYXJyYXkoa2V5cykpIHtcbiAgICBvcHRpb25zID0ga2V5c1xuICAgIGtleXMgPSBbXVxuICB9IGVsc2UgaWYgKCFvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IHt9XG4gIH1cblxuICBpZiAocGF0aCBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgIHJldHVybiByZWdleHBUb1JlZ2V4cChwYXRoLCBrZXlzLCBvcHRpb25zKVxuICB9XG5cbiAgaWYgKGlzYXJyYXkocGF0aCkpIHtcbiAgICByZXR1cm4gYXJyYXlUb1JlZ2V4cChwYXRoLCBrZXlzLCBvcHRpb25zKVxuICB9XG5cbiAgcmV0dXJuIHN0cmluZ1RvUmVnZXhwKHBhdGgsIGtleXMsIG9wdGlvbnMpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKGFycikge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFycikgPT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCJpbXBvcnQgUmVzb3VyY2UgZnJvbSAnLi4vbGliL3Jlc291cmNlJztcbmltcG9ydCBEaXNwbGF5Q291cGxlciBmcm9tICdkaXNwbGF5LWNvdXBsZXInO1xuXG5jbGFzcyBEaXNwbGF5IHtcbiAgY29uc3RydWN0b3IoJGVsLCBkaXNwbGF5S2V5KSB7XG4gICAgdGhpcy4kZWwgPSAkZWw7XG4gICAgdGhpcy5kaXNwbGF5S2V5ID0gZGlzcGxheUtleTtcbiAgfVxuXG4gIGxvYWQod2lkdGgsIGRpbWVuc2lvbnMsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5yZW5kZXIod2lkdGgsIGRpbWVuc2lvbnMpO1xuXG4gICAgdmFyIGRpc3BsYXlDb3VwbGVyID0gbmV3IERpc3BsYXlDb3VwbGVyKGZpcmViYXNlLmRhdGFiYXNlKCkpO1xuICAgIGRpc3BsYXlDb3VwbGVyLmNvbm5lY3QodGhpcy5kaXNwbGF5S2V5LCB7XG4gICAgICBvblJlYWR5OiBmdW5jdGlvbihkaXNwbGF5RGF0YSwgbmV4dCkge1xuICAgICAgICBuZXh0KClcbiAgICAgIH0sXG4gICAgICBvblBpeGVsQ2hhbmdlOiAoeSwgeCwgaGV4LCBkaXNwbGF5RGF0YSkgPT4ge1xuICAgICAgICBkaXNwbGF5RGF0YSA9IGRpc3BsYXlEYXRhIHx8IHt9O1xuICAgICAgICB0aGlzLnJlZnJlc2hQaXhlbEJ5Q29vcmRpbmF0ZXMoeSwgeCwgaGV4LCBkaXNwbGF5RGF0YSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY2FsbGJhY2soKTtcbiAgfVxuXG4gIGRlbW8obWFjcm8sIG1hY3JvQ29uZmlnLCB3aWR0aCwgZGltZW5zaW9ucywgY2FsbGJhY2spIHtcbiAgICB2YXIgZGlzcGxheUNvbmZpZyA9IHtcbiAgICAgIG1hY3JvOiBtYWNybyxcbiAgICAgIG1hY3JvQ29uZmlnOiBtYWNyb0NvbmZpZyxcbiAgICAgIHdpZHRoOiBkaW1lbnNpb25zLndpZHRoLFxuICAgICAgaGVpZ2h0OiBkaW1lbnNpb25zLmhlaWdodFxuICAgIH07XG5cbiAgICB0aGlzLnJlbmRlcih3aWR0aCwgZGltZW5zaW9ucyk7XG5cbiAgICB2YXIgZGlzcGxheUNvdXBsZXIgPSBuZXcgRGlzcGxheUNvdXBsZXIoKTtcbiAgICBkaXNwbGF5Q291cGxlci5kZW1vKGRpc3BsYXlDb25maWcsIHtcbiAgICAgIG9uUmVhZHk6IGZ1bmN0aW9uKGRpc3BsYXlEYXRhLCBuZXh0KSB7XG4gICAgICAgIG5leHQoKVxuICAgICAgfSxcbiAgICAgIG9uUGl4ZWxDaGFuZ2U6ICh5LCB4LCBoZXgsIGRpc3BsYXlEYXRhKSA9PiB7XG4gICAgICAgIGRpc3BsYXlEYXRhID0gZGlzcGxheURhdGEgfHwge307XG4gICAgICAgIHRoaXMucmVmcmVzaFBpeGVsQnlDb29yZGluYXRlcyh5LCB4LCBoZXgsIGRpc3BsYXlEYXRhKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjYWxsYmFjaygpO1xuICB9XG5cbiAgcmVuZGVyKHdpZHRoLCBkaW1lbnNpb25zKSB7XG4gICAgdGhpcy4kZWwuaHRtbChgXG4gICAgICA8ZGl2IGNsYXNzPVwiZGlzcGxheVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidG9wXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJyaWdodFwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZnJvbnRcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGApO1xuXG4gICAgdmFyIGFkanVzdGVkQnJpZ2h0bmVzcyA9ICg1MCArICgxMDAgLyAyKSkgLyAxMDAsXG4gICAgICAgIHNpemUgPSAod2lkdGggLSAyMCkgLyBkaW1lbnNpb25zLndpZHRoO1xuXG4gICAgZm9yKHZhciB5ID0gMDsgeSA8IGRpbWVuc2lvbnMuaGVpZ2h0OyB5KyspIHtcbiAgICAgIHZhciAkcm93ID0gJChgPGRpdiBjbGFzcz1cIm1hdHJpeC1yb3dcIiBzdHlsZT1cIm9wYWNpdHk6ICR7YWRqdXN0ZWRCcmlnaHRuZXNzfTsgaGVpZ2h0OiAke3NpemV9cHg7IGxpbmUtaGVpZ2h0OiAke3NpemV9cHg7XCI+YCk7XG4gICAgICBmb3IodmFyIHggPSAwOyB4IDwgZGltZW5zaW9ucy53aWR0aDsgeCsrKSB7XG4gICAgICAgICRyb3cuYXBwZW5kKGBcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1hdHJpeC1kb3Qtd3JhcHBlclwiIHN0eWxlPVwid2lkdGg6ICR7c2l6ZX1weDsgaGVpZ2h0OiAke3NpemV9cHg7XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWF0cml4LWRvdFwiIGRhdGEteT1cIiR7eX1cIiBkYXRhLXg9XCIke3h9XCIgZGF0YS1jb29yZGluYXRlcz1cIiR7eX06JHt4fVwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogIzQ0NFwiPlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgYCk7XG4gICAgICB9XG4gICAgICB0aGlzLiRlbC5maW5kKCcuZnJvbnQnKS5hcHBlbmQoJHJvdyk7XG4gICAgfVxuICB9XG5cbiAgcmVmcmVzaFBpeGVsQnlDb29yZGluYXRlcyh5LCB4LCBoZXgsIGRpc3BsYXlEYXRhKSB7XG4gICAgdmFyIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgW2RhdGEtY29vcmRpbmF0ZXM9JyR7eX06JHt4fSddYCk7XG4gICAgaWYoZWwubGVuZ3RoID4gMCkge1xuICAgICAgZWxbMF0uc3R5bGUuYmFja2dyb3VuZCA9IChoZXggPT09ICcjMDAwMDAwJyA/IGAjNDQ0YCA6IGhleCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNoYWRlSGV4KGNvbG9yLCBwZXJjZW50KSB7XG4gICAgdmFyIGY9cGFyc2VJbnQoY29sb3Iuc2xpY2UoMSksMTYpLHQ9cGVyY2VudDwwPzA6MjU1LHA9cGVyY2VudDwwP3BlcmNlbnQqLTE6cGVyY2VudCxSPWY+PjE2LEc9Zj4+OCYweDAwRkYsQj1mJjB4MDAwMEZGO1xuICAgIHJldHVybiBcIiNcIisoMHgxMDAwMDAwKyhNYXRoLnJvdW5kKCh0LVIpKnApK1IpKjB4MTAwMDArKE1hdGgucm91bmQoKHQtRykqcCkrRykqMHgxMDArKE1hdGgucm91bmQoKHQtQikqcCkrQikpLnRvU3RyaW5nKDE2KS5zbGljZSgxKTtcbn1cblxuZXhwb3J0IHsgRGlzcGxheSBhcyBkZWZhdWx0IH1cbiIsImltcG9ydCBVc2VyTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy91c2VyLW1hbmFnZXInO1xuaW1wb3J0IERpc3BsYXlNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL2Rpc3BsYXktbWFuYWdlcic7XG5cbnZhciB1c2VyTWFuYWdlciA9IG5ldyBVc2VyTWFuYWdlcigpLFxuICAgIGRpc3BsYXlNYW5hZ2VyID0gbmV3IERpc3BsYXlNYW5hZ2VyKCk7XG5cbmNsYXNzIEhlYWRlciB7XG4gIGNvbnN0cnVjdG9yKCRlbCkge1xuICAgIHRoaXMuJGVsID0gJGVsO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHRoaXMuJGVsLmh0bWwoYFxuICAgICAgPGhlYWRlciBjbGFzcz1cIm5hdmJhciBuYXZiYXItc3RhdGljLXRvcFwiIHN0eWxlPVwiYm9yZGVyLXJhZGl1czogMDtcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInB1bGwtcmlnaHRcIj5cbiAgICAgICAgICA8aW1nIHNyYz1cIlwiIGNsYXNzPVwiYXZhdGFyXCIgc3R5bGU9XCJib3JkZXItcmFkaXVzOiAyMHB4OyB3aWR0aDogNDBweDsgaGVpZ2h0OiA0MHB4O1wiLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxhIGNsYXNzPVwibmF2YmFyLWJyYW5kXCIgaHJlZj1cIi9cIj5CSUdET1RTPC9hPlxuICAgICAgPC9oZWFkZXI+XG4gICAgYCk7XG5cbiAgICBmaXJlYmFzZS5hdXRoKCkub25BdXRoU3RhdGVDaGFuZ2VkKCh1c2VyKSA9PiB7XG4gICAgICBpZih1c2VyKSB7XG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJ2hlYWRlcicpLnJlbW92ZUNsYXNzKCdsb2dnZWQtb3V0Jyk7XG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJy5hdmF0YXInKS5hdHRyKCdzcmMnLCB1c2VyLnBob3RvVVJMKTtcbiAgICAgICAgJHNpZ25lZE91dC5oaWRlKCk7XG4gICAgICAgICRzaWduZWRJbi5zaG93KCk7XG5cbiAgICAgICAgdmFyIGlkZW50aXR5ID0ge1xuICAgICAgICAgIG5hbWU6IHVzZXIuZGlzcGxheU5hbWUsXG4gICAgICAgICAgcHJvZmlsZUltYWdlVXJsOiB1c2VyLnBob3RvVVJMLFxuICAgICAgICAgIHVpZDogdXNlci51aWRcbiAgICAgICAgfTtcblxuICAgICAgICB1c2VyTWFuYWdlci51cGRhdGVJZGVudGl0eSh1c2VyLnVpZCwgaWRlbnRpdHksIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIC8vIFNvbWV0aGluZy4uLlxuICAgICAgICB9KTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnaGVhZGVyJykuYWRkQ2xhc3MoJ2xvZ2dlZC1vdXQnKTtcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnLnVzZXItc2lnbmVkLW91dCcpLnNob3coKTtcbiAgICAgICAgJHNpZ25lZEluLmhpZGUoKTtcbiAgICAgICAgJHNpZ25lZE91dC5zaG93KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLiRlbC5maW5kKCcuc2lnbi1pbicpLmNsaWNrKChldikgPT4ge1xuICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciBwcm92aWRlciA9IG5ldyBmaXJlYmFzZS5hdXRoLkdvb2dsZUF1dGhQcm92aWRlcigpO1xuICAgICAgZmlyZWJhc2UuYXV0aCgpLnNpZ25JbldpdGhQb3B1cChwcm92aWRlcikudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgIHZhciB1c2VyID0gcmVzdWx0LnVzZXI7XG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJy5hdmF0YXInKS5hdHRyKCdzcmMnLCB1c2VyLnBob3RvVVJMKTtcbiAgICAgICAgJHNpZ25lZE91dC5oaWRlKCk7XG4gICAgICAgICRzaWduZWRJbi5zaG93KCk7XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAvLyBIYW5kbGUgRXJyb3JzIGhlcmUuXG4gICAgICAgIHZhciBlcnJvckNvZGUgPSBlcnJvci5jb2RlO1xuICAgICAgICB2YXIgZXJyb3JNZXNzYWdlID0gZXJyb3IubWVzc2FnZTtcbiAgICAgICAgLy8gVGhlIGVtYWlsIG9mIHRoZSB1c2VyJ3MgYWNjb3VudCB1c2VkLlxuICAgICAgICB2YXIgZW1haWwgPSBlcnJvci5lbWFpbDtcbiAgICAgICAgLy8gVGhlIGZpcmViYXNlLmF1dGguQXV0aENyZWRlbnRpYWwgdHlwZSB0aGF0IHdhcyB1c2VkLlxuICAgICAgICB2YXIgY3JlZGVudGlhbCA9IGVycm9yLmNyZWRlbnRpYWw7XG4gICAgICAgIC8vIC4uLlxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IHsgSGVhZGVyIGFzIGRlZmF1bHQgfVxuIiwiY2xhc3MgUmVzb3VyY2Uge1xuICBtYXRyaXgoaWQpIHtcbiAgICByZXR1cm4gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoYG1hdHJpY2VzLyR7aWR9YCk7XG4gIH1cblxuICBtYXRyaXhQaXhlbChpZCwgeSwgeCkge1xuICAgIHJldHVybiBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZihgbWF0cmljZXMvJHtpZH0vJHt5fToke3h9YCk7XG4gIH1cblxuICBkaXNwbGF5cygpIHtcbiAgICByZXR1cm4gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoJ2Rpc3BsYXlzJyk7XG4gIH1cblxuICBkaXNwbGF5KGlkKSB7XG4gICAgcmV0dXJuIGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKGBkaXNwbGF5cy8ke2lkfWApO1xuICB9XG5cbiAgZGlzcGxheUNvbm5lY3RlZEhhcmR3YXJlKGlkKSB7XG4gICAgcmV0dXJuIGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKGBkaXNwbGF5cy8ke2lkfS9jb25uZWN0ZWRIYXJkd2FyZWApO1xuICB9XG5cbiAgZGlzcGxheU1hY3JvQ29uZmlnKGlkLCBtb2RlKSB7XG4gICAgcmV0dXJuIGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKGBkaXNwbGF5cy8ke2lkfS9tYWNyb3MvJHttb2RlfWApO1xuICB9XG5cbiAgZGlzcGxheU93bmVycyhpZCkge1xuICAgIHJldHVybiBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZihgZGlzcGxheXMvJHtpZH0vb3duZXJzYCk7XG4gIH1cblxuICBtYWNyb3MoKSB7XG4gICAgcmV0dXJuIGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCdtYWNyb3MnKTtcbiAgfVxuXG4gIGhhcmR3YXJlcygpIHtcbiAgICByZXR1cm4gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoJ2hhcmR3YXJlJyk7XG4gIH1cblxuICBoYXJkd2FyZShpZCkge1xuICAgIHJldHVybiBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZihgaGFyZHdhcmUvJHtpZH1gKTtcbiAgfVxuXG4gIHVzZXJJZGVudGl0eShpZCkge1xuICAgIHJldHVybiBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZihgdXNlcnMvcHVibGljLyR7aWR9L2lkZW50aXR5YCk7XG4gIH1cbiAgdXNlckRpc3BsYXlzKGlkKSB7XG4gICAgcmV0dXJuIGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKGB1c2Vycy9wcml2YXRlLyR7aWR9L2Rpc3BsYXlzYCk7XG4gIH1cbn1cblxuZXhwb3J0IHsgUmVzb3VyY2UgYXMgZGVmYXVsdCB9XG4iLCJpbXBvcnQgcGFnZSBmcm9tICdwYWdlJztcblxuaW1wb3J0IERpc3BsYXlQYWdlIGZyb20gJy4vcGFnZXMvZGlzcGxheS1wYWdlJztcbmltcG9ydCBDcmVhdGVEaXNwbGF5UGFnZSBmcm9tICcuL3BhZ2VzL2NyZWF0ZS1kaXNwbGF5LXBhZ2UnO1xuaW1wb3J0IEhvbWVQYWdlIGZyb20gJy4vcGFnZXMvaG9tZS1wYWdlJztcbmltcG9ydCBEYXNoYm9hcmRQYWdlIGZyb20gJy4vcGFnZXMvZGFzaGJvYXJkLXBhZ2UnO1xuaW1wb3J0IEluc3RhbGxNYWNyb3NQYWdlIGZyb20gJy4vcGFnZXMvaW5zdGFsbC1tYWNyb3MtcGFnZSc7XG5pbXBvcnQgSG93VG9CdWlsZEFEaXNwbGF5UGFnZSBmcm9tICcuL3BhZ2VzL2hvdy10by1idWlsZC1hLWRpc3BsYXktcGFnZSc7XG5cbmltcG9ydCBIZWFkZXIgZnJvbSAnLi9jb21wb25lbnRzL2hlYWRlcic7XG5cbmZpcmViYXNlLmluaXRpYWxpemVBcHAoe1xuICBhcGlLZXk6IFwiQUl6YVN5QU5vYjREYkNCdnBVVTFQSmpxNnA3N3FwVHdzTXJjSmZJXCIsXG4gIGF1dGhEb21haW46IFwibGVkLWZpZXN0YS5maXJlYmFzZWFwcC5jb21cIixcbiAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly9sZWQtZmllc3RhLmZpcmViYXNlaW8uY29tXCIsXG4gIHN0b3JhZ2VCdWNrZXQ6IFwibGVkLWZpZXN0YS5hcHBzcG90LmNvbVwiXG59KTtcblxucGFnZSgnL215L2Rhc2hib2FyZCcsIGZ1bmN0aW9uKCkge1xuICBuZXcgRGFzaGJvYXJkUGFnZSgpLnJlbmRlcigpO1xufSk7XG5cbnBhZ2UoJy9kaXNwbGF5cy9uZXcnLCBmdW5jdGlvbigpIHtcbiAgbmV3IENyZWF0ZURpc3BsYXlQYWdlKCkucmVuZGVyKCk7XG59KTtcblxucGFnZSgnL2Rpc3BsYXlzLzppZCcsIGZ1bmN0aW9uKGN0eCkge1xuICBuZXcgRGlzcGxheVBhZ2Uoe1xuICAgIGlkOiBjdHgucGFyYW1zLmlkXG4gIH0pLnJlbmRlcigpO1xufSk7XG5cbnBhZ2UoJy9pbnN0YWxsLW1hY3JvcycsIGZ1bmN0aW9uKCkge1xuICBuZXcgSW5zdGFsbE1hY3Jvc1BhZ2UoKS5yZW5kZXIoKTtcbn0pO1xuXG5wYWdlKCcvaG93LXRvLWJ1aWxkLWEtZGlzcGxheScsIGZ1bmN0aW9uKCkge1xuICBuZXcgSG93VG9CdWlsZEFEaXNwbGF5UGFnZSgpLnJlbmRlcigpO1xufSk7XG5cbmZpcmViYXNlLmF1dGgoKS5vbkF1dGhTdGF0ZUNoYW5nZWQoZnVuY3Rpb24odXNlcikge1xuICBpZih1c2VyKSB7XG4gICAgbmV3IEhlYWRlcigkKCcuaGVhZGVyJykpLnJlbmRlcigpO1xuICAgIHBhZ2UoKTtcbiAgfVxufSk7XG4iLCJpbXBvcnQgUmVzb3VyY2UgZnJvbSAnLi4vbGliL3Jlc291cmNlJztcblxuY2xhc3MgRGlzcGxheU1hbmFnZXIge1xuICBjcmVhdGUobWF0cml4LCBjb25maWcsIHVpZCwgY2IpIHtcbiAgICB2YXIgbWF0cml4S2V5ID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoJ21hdHJpY2VzJykucHVzaCgpLmtleSxcbiAgICAgICAgZGlzcGxheUtleSA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCdkaXNwbGF5cycpLnB1c2goKS5rZXk7XG5cbiAgICBuZXcgUmVzb3VyY2UoKS5tYXRyaXgobWF0cml4S2V5KS5zZXQobWF0cml4KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgbmV3IFJlc291cmNlKCkuZGlzcGxheShkaXNwbGF5S2V5KS5zZXQoY29uZmlnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICBkYXRhW2Rpc3BsYXlLZXldID0gdHJ1ZTtcblxuICAgICAgICBuZXcgUmVzb3VyY2UoKS51c2VyRGlzcGxheXModWlkKS51cGRhdGUoZGF0YSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICBjYihkaXNwbGF5S2V5KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldFVzZXJEaXNwbGF5cyh1aWQsIGNhbGxiYWNrKSB7XG4gICAgbmV3IFJlc291cmNlKCkudXNlckRpc3BsYXlzKHVpZCkub25jZSgndmFsdWUnKS50aGVuKChzbmFwc2hvdCkgPT4ge1xuICAgICAgdmFyIGRpc3BsYXlLZXlzID0gT2JqZWN0LmtleXMoc25hcHNob3QudmFsKCkpLFxuICAgICAgICAgIGFzc2VtYmxlZERpc3BsYXlzID0gW107XG5cbiAgICAgIGRpc3BsYXlLZXlzLmZvckVhY2goKGRpc3BsYXlLZXkpID0+IHtcbiAgICAgICAgdGhpcy5nZXREaXNwbGF5KGRpc3BsYXlLZXksIChkaXNwbGF5RGF0YSkgPT4ge1xuICAgICAgICAgIGFzc2VtYmxlZERpc3BsYXlzLnB1c2goZGlzcGxheURhdGEpO1xuXG4gICAgICAgICAgaWYoYXNzZW1ibGVkRGlzcGxheXMubGVuZ3RoID09IGRpc3BsYXlLZXlzLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FsbGJhY2soZGlzcGxheUtleXMsIGFzc2VtYmxlZERpc3BsYXlzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRPd25lcnMoa2V5LCBjYWxsYmFjaykge1xuICAgIG5ldyBSZXNvdXJjZSgpLmRpc3BsYXlPd25lcnMoa2V5KS5vbmNlKCd2YWx1ZScpLnRoZW4oKHNuYXBzaG90KSA9PiB7XG4gICAgICB2YXIgdXNlcktleXMgPSBPYmplY3Qua2V5cyhzbmFwc2hvdC52YWwoKSksXG4gICAgICAgICAgYXNzZW1ibGVkVXNlcnMgPSBbXTtcblxuICAgICAgdXNlcktleXMuZm9yRWFjaCgodXNlcktleSkgPT4ge1xuICAgICAgICBuZXcgUmVzb3VyY2UoKS51c2VySWRlbnRpdHkodXNlcktleSkub25jZSgndmFsdWUnKS50aGVuKChpZGVudGl0eSkgPT4ge1xuICAgICAgICAgIGFzc2VtYmxlZFVzZXJzLnB1c2goaWRlbnRpdHkudmFsKCkpO1xuXG4gICAgICAgICAgaWYoYXNzZW1ibGVkVXNlcnMubGVuZ3RoID09IHVzZXJLZXlzLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FsbGJhY2sodXNlcktleXMsIGFzc2VtYmxlZFVzZXJzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXREaXNwbGF5KGtleSwgY2FsbGJhY2spIHtcbiAgICBuZXcgUmVzb3VyY2UoKS5kaXNwbGF5KGtleSkub25jZSgndmFsdWUnKS50aGVuKGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICBjYWxsYmFjayhzbmFwc2hvdC52YWwoKSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXREaXNwbGF5KGtleSwgY2FsbGJhY2spIHtcbiAgICBuZXcgUmVzb3VyY2UoKS5kaXNwbGF5KGtleSkub25jZSgndmFsdWUnKS50aGVuKGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICBjYWxsYmFjayhzbmFwc2hvdC52YWwoKSk7XG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGUoa2V5LCBjb25maWcsIGNiKSB7XG4gICAgbmV3IFJlc291cmNlKCkuZGlzcGxheShrZXkpLnVwZGF0ZShjb25maWcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICBjYigpO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCB7IERpc3BsYXlNYW5hZ2VyIGFzIGRlZmF1bHQgfVxuIiwiaW1wb3J0IFJlc291cmNlIGZyb20gJy4uL2xpYi9yZXNvdXJjZSc7XG5pbXBvcnQgTWFjcm9MaWJyYXJ5IGZyb20gJ21hY3JvLWxpYnJhcnknO1xuXG5jbGFzcyBNYWNyb01hbmFnZXIge1xuICBpbnN0YWxsKGtleSwgY29uZmlnLCBjYikge1xuICAgIHZhciBkYXRhID0ge307XG4gICAgZGF0YVtrZXldID0gY29uZmlnO1xuXG4gICAgbmV3IFJlc291cmNlKCkubWFjcm9zKCkudXBkYXRlKGRhdGEpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICBjYihrZXkpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0SW5zdGFsbGVkTWFjcm9zKGNhbGxiYWNrKSB7XG4gICAgbmV3IFJlc291cmNlKCkubWFjcm9zKCkub25jZSgndmFsdWUnKS50aGVuKChzbmFwc2hvdCkgPT4ge1xuICAgICAgY2FsbGJhY2soc25hcHNob3QudmFsKCkpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0QXZhaWxhYmxlTWFjcm9zKCkge1xuICAgIHZhciBtYWNyb0xpYnJhcnkgPSBuZXcgTWFjcm9MaWJyYXJ5KCk7XG4gICAgbWFjcm9MaWJyYXJ5LnJlZ2lzdGVyTWFjcm9zKCk7XG4gICAgcmV0dXJuIG1hY3JvTGlicmFyeS5hdmFpbGFibGVNYWNyb3MoKTtcbiAgfVxufVxuXG5leHBvcnQgeyBNYWNyb01hbmFnZXIgYXMgZGVmYXVsdCB9XG4iLCJpbXBvcnQgUmVzb3VyY2UgZnJvbSAnLi4vbGliL3Jlc291cmNlJztcblxuY2xhc3MgVXNlck1hbmFnZXIge1xuICBjcmVhdGUobWF0cml4LCBjb25maWcsIGNiKSB7XG4gICAgdmFyIG1hdHJpeEtleSA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCdtYXRyaWNlcycpLnB1c2goKS5rZXksXG4gICAgICAgIGRpc3BsYXlLZXkgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZignZGlzcGxheXMnKS5wdXNoKCkua2V5O1xuXG4gICAgbmV3IFJlc291cmNlKCkubWF0cml4KG1hdHJpeEtleSkuc2V0KG1hdHJpeCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIG5ldyBSZXNvdXJjZSgpLmRpc3BsYXkoZGlzcGxheUtleSkuc2V0KGNvbmZpZykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgY2IoZGlzcGxheUtleSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldERpc3BsYXkoa2V5LCBjYWxsYmFjaykge1xuICAgIG5ldyBSZXNvdXJjZSgpLmRpc3BsYXkoa2V5KS5vbmNlKCd2YWx1ZScpLnRoZW4oZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgIGNhbGxiYWNrKHNuYXBzaG90LnZhbCgpKTtcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZUlkZW50aXR5KGtleSwgaWRlbnRpdHksIGNiKSB7XG4gICAgbmV3IFJlc291cmNlKCkudXNlcklkZW50aXR5KGtleSkudXBkYXRlKGlkZW50aXR5KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgY2IoKTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgeyBVc2VyTWFuYWdlciBhcyBkZWZhdWx0IH1cbiIsImltcG9ydCBwYWdlIGZyb20gJ3BhZ2UnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4vbW9kYWwnO1xuaW1wb3J0IERpc3BsYXlNYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL2Rpc3BsYXktbWFuYWdlcic7XG5cbmNsYXNzIEFwaVVzYWdlTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIGNvbnN0cnVjdG9yKCRlbCwgZGlzcGxheUtleSwgZGlzcGxheURhdGEpIHtcbiAgICBzdXBlcigkZWwpO1xuICAgIHRoaXMuZGlzcGxheUtleSA9IGRpc3BsYXlLZXk7XG4gICAgdGhpcy5kaXNwbGF5RGF0YSA9IGRpc3BsYXlEYXRhO1xuICB9XG5cbiAgJChzZWxlY3Rvcikge1xuICAgIHJldHVybiB0aGlzLiRlbC5maW5kKHNlbGVjdG9yKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICB0aGlzLiRlbC5odG1sKGBcbiAgICAgIDxkaXYgaWQ9XCJhcGktdXNhZ2VcIiBjbGFzcz1cIm1vZGFsIGZhZGVcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWRpYWxvZ1wiIHJvbGU9XCJkb2N1bWVudFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jb250ZW50XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBkYXRhLWRpc21pc3M9XCJtb2RhbFwiIGFyaWEtbGFiZWw9XCJDbG9zZVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZ0aW1lczs8L3NwYW4+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8aDQgY2xhc3M9XCJtb2RhbC10aXRsZVwiPlVzaW5nIHRoZSBBUEk8L2g0PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtYm9keVwiPlxuICAgICAgICAgICAgICA8cCBjbGFzcz1cImFsZXJ0IGFsZXJ0LWRhbmdlclwiPlxuICAgICAgICAgICAgICAgIFRyZWF0IDxzdHJvbmc+JHt0aGlzLmRpc3BsYXlEYXRhLm1hdHJpeH08L3N0cm9uZz4gbGlrZSBhbiA8c3Ryb25nPkFQSSBTRUNSRVQ8L3N0cm9uZz4uIFdob2V2ZXIgcG9zc2Vzc2VzIGl0IGNhbiB3cml0ZSB0byB0aGlzIExFRCBib2FyZC5cbiAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8aDU+VXBkYXRpbmcgb25lIHBvaW50PC9oNT5cbiAgICAgICAgICAgICAgPHA+VG8gdXBkYXRlIGEgc3BlY2lmaWMgcG9pbnQgb24geW91ciBEaXNwbGF5LCByZXBsYWNlIDxzdHJvbmc+WTwvc3Ryb25nPiBhbmQgPHN0cm9uZz5YPC9zdHJvbmc+IHdpdGggdGhlIGNvb3JkaW5hdGUgdG8gdXBkYXRlPC9wPlxuICAgICAgICAgICAgICA8cHJlPlxuaHR0cHM6Ly9sZWQtZmllc3RhLmZpcmViYXNlaW8uY29tL21hdHJpY2VzLyR7dGhpcy5kaXNwbGF5RGF0YS5tYXRyaXh9L1k6WC5qc29uJzwvcHJlPlxuICAgICAgICAgICAgICA8L3ByZT5cbiAgICAgICAgICAgICAgPHA+VGhlbiBqdXN0IHBlcmZvcm0gYSBQQVRDSCByZXF1ZXN0IHRvIHVwZGF0ZSB0aGUgcG9pbnQgYW5kIHBhc3MganNvbiB3aXRoIHRoZSA8c3Ryb25nPmhleDwvc3Ryb25nPiBjb2xvciBhbmQgdGhlIDxzdHJvbmc+dXBkYXRlZEF0PC9zdHJvbmc+IHRpbWVzdGFtcC4gSGVyZSBpcyBhIGN1cmwgZXhhbXBsZSB0aGF0IHlvdSBjYW4gcnVuIGZyb20gdGhlIGNvbW1hbmRsaW5lLjwvcD5cbiAgICAgICAgICAgICAgPHByZT5cbmN1cmwgLVggUEFUQ0ggLWQgJ3tcbiAgXCJoZXhcIjogXCIjRkZGRkZGXCIsXG4gIFwidXBkYXRlZEF0XCI6ICR7bmV3IERhdGUoKS5nZXRUaW1lKCl9XG59JyBcXFxuICAnaHR0cHM6Ly9sZWQtZmllc3RhLmZpcmViYXNlaW8uY29tL21hdHJpY2VzLyR7dGhpcy5kaXNwbGF5RGF0YS5tYXRyaXh9LzA6MC5qc29uJ1xuICAgICAgICAgICAgICA8L3ByZT5cbiAgICAgICAgICAgICAgPGg1PlVwZGF0aW5nIG11bHRpcGxlIHBvaW50czwvaDU+XG4gICAgICAgICAgICAgIDxwcmU+XG5jdXJsIC1YIFBBVENIIC1kICd7XG4gIFwiMDowXCI6IHtcbiAgICBcImhleFwiOiBcIiNGRkZGRkZcIixcbiAgICBcInVwZGF0ZWRBdFwiOiAke25ldyBEYXRlKCkuZ2V0VGltZSgpfVxuICB9LFxuICBcIjA6MVwiOiB7XG4gICAgXCJoZXhcIjogXCIjRkZGRkZGXCIsXG4gICAgXCJ1cGRhdGVkQXRcIjogJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1cbiAgfSxcbiAgXCIwOjJcIjoge1xuICAgIFwiaGV4XCI6IFwiI0ZGRkZGRlwiLFxuICAgIFwidXBkYXRlZEF0XCI6ICR7bmV3IERhdGUoKS5nZXRUaW1lKCl9XG4gIH1cbn0nIFxcXG4gICdodHRwczovL2xlZC1maWVzdGEuZmlyZWJhc2Vpby5jb20vbWF0cmljZXMvJHt0aGlzLmRpc3BsYXlEYXRhLm1hdHJpeH0uanNvbidcbiAgICAgICAgICAgICAgPC9wcmU+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgKTtcbiAgfVxufVxuXG5leHBvcnQgeyBBcGlVc2FnZU1vZGFsIGFzIGRlZmF1bHQgfVxuIiwiaW1wb3J0IHBhZ2UgZnJvbSAncGFnZSc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi9tb2RhbCc7XG5pbXBvcnQgRGlzcGxheU1hbmFnZXIgZnJvbSAnLi4vbWFuYWdlcnMvZGlzcGxheS1tYW5hZ2VyJztcbmltcG9ydCBNYWNyb01hbmFnZXIgZnJvbSAnLi4vbWFuYWdlcnMvbWFjcm8tbWFuYWdlcic7XG5pbXBvcnQgVHlwZXdyaXRlciBmcm9tICd0eXBld3JpdGVyJztcblxudmFyIG1hY3JvTWFuYWdlciA9IG5ldyBNYWNyb01hbmFnZXIoKSxcbiAgICBkaXNwbGF5TWFuYWdlciA9IG5ldyBEaXNwbGF5TWFuYWdlcigpO1xuXG5jbGFzcyBFZGl0RGlzcGxheU1vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBjb25zdHJ1Y3RvcigkZWwsIGRpc3BsYXlLZXksIGRpc3BsYXlEYXRhKSB7XG4gICAgc3VwZXIoJGVsKTtcbiAgICB0aGlzLmRpc3BsYXlLZXkgPSBkaXNwbGF5S2V5O1xuICAgIHRoaXMuZGlzcGxheURhdGEgPSBkaXNwbGF5RGF0YTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICB0aGlzLiRlbC5odG1sKGBcbiAgICAgIDxkaXYgaWQ9XCJlZGl0LWRpc3BsYXlcIiBjbGFzcz1cIm1vZGFsIGZhZGVcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWRpYWxvZ1wiIHJvbGU9XCJkb2N1bWVudFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jb250ZW50XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBkYXRhLWRpc21pc3M9XCJtb2RhbFwiIGFyaWEtbGFiZWw9XCJDbG9zZVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZ0aW1lczs8L3NwYW4+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8aDQgY2xhc3M9XCJtb2RhbC10aXRsZVwiPkVkaXQgRGlzcGxheTwvaDQ+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1ib2R5XCI+XG4gICAgICAgICAgICAgIDxmb3JtPlxuICAgICAgICAgICAgICAgIDx1bCBjbGFzcz1cIm5hdiBuYXYtdGFic1wiPlxuICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwibmF2LWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJuYXYtbGluayBhY3RpdmVcIiBkYXRhLXRvZ2dsZT1cInRhYlwiIGhyZWY9XCIjZWRpdC1nZW5lcmFsXCI+R2VuZXJhbDwvYT5cbiAgICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJuYXYtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cIm5hdi1saW5rXCIgZGF0YS10b2dnbGU9XCJ0YWJcIiBocmVmPVwiI2VkaXQtb3duZXJzXCI+T3duZXJzPC9hPlxuICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cIm5hdi1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwibmF2LWxpbmtcIiBkYXRhLXRvZ2dsZT1cInRhYlwiIGhyZWY9XCIjZWRpdC1tYWNyb1wiPk1hY3JvPC9hPlxuICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWItY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgPGJyIC8+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGlkPVwiZWRpdC1nZW5lcmFsXCIgY2xhc3M9XCJ0YWItcGFuZSBhY3RpdmVcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wteHMtMTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxmaWVsZHNldCBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImRpc3BsYXktbmFtZVwiPkRpc3BsYXkgbmFtZTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwibmFtZVwiIG5hbWU9XCJkaXNwbGF5LW5hbWVcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZGlzcGxheS1uYW1lXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZmllbGRzZXQ+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbC14cy0xMiBjb2wtc20tNlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGZpZWxkc2V0IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiZGlzcGxheS13aWR0aFwiPlNlbGVjdCB3aWR0aDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cImRpc3BsYXktd2lkdGhcIiBuYW1lPVwid2lkdGhcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMTZcIj4xNjwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIzMlwiPjMyPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjY0XCI+NjQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiOTZcIj45Njwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIxMjhcIj4xMjg8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2ZpZWxkc2V0PlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wteHMtMTIgY29sLXNtLTZcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxmaWVsZHNldCBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImRpc3BsYXktaGVpZ2h0XCI+U2VsZWN0IGhlaWdodDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cImRpc3BsYXktaGVpZ2h0XCIgbmFtZT1cImhlaWdodFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIxNlwiPjE2PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjMyXCI+MzI8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiNjRcIj42NDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI5NlwiPjk2PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjEyOFwiPjEyODwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZmllbGRzZXQ+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGlkPVwiZWRpdC1vd25lcnNcIiBjbGFzcz1cInRhYi1wYW5lXCI+XG4gICAgICAgICAgICAgICAgICAgIDx1bCBpZD1cImRpc3BsYXktb3duZXJzXCIgY2xhc3M9XCJsaXN0LWdyb3VwXCI+PC91bD5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBpZD1cImVkaXQtbWFjcm9cIiBjbGFzcz1cInRhYi1wYW5lXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXhzLTEyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZmllbGRzZXQgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJtYWNyb1wiPlNlbGVjdCBtYWNybzwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgbmFtZT1cIm1hY3JvXCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cIm1hY3JvXCI+PC9zZWxlY3Q+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2ZpZWxkc2V0PlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByb2dyYW1tYWJsZSBvcHRpb25zIHJvd1wiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXhzLTEyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInByb2dyYW1tYWJsZSBkZXNjcmlwdGlvblwiPjwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPldhcm5pbmcgeW91IG5lZWQgcHJvZ3JhbW1pbmcgc2tpbGxzIHRvIHVzZSB0aGlzIGRpc3BsYXkgbWFjcm8uIExlYXJuIG1vcmUgYWJvdXQgdGhpcyBvcHRpb24gPGEgaHJlZj1cIiNcIj5oZXJlLjwvYT5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0d2lua2xlIG9wdGlvbnMgcm93XCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wteHMtMTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidHdpbmtsZSBkZXNjcmlwdGlvblwiPjwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxmaWVsZHNldCBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGg1Pk1hY3JvIG9wdGlvbnM8L2g1PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwidHdpbmtsZS1iYXNlLWNvbG9yXCI+U2VlZCBDb2xvcjwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ncm91cCBjb2xvcnBpY2tlci1jb21wb25lbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cInR3aW5rbGUtc2VlZC1jb2xvclwiIHZhbHVlPVwiIzAwNmU5MVwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImlucHV0LWdyb3VwLWFkZG9uXCI+PGk+PC9pPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzbWFsbCBjbGFzcz1cInRleHQtbXV0ZWRcIj5UaGUgYnJpZ2h0ZXN0IGhleCB2YWx1ZSB5b3Ugd2FudCB0byBkaXNwbGF5PC9zbWFsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZmllbGRzZXQ+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic29saWQtY29sb3Igb3B0aW9ucyByb3dcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbC14cy0xMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJzb2xpZC1jb2xvciBkZXNjcmlwdGlvblwiPjwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxmaWVsZHNldCBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGg1Pk1hY3JvIG9wdGlvbnM8L2g1PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwic29saWQtY29sb3JcIj5Db2xvcjwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ncm91cCBjb2xvcnBpY2tlci1jb21wb25lbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cInNvbGlkLWNvbG9yXCIgdmFsdWU9XCIjMDA2ZTkxXCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaW5wdXQtZ3JvdXAtYWRkb25cIj48aT48L2k+PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZmllbGRzZXQ+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dCBvcHRpb25zIHJvd1wiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXhzLTEyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRleHQgZGVzY3JpcHRpb25cIj48L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wteHMtMTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDU+TWFjcm8gb3B0aW9uczwvaDU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJzb2xpZC1jb2xvclwiPkNvbG9yPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ncm91cCBjb2xvcnBpY2tlci1jb21wb25lbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgaWQ9XCJ0ZXh0LWNvbG9yXCIgdmFsdWU9XCIjMDA2ZTkxXCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImlucHV0LWdyb3VwLWFkZG9uXCI+PGk+PC9pPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwidGV4dC12YWx1ZVwiPlRleHQ8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgaWQ9XCJ0ZXh0LXZhbHVlXCIgcGxhY2Vob2xkZXI9XCJXaGF0IHlvdSB3YW50IGRpc3BsYXllZC4uLlwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cInRleHQtZm9udFwiPlNlbGVjdCBmb250PC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cInRleHQtZm9udHNcIj48L3NlbGVjdD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cInRleHQtc3BlZWRcIj5NYXJxdWVlIHNwZWVkPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cInRleHQtbWFycXVlZS1zcGVlZFwiIG5hbWU9XCJzcGVlZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMVwiPjE8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjEwXCI+MTA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjUwXCI+NTA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjEwMFwiPjEwMDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMjUwXCI+MjUwPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI1MDBcIj41MDA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJmb3JtLXRleHQgdGV4dC1tdXRlZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaGUgc3BlZWQgdGhlIHRleHQgaXMgc2Nyb2xsaW5nLCBpbiBtaWxsaXNlY29uZHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cInRleHQtc3BlZWRcIj5NYXJxdWVlIGluaXRpYWwgZGVsYXk8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwidGV4dC1tYXJxdWVlLWluaXRpYWwtZGVsYXlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjEwMFwiPjEwMDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMjAwXCI+MjAwPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI1MDBcIj41MDA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjEwMDBcIj4xMDAwPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIyMDAwXCI+MjAwMDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMzAwMFwiPjMwMDA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjQwMDBcIj40MDAwPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI1MDAwXCI+NTAwMDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImZvcm0tdGV4dCB0ZXh0LW11dGVkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRoZSBkZWxheSBiZWZvcmUgdGhlIHRleHQgc3RhcnRzIHNjcm9sbGluZywgaW4gbWlsbGlzZWNvbmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGJyIC8+PGJyIC8+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIj5VcGRhdGU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYCk7XG5cbiAgICB0aGlzLnBvcHVsYXRlTWFjcm9zKCk7XG4gICAgdGhpcy5wb3B1bGF0ZU93bmVycygpO1xuICAgIHRoaXMucG9wdWxhdGVGb250cygpO1xuXG4gICAgdGhpcy4kKCcjZWRpdC1kaXNwbGF5Jykub24oJ3Nob3cuYnMubW9kYWwnLCAoKSA9PiB7XG4gICAgICB0aGlzLiQoJ3NlbGVjdCNtYWNybycpLnZhbCh0aGlzLmRpc3BsYXlEYXRhLm1hY3JvKS5jaGFuZ2UoKTtcbiAgICAgIHRoaXMuJCgnc2VsZWN0I2Rpc3BsYXktd2lkdGgnKS52YWwodGhpcy5kaXNwbGF5RGF0YS53aWR0aCkuY2hhbmdlKCk7XG4gICAgICB0aGlzLiQoJ3NlbGVjdCNkaXNwbGF5LWhlaWdodCcpLnZhbCh0aGlzLmRpc3BsYXlEYXRhLmhlaWdodCkuY2hhbmdlKCk7XG4gICAgfSk7XG4gICAgdGhpcy4kKCcjZGlzcGxheS1uYW1lJykudmFsKHRoaXMuZGlzcGxheURhdGEubmFtZSlcblxuICAgIHRoaXMuJCgnLmNvbG9ycGlja2VyLWNvbXBvbmVudCcpLmNvbG9ycGlja2VyKCk7XG5cbiAgICB2YXIgJHR3aW5rbGVPcHRpb25zID0gdGhpcy4kKCcub3B0aW9ucy50d2lua2xlJyksXG4gICAgICAgICRwcm9ncmFtbWFibGVPcHRpb25zID0gdGhpcy4kKCcub3B0aW9ucy5wcm9ncmFtbWFibGUnKSxcbiAgICAgICAgJHNvbGlkQ29sb3JPcHRpb25zID0gdGhpcy4kKCcub3B0aW9ucy5zb2xpZC1jb2xvcicpLFxuICAgICAgICAkdGV4dE9wdGlvbnMgPSB0aGlzLiQoJy5vcHRpb25zLnRleHQnKTtcblxuICAgIHRoaXMuJCgnc2VsZWN0I21hY3JvJykuY2hhbmdlKGZ1bmN0aW9uKGVsKSB7XG4gICAgICAkdHdpbmtsZU9wdGlvbnMuaGlkZSgpO1xuICAgICAgJHByb2dyYW1tYWJsZU9wdGlvbnMuaGlkZSgpO1xuICAgICAgJHNvbGlkQ29sb3JPcHRpb25zLmhpZGUoKTtcbiAgICAgICR0ZXh0T3B0aW9ucy5oaWRlKCk7XG5cbiAgICAgIGlmKHRoaXMudmFsdWUgPT09ICd0d2lua2xlJykge1xuICAgICAgICAkdHdpbmtsZU9wdGlvbnMuc2hvdygpO1xuICAgICAgfSBlbHNlIGlmKHRoaXMudmFsdWUgPT0gJ3Byb2dyYW1tYWJsZScpIHtcbiAgICAgICAgJHByb2dyYW1tYWJsZU9wdGlvbnMuc2hvdygpO1xuICAgICAgfSBlbHNlIGlmKHRoaXMudmFsdWUgPT0gJ3NvbGlkLWNvbG9yJykge1xuICAgICAgICAkc29saWRDb2xvck9wdGlvbnMuc2hvdygpO1xuICAgICAgfSBlbHNlIGlmKHRoaXMudmFsdWUgPT0gJ3RleHQnKSB7XG4gICAgICAgICR0ZXh0T3B0aW9ucy5zaG93KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLiQoJ2Zvcm0nKS5zdWJtaXQoKGV2KSA9PiB7XG4gICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICB2YXIgbmV3RGF0YSA9IHtcbiAgICAgICAgbWFjcm86IHRoaXMuJCgnc2VsZWN0I21hY3JvJykudmFsKCksXG4gICAgICAgIG5hbWU6IHRoaXMuJCgnI2Rpc3BsYXktbmFtZScpLnZhbCgpLFxuICAgICAgfTtcblxuICAgICAgaWYobmV3RGF0YS5tYWNybyA9PT0gJ3R3aW5rbGUnKSB7XG4gICAgICAgIG5ld0RhdGEubWFjcm9Db25maWcgPSB7XG4gICAgICAgICAgc2VlZENvbG9yOiB0aGlzLiQoJyN0d2lua2xlLXNlZWQtY29sb3InKS52YWwoKVxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIGlmKG5ld0RhdGEubWFjcm8gPT09ICdzb2xpZC1jb2xvcicpIHtcbiAgICAgICAgbmV3RGF0YS5tYWNyb0NvbmZpZyA9IHtcbiAgICAgICAgICBjb2xvcjogdGhpcy4kKCcjc29saWQtY29sb3InKS52YWwoKVxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIGlmKG5ld0RhdGEubWFjcm8gPT09ICd0ZXh0Jykge1xuICAgICAgICBuZXdEYXRhLm1hY3JvQ29uZmlnID0ge1xuICAgICAgICAgIGNvbG9yOiB0aGlzLiQoJyN0ZXh0LWNvbG9yJykudmFsKCksXG4gICAgICAgICAgdGV4dDogdGhpcy4kKCcjdGV4dC12YWx1ZScpLnZhbCgpLnRvVXBwZXJDYXNlKCksXG4gICAgICAgICAgZm9udDogdGhpcy4kKCcjdGV4dC1mb250cycpLnZhbCgpLFxuICAgICAgICAgIG1hcnF1ZWVTcGVlZDogdGhpcy4kKCcjdGV4dC1tYXJxdWVlLXNwZWVkJykudmFsKCksXG4gICAgICAgICAgbWFycXVlZUluaXRpYWxEZWxheTogdGhpcy4kKCcjdGV4dC1tYXJxdWVlLWluaXRpYWwtZGVsYXknKS52YWwoKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGRpc3BsYXlNYW5hZ2VyLnVwZGF0ZSh0aGlzLmRpc3BsYXlLZXksIG5ld0RhdGEsIChkaXNwbGF5S2V5KSA9PiB7XG4gICAgICAgIHRoaXMuJCgnI2VkaXQtZGlzcGxheScpLm1vZGFsKCdoaWRlJyk7XG5cbiAgICAgICAgLy8gV2h5IGRvZXNuJ3QgdGhpcyBoYXBwZW4gYXV0b21hdGljYWxseT8hXG4gICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbW9kYWwtb3BlbicpO1xuICAgICAgICAkKCcubW9kYWwtYmFja2Ryb3AnKS5yZW1vdmUoKTtcblxuICAgICAgICBwYWdlKGAvZGlzcGxheXMvJHt0aGlzLmRpc3BsYXlLZXl9YCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHBvcHVsYXRlTWFjcm9zKCkge1xuICAgIHZhciAkbWFjcm9zU2VsZWN0ID0gdGhpcy4kKCdzZWxlY3QjbWFjcm8nKTtcbiAgICBtYWNyb01hbmFnZXIuZ2V0SW5zdGFsbGVkTWFjcm9zKChtYWNyb3MpID0+IHtcbiAgICAgIGZvcihsZXQga2V5IGluIG1hY3Jvcykge1xuICAgICAgICAkbWFjcm9zU2VsZWN0LmFwcGVuZChgPG9wdGlvbiB2YWx1ZT0ke2tleX0+JHttYWNyb3Nba2V5XS5uYW1lfTwvb3B0aW9uPmApO1xuICAgICAgICB0aGlzLiQoYC5kZXNjcmlwdGlvbi4ke2tleX1gKS50ZXh0KG1hY3Jvc1trZXldLmRlc2NyaXB0aW9uKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHBvcHVsYXRlRm9udHMoKSB7XG4gICAgdmFyICRmb250c1NlbGVjdCA9IHRoaXMuJCgnc2VsZWN0I3RleHQtZm9udHMnKTtcbiAgICBUeXBld3JpdGVyLmF2YWlsYWJsZUZvbnRzKCkuZm9yRWFjaCgoZm9udCkgPT4ge1xuICAgICAgJGZvbnRzU2VsZWN0LmFwcGVuZChgPG9wdGlvbiB2YWx1ZT0ke2ZvbnR9PiR7Zm9udH08L29wdGlvbj5gKTtcbiAgICB9KTtcbiAgfVxuXG4gIHBvcHVsYXRlT3duZXJzKCkge1xuICAgIGRpc3BsYXlNYW5hZ2VyLmdldE93bmVycyh0aGlzLmRpc3BsYXlLZXksICh1c2Vyc2tleXMsIHVzZXJzKSA9PiB7XG4gICAgICB2YXIgJGRpc3BsYXlPd25lcnMgPSB0aGlzLiQoJyNkaXNwbGF5LW93bmVycycpO1xuICAgICAgdXNlcnMuZm9yRWFjaChmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICRkaXNwbGF5T3duZXJzLmFwcGVuZChgXG4gICAgICAgICAgPGxpIGNsYXNzPVwibGlzdC1ncm91cC1pdGVtXCI+XG4gICAgICAgICAgICA8aW1nIHNyYz1cIiR7dXNlci5wcm9maWxlSW1hZ2VVcmx9XCIgc3R5bGU9XCJ3aWR0aDogNDBweDsgaGVpZ2h0OiA0MHB4OyBib3JkZXItcmFkaXVzOiAyMHB4O1wiIC8+XG4gICAgICAgICAgICAke3VzZXIubmFtZX1cbiAgICAgICAgICA8L2xpPlxuICAgICAgICBgKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCB7IEVkaXREaXNwbGF5TW9kYWwgYXMgZGVmYXVsdCB9XG4iLCJjbGFzcyBNb2RhbCB7XG4gIGNvbnN0cnVjdG9yKCRlbCkge1xuICAgIHRoaXMuJGVsID0gJGVsO1xuICB9XG5cbiAgJChzZWxlY3Rvcikge1xuICAgIHJldHVybiB0aGlzLiRlbC5maW5kKHNlbGVjdG9yKTtcbiAgfVxufVxuXG5leHBvcnQgeyBNb2RhbCBhcyBkZWZhdWx0IH1cbiIsImltcG9ydCBQYWdlIGZyb20gJ3BhZ2UnO1xuaW1wb3J0IHBhZ2UgZnJvbSAncGFnZSc7XG5pbXBvcnQgRGlzcGxheU1hbmFnZXIgZnJvbSAnLi4vbWFuYWdlcnMvZGlzcGxheS1tYW5hZ2VyJztcbmltcG9ydCBSZXNvdXJjZSBmcm9tICcuLi9saWIvcmVzb3VyY2UnO1xuXG5jbGFzcyBDcmVhdGVEaXNwbGF5UGFnZSBleHRlbmRzIFBhZ2Uge1xuICByZW5kZXIoKSB7XG4gICAgdGhpcy4kZWwuaHRtbChgXG4gICAgICA8aDE+XG4gICAgICAgIENyZWF0ZSBhIERpc3BsYXlcbiAgICAgIDwvaDE+XG4gICAgICA8aHIgLz5cbiAgICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbC14cy0xMiBjb2wtc20tNlwiPlxuICAgICAgICAgIDxmb3JtPlxuICAgICAgICAgICAgPGZpZWxkc2V0IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwibmFtZVwiPkRpc3BsYXkgbmFtZTwvbGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJkaXNwbGF5LW5hbWVcIiBwbGFjZWhvbGRlcj1cIk15IGNvb2wgZGlzcGxheVwiIC8+XG4gICAgICAgICAgICAgIDxzbWFsbCBjbGFzcz1cInRleHQtbXV0ZWRcIj5UaGlzIHdpbGwgZnVuY3Rpb24gYXMgYSBsYWJlbDwvc21hbGw+XG4gICAgICAgICAgICA8L2ZpZWxkc2V0PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJvd1wiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXhzLTEyIGNvbC1zbS02XCI+XG4gICAgICAgICAgICAgICAgPGZpZWxkc2V0IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImRpc3BsYXktd2lkdGhcIj5TZWxlY3Qgd2lkdGg8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZGlzcGxheS13aWR0aFwiIG5hbWU9XCJ3aWR0aFwiPlxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMTZcIj4xNjwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMzJcIj4zMjwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiNjRcIj42NDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiOTZcIj45Njwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMTI4XCI+MTI4PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgICA8L2ZpZWxkc2V0PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbC14cy0xMiBjb2wtc20tNlwiPlxuICAgICAgICAgICAgICAgIDxmaWVsZHNldCBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJkaXNwbGF5LWhlaWdodFwiPlNlbGVjdCBoZWlnaHQ8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZGlzcGxheS1oZWlnaHRcIiBuYW1lPVwiaGVpZ2h0XCI+XG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIxNlwiPjE2PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIzMlwiPjMyPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI2NFwiPjY0PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI5NlwiPjk2PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIxMjhcIj4xMjg8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICAgIDwvZmllbGRzZXQ+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tc3VjY2VzcyBwdWxsLXJpZ2h0XCI+Q3JlYXRlIERpc3BsYXk8L2J1dHRvbj5cbiAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYCk7XG5cbiAgICB0aGlzLiRlbC5maW5kKCdmb3JtJykuc3VibWl0KChldikgPT4ge1xuICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgbGV0IGRpc3BsYXlOYW1lID0gJCgnI2Rpc3BsYXktbmFtZScpLnZhbCgpLFxuICAgICAgICAgIGRpc3BsYXlXaWR0aCA9IHBhcnNlSW50KCQoJyNkaXNwbGF5LXdpZHRoJykudmFsKCksIDEwKSxcbiAgICAgICAgICBkaXNwbGF5SGVpZ2h0ID0gcGFyc2VJbnQoJCgnI2Rpc3BsYXktaGVpZ2h0JykudmFsKCksIDEwKTtcblxuICAgICAgdmFyIG1hdHJpeERhdGEgPSBhc3NlbWJsZU1hcnRpeChkaXNwbGF5V2lkdGgsIGRpc3BsYXlIZWlnaHQpLFxuICAgICAgICAgIHVpZCA9IGZpcmViYXNlLmF1dGgoKS5jdXJyZW50VXNlci51aWQ7XG5cbiAgICAgIG5ldyBEaXNwbGF5TWFuYWdlcigpLmNyZWF0ZShtYXRyaXhEYXRhLCB7XG4gICAgICAgIGJyaWdodG5lc3M6IDEwMCxcbiAgICAgICAgbmFtZTogZGlzcGxheU5hbWUsXG4gICAgICAgIHdpZHRoOiBkaXNwbGF5V2lkdGgsXG4gICAgICAgIGhlaWdodDogZGlzcGxheUhlaWdodFxuICAgICAgfSwgdWlkLCBmdW5jdGlvbihkaXNwbGF5S2V5KSB7XG4gICAgICAgIHBhZ2UoYC9kaXNwbGF5cy8ke2Rpc3BsYXlLZXl9YCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NlbWJsZU1hcnRpeCh3aWR0aCwgaGVpZ2h0KSB7XG4gIHZhciBtYXRyaXggPSB7fTtcbiAgZm9yKHZhciB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgZm9yKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcbiAgICAgIG1hdHJpeFtgJHt5fToke3h9YF0gPSB7XG4gICAgICAgIGhleDogJyMwMDAwMDAnLFxuICAgICAgICB1cGRhdGVkQXQ6IERhdGUubm93KClcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1hdHJpeDtcbn1cblxuZXhwb3J0IHsgQ3JlYXRlRGlzcGxheVBhZ2UgYXMgZGVmYXVsdCB9XG4iLCJpbXBvcnQgRGlzcGxheU1hbmFnZXIgZnJvbSAnLi4vbWFuYWdlcnMvZGlzcGxheS1tYW5hZ2VyJztcbmltcG9ydCBQYWdlIGZyb20gJy4vcGFnZSc7XG5cbnZhciBkaXNwbGF5TWFuYWdlciA9IG5ldyBEaXNwbGF5TWFuYWdlcigpO1xuXG5jbGFzcyBEYXNoYm9hcmRQYWdlIGV4dGVuZHMgUGFnZSB7XG4gIHJlbmRlcigpIHtcbiAgICB0aGlzLiRlbC5odG1sKGBcbiAgICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5c1wiPjwvZGl2PlxuICAgIGApO1xuXG4gICAgdmFyIHVpZCA9IGZpcmViYXNlLmF1dGgoKS5jdXJyZW50VXNlci51aWQ7XG4gICAgZGlzcGxheU1hbmFnZXIuZ2V0VXNlckRpc3BsYXlzKHVpZCwgKGRpc3BsYXlLZXlzLCBkaXNwbGF5cykgPT4ge1xuICAgICAgdmFyICRkaXNwbGF5cyA9IHRoaXMuJGVsLmZpbmQoJy5kaXNwbGF5cycpO1xuICAgICAgZGlzcGxheXMuZm9yRWFjaCgoZGlzcGxheSwgaSkgPT4ge1xuICAgICAgICAkZGlzcGxheXMuYXBwZW5kKGBcbiAgICAgICAgICA8YSBocmVmPVwiL2Rpc3BsYXlzLyR7ZGlzcGxheUtleXNbaV19XCI+JHtkaXNwbGF5Lm5hbWV9PC9hPlxuICAgICAgICBgKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCB7IERhc2hib2FyZFBhZ2UgYXMgZGVmYXVsdCB9XG4iLCJpbXBvcnQgRGlzcGxheSBmcm9tICcuLi9jb21wb25lbnRzL2Rpc3BsYXknO1xuaW1wb3J0IFBhZ2UgZnJvbSAnLi9wYWdlJztcbmltcG9ydCBFZGl0RGlzcGxheU1vZGFsIGZyb20gJy4uL21vZGFscy9lZGl0LWRpc3BsYXktbW9kYWwnO1xuaW1wb3J0IEFwaVVzYWdlTW9kYWwgZnJvbSAnLi4vbW9kYWxzL2FwaS11c2FnZS1tb2RhbCc7XG5pbXBvcnQgRGlzcGxheU1hbmFnZXIgZnJvbSAnLi4vbWFuYWdlcnMvZGlzcGxheS1tYW5hZ2VyJztcblxudmFyIGRpc3BsYXlNYW5hZ2VyID0gbmV3IERpc3BsYXlNYW5hZ2VyKCk7XG5cbmNsYXNzIERpc3BsYXlQYWdlIGV4dGVuZHMgUGFnZSB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5pZCA9IGNvbmZpZy5pZDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICB0aGlzLiRlbC5odG1sKGBcbiAgICAgIDxkaXYgY2xhc3M9XCJmcmFtZVwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImRpc3BsYXktbWV0YVwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIj5cbiAgICAgICAgICA8YSBocmVmPVwiI1wiIGNsYXNzPVwiYnRuIGJ0bi1saW5rIHB1bGwtcmlnaHQgY2hhbmdlLW1hY3JvXCIgZGF0YS10b2dnbGU9XCJtb2RhbFwiIGRhdGEtdGFyZ2V0PVwiI2VkaXQtZGlzcGxheVwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJkaXNwbGF5LW1hY3JvXCI+PC9zcGFuPlxuICAgICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS1wZW5jaWxcIj48L2k+XG4gICAgICAgICAgPC9hPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZGlzcGxheS1uYW1lIHRleHQtbGVmdFwiPjwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J21hdHJpeC1jb250YWluZXInPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZGlzcGxheS1tZXRhXCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiPlxuICAgICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJidG4gYnRuLWxpbmsgcHVsbC1yaWdodCBhcGktdXNhZ2VcIiBkYXRhLXRvZ2dsZT1cIm1vZGFsXCIgZGF0YS10YXJnZXQ9XCIjYXBpLXVzYWdlXCI+XG4gICAgICAgICAgICBVc2luZyB0aGUgQVBJLi4uXG4gICAgICAgICAgPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImVkaXQtZGlzcGxheS1tb2RhbFwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiYXBpLXVzYWdlLW1vZGFsXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgKTtcblxuICAgIGZpcmViYXNlLmF1dGgoKS5vbkF1dGhTdGF0ZUNoYW5nZWQoKHVzZXIpID0+IHtcbiAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgIHRoaXMuJCgnLmRpc3BsYXktbWV0YScpLnNob3coKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuJCgnLmRpc3BsYXktbWV0YScpLmhpZGUoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBkaXNwbGF5ID0gbmV3IERpc3BsYXkodGhpcy4kKCcubWF0cml4LWNvbnRhaW5lcicpLCB0aGlzLmlkKTtcblxuICAgIGRpc3BsYXlNYW5hZ2VyLmdldERpc3BsYXkodGhpcy5pZCwgKGRpc3BsYXlEYXRhKSA9PiB7XG4gICAgICB2YXIgZGltZW5zaW9ucyA9IHtcbiAgICAgICAgd2lkdGg6IGRpc3BsYXlEYXRhLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IGRpc3BsYXlEYXRhLmhlaWdodFxuICAgICAgfTtcblxuICAgICAgZGlzcGxheS5sb2FkKCQoJy5mcmFtZScpLndpZHRoKCksIGRpbWVuc2lvbnMsICgpID0+IHtcbiAgICAgICAgdGhpcy4kKCcuZGlzcGxheS1uYW1lJykudGV4dChkaXNwbGF5RGF0YS5uYW1lKTtcbiAgICAgICAgdGhpcy4kKCcuZGlzcGxheS1tYWNybycpLnRleHQoZGlzcGxheURhdGEubWFjcm8pO1xuICAgICAgICB0aGlzLiQoJy5mcmFtZScpLmZhZGVJbigpO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciAkZWRpdERpc3BsYXlNb2RhbCA9IHRoaXMuJCgnLmVkaXQtZGlzcGxheS1tb2RhbCcpO1xuICAgICAgbmV3IEVkaXREaXNwbGF5TW9kYWwoJGVkaXREaXNwbGF5TW9kYWwsIHRoaXMuaWQsIGRpc3BsYXlEYXRhKS5yZW5kZXIoKTtcblxuICAgICAgdmFyICRhcGlVc2FnZU1vZGFsID0gdGhpcy4kKCcuYXBpLXVzYWdlLW1vZGFsJyk7XG4gICAgICBuZXcgQXBpVXNhZ2VNb2RhbCgkYXBpVXNhZ2VNb2RhbCwgdGhpcy5pZCwgZGlzcGxheURhdGEpLnJlbmRlcigpO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCB7IERpc3BsYXlQYWdlIGFzIGRlZmF1bHQgfVxuIiwiaW1wb3J0IERpc3BsYXkgZnJvbSAnLi4vY29tcG9uZW50cy9kaXNwbGF5JztcblxuY2xhc3MgSG9tZVBhZ2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHRoaXMuJGVsID0gJCgnJylcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICB0aGlzLiRlbC5odG1sKGBcbiAgICAgIDxoZWFkZXIgY2xhc3M9XCJuYXZiYXIgbmF2YmFyLXN0YXRpYy10b3AgbmF2YmFyLWRhcmsgbG9nZ2VkLW91dFwiIHN0eWxlPVwiYm9yZGVyLXJhZGl1czogMDtcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInB1bGwtcmlnaHRcIj5cbiAgICAgICAgICA8YSBocmVmPVwiI1wiIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnkgc2lnbi1pblwiPlNpZ24gaW48L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YSBjbGFzcz1cIm5hdmJhci1icmFuZFwiIGhyZWY9XCIvXCI+QklHRE9UUzwvYT5cbiAgICAgICAgPGRpdiBjbGFzcz1cImRlbW9cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibWF0cml4XCIgc3R5bGU9XCJ3aWR0aDogNjUwcHg7IG1hcmdpbjogYXV0bztcIj48L2Rpdj5cbiAgICAgICAgICA8cCBzdHlsZT1cImZvbnQtc2l6ZTogMzBweDsgbWFyZ2luOiAzMHB4IDA7XCI+QSBwcm9ncmFtbWFibGUgTEVEIGRpc3BsYXkgZm9yLi4uIGFueXRoaW5nITwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2hlYWRlcj5cbiAgICBgKTtcblxuICAgIHZhciBkaXNwbGF5ID0gbmV3IERpc3BsYXkodGhpcy4kZWwuZmluZCgnLm1hdHJpeCcpLCAnLUtRQnF6M0kzYVNNZ1d2UFFLeHonKTtcbiAgICBkaXNwbGF5LmxvYWQoNjUwLCB7IHdpZHRoOiAxMjgsIGhlaWdodDogMzIgfSwgKCkgPT4ge1xuICAgICAgLy8gU29tZXRoaW5nLi4uXG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IHsgSG9tZVBhZ2UgYXMgZGVmYXVsdCB9XG4iLCJpbXBvcnQgUGFnZSBmcm9tICcuL3BhZ2UnO1xuXG5jbGFzcyBIb3dUb0J1aWxkQURpc3BsYXlQYWdlIGV4dGVuZHMgUGFnZSB7XG4gIHJlbmRlcigpIHtcbiAgICB0aGlzLiRlbC5odG1sKGBcbiAgICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXItZmx1aWRcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInJvd1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtbGctNiBvZmZzZXQtbGctM1wiIHN0eWxlPVwibWFyZ2luLXRvcDogMTAwcHg7XCI+XG4gICAgICAgICAgICA8aDE+SG93IFRvIEJ1aWxkIEFuIExFRCBEaXNwbGF5PC9oMT5cbiAgICAgICAgICAgIDxwPlRha2luZyBpdCB0byB0aGUgbmV4dCBsZXZlbCBpcyBlYXN5LCBsZXQncyBnZXQgZ29pbmcuLjwvcD5cbiAgICAgICAgICAgIDxociBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDQwcHg7XCIgLz5cbiAgICAgICAgICAgIDxoNCBzdHlsZT1cIm1hcmdpbjogMjBweCAwO1wiPllvdSB3aWxsIG5lZWQuLi48L2g0PlxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgPHN0cm9uZz5BdCBsZWFzdCBvbmUgUkJHIExFRCBib2FyZDwvc3Ryb25nPlxuICAgICAgICAgICAgICAgIDxwPlRoZSA8YSBocmVmPVwiaHR0cDovL3d3dy5hZGFmcnVpdC5jb20vcHJvZHVjdHMvNDIwXCI+MTZ4MzI8L2E+IG9yIDxhIGhyZWY9XCIjXCI+MzJ4MzI8L2E+IG1vZGVsIHdpbGwgd29yayBqdXN0IGZpbmUuIEkgd291bGQgcmVjb21tZW5kIGNoYWluaW5nIGF0IGxlYXN0IDMgdG9nZXRoZXIuPC9wPlxuICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgPHN0cm9uZz5SYXNwYmVycnkgUEk8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8cD5TdXJlIHRoZSBwcmV2aW91cyBnZW5lcmF0aW9uIG9mIHBpIHdpbGwgd29yaywgYnV0IGlmIHlvdSB3YW50IHRvIHVwZGF0ZSB0aGUgTEVEcyBhcyBmYXN0IGFzIHBvc3NpYmxlLCBnZXQgdGhlIDxhIGhyZWY9XCIjXCI+bGF0ZXN0IFBJPC9hPi48L3A+XG4gICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICA8c3Ryb25nPkZlbWFsZSB0byBGZW1hbGUgd2lyZXM8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8cD5UaGVzZSA8YSBocmVmPVwiaHR0cDovL3d3dy5hZGFmcnVpdC5jb20vcHJvZHVjdHMvMjY2XCI+d2lyZXM8L2E+IGFyZSBmb3IgY29ubmVjdGluZyB0aGUgZmlyc3QgTEVEIGJvYXJkIHRvIHRoZSBHUElPIHBpbnMgb24geW91ciByYXNwYmVycnkgUEkuPC9wPlxuICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgPHN0cm9uZz5Qb3dlciBzdXBwbHk8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8cD5Zb3UnbGwgbmVlZCBhIDxhIGhyZWY9XCJodHRwOi8vd3d3LmFkYWZydWl0LmNvbS9wcm9kdWN0cy8yNzZcIj41djwvYT4gb3IgMTB2IChpZiB5b3UgaGF2ZSBhIDMgb3IgbW9yZSBjaGFpbmVkKSBwb3dlcnN1cHBseSB0byBydW4geW91ciBib2FyZChzKS48L3A+XG4gICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICA8c3Ryb25nPjIuMW1tIHRvIFNjcmV3IEphY2sgQWRhcHRlcjwvc3Ryb25nPlxuICAgICAgICAgICAgICAgIDxwPlRoaXMgPGEgaHJlZj1cImh0dHA6Ly93d3cuYWRhZnJ1aXQuY29tL3Byb2R1Y3RzLzM2OFwiPmFkYXB0ZXI8L2E+IHdpbGwgY29ubmVjdCB5b3VyIHBvd2Vyc3VwcGx5IHRvIHlvdXIgTEVEIGJvYXJkcy48L3A+XG4gICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPGg0IHN0eWxlPVwibWFyZ2luLXRvcDogMTAwcHg7XCI+V2lyaW5nIHRoZSBmaXJzdCBMRUQgYm9hcmQgdG8geW91ciByYXNwYmVycnkgUEk8L2g0PlxuICAgICAgICAgICAgPHA+SnVzdCBmb2xsb3dpbmcgdGhlIHdpcmluZyBkaWFncmFtIGJlbG93Li4uPC9wPlxuICAgICAgICAgICAgPGltZyBzcmM9XCJodHRwOi8vcGxhY2Vob2xkLml0LzM1MHgxNTBcIiBzdHlsZT1cIndpZHRoOiAxMDAlO1wiPlxuXG4gICAgICAgICAgICA8aDQgc3R5bGU9XCJtYXJnaW4tdG9wOiAxMDBweDtcIj5DaGFpbmluZyB5b3VyIGJvYXJkcyAoaWYgcmVxdWlyZWQpPC9oND5cbiAgICAgICAgICAgIDxwPkFsbCB0aGUgYm9hcmRzIGNvbWUgd2l0aCBhIHJpYmJvbiBjYWJsZSBhbmQgYSBwb3dlciBjYWJsZSB0byBiZSB1c2VkIGZvciBjaGFpbmluZy4gRm9sbG93IHRoZSBvdXRsaW5lIGJlbG93IHRvIGNoYWluIHlvdXIgYm9hcmRzLjwvcD5cbiAgICAgICAgICAgIDxpbWcgc3JjPVwiaHR0cDovL3BsYWNlaG9sZC5pdC8zNTB4MTUwXCIgc3R5bGU9XCJ3aWR0aDogMTAwJTtcIj5cblxuICAgICAgICAgICAgPGg0IHN0eWxlPVwibWFyZ2luLXRvcDogMTAwcHg7XCI+Q29ubmVjdGluZyB0aGUgcG93ZXIgYWRhcHRlciB0byB0aGUgTEVEIGJvYXJkIHBvd2VyIGNhYmxlZDwvaDQ+XG4gICAgICAgICAgICA8cD5KdXN0IGZvbGxvd2luZyB0aGUgcGljdHVyZSBiZWxvdy4uLjwvcD5cbiAgICAgICAgICAgIDxpbWcgc3JjPVwiaHR0cDovL3BsYWNlaG9sZC5pdC8zNTB4MTUwXCIgc3R5bGU9XCJ3aWR0aDogMTAwJTtcIj5cblxuICAgICAgICAgICAgPGg0IHN0eWxlPVwibWFyZ2luLXRvcDogMTAwcHg7XCI+SW5zdGFsbGluZyBCSUdET1RTIG9uIHlvdXIgUEk8L2g0PlxuICAgICAgICAgICAgPG9sPlxuICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgU1NIIGludG8geW91ciByYXNwYmVycnkgUElcbiAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgIENsb25lIHRoZSBoYXJkd2FyZSBjbGllbnQgaW50byB5b3VyIGhvbWUgZGlyZWN0b3J5XG48cHJlPlxuJCBjZFxuJCBnaXQgY2xvbmUgZ2l0QGdpdGh1Yi5jb206YmlnZG90cy1pby9oYXJkd2FyZS1jbGllbnQuZ2l0XG48L3ByZT5cbiAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgIFJ1biB0aGUgaW5zdGFsbCBzY3JpcHQgZnJvbSB0aGUgY2xvbmVkIGRpcmVjdG9yeVxuPHByZT5cbmNkIGhhcmR3YXJlLWNsaWVudFxuc3VkbyAuL2luc3RhbGwuc2hcbjwvcHJlPlxuICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgVXNpbmcgYW4gZWRpdG9yLCBhZGQgYSA8c3Ryb25nPmRpc3BsYXktY29uZmlnLmpzb248L3N0cm9uZz4gZmlsZS5cbiAgICAgICAgICAgICAgPHByZT5cbntcbiAgXCJkaXNwbGF5XCI6IFwiWU9VUiBESVNQTEFZIElEXCIsXG4gIFwicm93c1wiOiAzMixcbiAgXCJjaGFpbnNcIjogMyxcbiAgXCJwYXJhbGxlbFwiOiAxXG59XG4gICAgICAgICAgICAgIDwvcHJlPlxuICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgVG8gc3RhcnQgdGhlIGNsaWVudCBydW4uLlxuICAgICAgICAgICAgICAgIDxwcmU+XG5zdWRvIHN0YXJ0IGhhcmR3YXJlLWNsaWVudFxuICAgICAgICAgICAgICAgIDwvcHJlPlxuICAgICAgICAgICAgICAgIC4uLm9yIHNpbXBsZSByZXN0YXJ0IHRoZSByYXNwYmVycnkgUEkuXG4gICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L29sPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGApO1xuICB9XG59XG5cbmV4cG9ydCB7IEhvd1RvQnVpbGRBRGlzcGxheVBhZ2UgYXMgZGVmYXVsdCB9XG4iLCJpbXBvcnQgTWFjcm9NYW5hZ2VyIGZyb20gJy4uL21hbmFnZXJzL21hY3JvLW1hbmFnZXInO1xuaW1wb3J0IFBhZ2UgZnJvbSAnLi9wYWdlJztcblxudmFyIG1hY3JvTWFuYWdlciA9IG5ldyBNYWNyb01hbmFnZXIoKTtcblxuY2xhc3MgSW5zdGFsbE1hY3Jvc1BhZ2UgZXh0ZW5kcyBQYWdlIHtcbiAgcmVuZGVyKCkge1xuICAgIHRoaXMuJGVsLmh0bWwoYFxuICAgICAgPGgxPk1hY3JvczwvaDE+XG4gICAgICA8aHIgLz5cbiAgICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXItZmx1aWRcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInJvdyBsaXN0LWdyb3VwXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgKTtcblxuICAgIHZhciBhdmFpbGFibGVNYWNyb3MgPSBtYWNyb01hbmFnZXIuZ2V0QXZhaWxhYmxlTWFjcm9zKCk7XG5cbiAgICBmb3IobGV0IGtleSBpbiBhdmFpbGFibGVNYWNyb3MpIHtcbiAgICAgIHZhciBtYWNybyA9IGF2YWlsYWJsZU1hY3Jvc1trZXldO1xuICAgICAgdGhpcy4kZWwuZmluZCgnLmxpc3QtZ3JvdXAnKS5hcHBlbmQoYFxuICAgICAgICA8ZGl2IGNsYXNzPVwibGlzdC1ncm91cC1pdGVtIGxpc3QtZ3JvdXAtaXRlbS1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiI1wiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzIHB1bGwtcmlnaHQgaW5zdGFsbC1tYWNyb1wiIGRhdGEtbWFjcm89XCIke2tleX1cIj5JbnN0YWxsPC9hPlxuICAgICAgICAgIDxoNSBjbGFzcz1cImxpc3QtZ3JvdXAtaXRlbS1oZWFkaW5nXCI+JHttYWNyby5uYW1lfTwvaDU+XG4gICAgICAgICAgPHAgY2xhc3M9XCJsaXN0LWdyb3VwLWl0ZW0tdGV4dFwiPiR7bWFjcm8uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIGApO1xuICAgIH1cblxuICAgIHRoaXMuJGVsLmZpbmQoJy5pbnN0YWxsLW1hY3JvJykuY2xpY2soZnVuY3Rpb24oZXYpIHtcbiAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHZhciAkZWwgPSAkKHRoaXMpLFxuICAgICAgICAgIGtleSA9ICRlbC5kYXRhKCdtYWNybycpLFxuICAgICAgICAgIGNvbmZpZyA9IGF2YWlsYWJsZU1hY3Jvc1trZXldO1xuXG4gICAgICBtYWNyb01hbmFnZXIuaW5zdGFsbChrZXksIGNvbmZpZywgZnVuY3Rpb24oKSB7XG4gICAgICAgICRlbC5oaWRlKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIG1hY3JvTWFuYWdlci5nZXRJbnN0YWxsZWRNYWNyb3MoKG1hY3JvcykgPT4ge1xuICAgICAgZm9yKGxldCBrZXkgaW4gbWFjcm9zKSB7XG4gICAgICAgIHRoaXMuJGVsLmZpbmQoYC5pbnN0YWxsLW1hY3JvW2RhdGEtbWFjcm89JHtrZXl9XWApLmhpZGUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgeyBJbnN0YWxsTWFjcm9zUGFnZSBhcyBkZWZhdWx0IH1cbiIsImNsYXNzIFBhZ2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLiRlbCA9ICQoJyNwYWdlJyk7XG4gIH1cblxuICAkKHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoc2VsZWN0b3IpO1xuICB9XG59XG5cbmV4cG9ydCB7IFBhZ2UgYXMgZGVmYXVsdCB9XG4iXX0=
