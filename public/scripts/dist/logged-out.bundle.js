(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"../lib/resource":2,"display-coupler":4}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
"use strict";

var _display = require("./components/display");

var _display2 = _interopRequireDefault(_display);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

firebase.initializeApp({
  apiKey: "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
  authDomain: "led-fiesta.firebaseapp.com",
  databaseURL: "https://led-fiesta.firebaseio.com",
  storageBucket: "led-fiesta.appspot.com"
});

var display = new _display2.default($('#display'), '-KQBqz3I3aSMgWvPQKxz');

display.demo('twinkle', { seedColor: '#FFFFFF' }, $('.demo').width(), { width: 128, height: 32 }, function () {
  // Something...
});

},{"./components/display":1}],4:[function(require,module,exports){
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

},{"macro-library":5}],5:[function(require,module,exports){
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

},{"./macro-config":6,"./macros/programmable":8,"./macros/solid-color":9,"./macros/start-up":10,"./macros/text":11,"./macros/twinkle":12,"./macros/unsupported":13}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{"./macro":7}],9:[function(require,module,exports){
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

},{"./macro":7}],10:[function(require,module,exports){
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

},{"./macro":7}],11:[function(require,module,exports){
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

},{"./macro":7,"typewriter":16}],12:[function(require,module,exports){
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

},{"./macro":7}],13:[function(require,module,exports){
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

},{"./macro":7,"typewriter":16}],14:[function(require,module,exports){
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
          "y": 8,
          "x": 5,
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
        },
        {
          "y": 7,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 6,
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
          "y": 5,
          "x": 0,
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
          "x": 4,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 3,
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

},{}],15:[function(require,module,exports){
module.exports={
  "height": 6,
  "width": 5,
  "characters": {
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
    " ": {
      "coordinates": []
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

},{}],16:[function(require,module,exports){
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

},{"./fonts/system-medium":14,"./fonts/system-micro":15}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc2NyaXB0cy9jb21wb25lbnRzL2Rpc3BsYXkuanMiLCJwdWJsaWMvc2NyaXB0cy9saWIvcmVzb3VyY2UuanMiLCJwdWJsaWMvc2NyaXB0cy9sb2dnZWQtb3V0LmpzIiwiLi4vZGlzcGxheS1jb3VwbGVyL2luZGV4LmpzIiwiLi4vbWFjcm8tbGlicmFyeS9pbmRleC5qcyIsIi4uL21hY3JvLWxpYnJhcnkvbWFjcm8tY29uZmlnLmpzb24iLCIuLi9tYWNyby1saWJyYXJ5L21hY3Jvcy9tYWNyby5qcyIsIi4uL21hY3JvLWxpYnJhcnkvbWFjcm9zL3Byb2dyYW1tYWJsZS5qcyIsIi4uL21hY3JvLWxpYnJhcnkvbWFjcm9zL3NvbGlkLWNvbG9yLmpzIiwiLi4vbWFjcm8tbGlicmFyeS9tYWNyb3Mvc3RhcnQtdXAuanMiLCIuLi9tYWNyby1saWJyYXJ5L21hY3Jvcy90ZXh0LmpzIiwiLi4vbWFjcm8tbGlicmFyeS9tYWNyb3MvdHdpbmtsZS5qcyIsIi4uL21hY3JvLWxpYnJhcnkvbWFjcm9zL3Vuc3VwcG9ydGVkLmpzIiwiLi4vdHlwZXdyaXRlci9mb250cy9zeXN0ZW0tbWVkaXVtLmpzb24iLCIuLi90eXBld3JpdGVyL2ZvbnRzL3N5c3RlbS1taWNyby5qc29uIiwiLi4vdHlwZXdyaXRlci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7OztBQ0FBOzs7O0FBQ0E7Ozs7Ozs7O0lBRU0sTztBQUNKLG1CQUFZLEdBQVosRUFBaUIsVUFBakIsRUFBNkI7QUFBQTs7QUFDM0IsU0FBSyxHQUFMLEdBQVcsR0FBWDtBQUNBLFNBQUssVUFBTCxHQUFrQixVQUFsQjtBQUNEOzs7O3lCQUVJLEssRUFBTyxVLEVBQVksUSxFQUFVO0FBQUE7O0FBQ2hDLFdBQUssTUFBTCxDQUFZLEtBQVosRUFBbUIsVUFBbkI7O0FBRUEsVUFBSSxpQkFBaUIsNkJBQW1CLFNBQVMsUUFBVCxFQUFuQixDQUFyQjtBQUNBLHFCQUFlLE9BQWYsQ0FBdUIsS0FBSyxVQUE1QixFQUF3QztBQUN0QyxpQkFBUyxpQkFBUyxXQUFULEVBQXNCLElBQXRCLEVBQTRCO0FBQ25DO0FBQ0QsU0FIcUM7QUFJdEMsdUJBQWUsdUJBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxHQUFQLEVBQVksV0FBWixFQUE0QjtBQUN6Qyx3QkFBYyxlQUFlLEVBQTdCO0FBQ0EsZ0JBQUsseUJBQUwsQ0FBK0IsQ0FBL0IsRUFBa0MsQ0FBbEMsRUFBcUMsR0FBckMsRUFBMEMsV0FBMUM7QUFDRDtBQVBxQyxPQUF4QztBQVNBO0FBQ0Q7Ozt5QkFFSSxLLEVBQU8sVyxFQUFhLEssRUFBTyxVLEVBQVksUSxFQUFVO0FBQUE7O0FBQ3BELFVBQUksZ0JBQWdCO0FBQ2xCLGVBQU8sS0FEVztBQUVsQixxQkFBYSxXQUZLO0FBR2xCLGVBQU8sV0FBVyxLQUhBO0FBSWxCLGdCQUFRLFdBQVc7QUFKRCxPQUFwQjs7QUFPQSxXQUFLLE1BQUwsQ0FBWSxLQUFaLEVBQW1CLFVBQW5COztBQUVBLFVBQUksaUJBQWlCLDhCQUFyQjtBQUNBLHFCQUFlLElBQWYsQ0FBb0IsYUFBcEIsRUFBbUM7QUFDakMsaUJBQVMsaUJBQVMsV0FBVCxFQUFzQixJQUF0QixFQUE0QjtBQUNuQztBQUNELFNBSGdDO0FBSWpDLHVCQUFlLHVCQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sR0FBUCxFQUFZLFdBQVosRUFBNEI7QUFDekMsd0JBQWMsZUFBZSxFQUE3QjtBQUNBLGlCQUFLLHlCQUFMLENBQStCLENBQS9CLEVBQWtDLENBQWxDLEVBQXFDLEdBQXJDLEVBQTBDLFdBQTFDO0FBQ0Q7QUFQZ0MsT0FBbkM7QUFTQTtBQUNEOzs7MkJBRU0sSyxFQUFPLFUsRUFBWTtBQUN4QixXQUFLLEdBQUwsQ0FBUyxJQUFUOztBQVFBLFVBQUkscUJBQXFCLENBQUMsS0FBTSxNQUFNLENBQWIsSUFBbUIsR0FBNUM7QUFBQSxVQUNJLE9BQU8sQ0FBQyxRQUFRLEVBQVQsSUFBZSxXQUFXLEtBRHJDOztBQUdBLFdBQUksSUFBSSxJQUFJLENBQVosRUFBZSxJQUFJLFdBQVcsTUFBOUIsRUFBc0MsR0FBdEMsRUFBMkM7QUFDekMsWUFBSSxPQUFPLCtDQUE2QyxrQkFBN0Msa0JBQTRFLElBQTVFLHlCQUFvRyxJQUFwRyxXQUFYO0FBQ0EsYUFBSSxJQUFJLElBQUksQ0FBWixFQUFlLElBQUksV0FBVyxLQUE5QixFQUFxQyxHQUFyQyxFQUEwQztBQUN4QyxlQUFLLE1BQUwsaUVBQ21ELElBRG5ELG9CQUNzRSxJQUR0RSwyREFFc0MsQ0FGdEMsa0JBRW9ELENBRnBELDRCQUU0RSxDQUY1RSxTQUVpRixDQUZqRjtBQUtEO0FBQ0QsYUFBSyxHQUFMLENBQVMsSUFBVCxDQUFjLFFBQWQsRUFBd0IsTUFBeEIsQ0FBK0IsSUFBL0I7QUFDRDtBQUNGOzs7OENBRXlCLEMsRUFBRyxDLEVBQUcsRyxFQUFLLFcsRUFBYTtBQUNoRCxVQUFJLEtBQUssU0FBUyxnQkFBVCwwQkFBZ0QsQ0FBaEQsU0FBcUQsQ0FBckQsU0FBVDtBQUNBLFVBQUcsR0FBRyxNQUFILEdBQVksQ0FBZixFQUFrQjtBQUNoQixXQUFHLENBQUgsRUFBTSxLQUFOLENBQVksVUFBWixHQUEwQixRQUFRLFNBQVIsWUFBNkIsR0FBdkQ7QUFDRDtBQUNGOzs7Ozs7QUFHSCxTQUFTLFFBQVQsQ0FBa0IsS0FBbEIsRUFBeUIsT0FBekIsRUFBa0M7QUFDOUIsTUFBSSxJQUFFLFNBQVMsTUFBTSxLQUFOLENBQVksQ0FBWixDQUFULEVBQXdCLEVBQXhCLENBQU47QUFBQSxNQUFrQyxJQUFFLFVBQVEsQ0FBUixHQUFVLENBQVYsR0FBWSxHQUFoRDtBQUFBLE1BQW9ELElBQUUsVUFBUSxDQUFSLEdBQVUsVUFBUSxDQUFDLENBQW5CLEdBQXFCLE9BQTNFO0FBQUEsTUFBbUYsSUFBRSxLQUFHLEVBQXhGO0FBQUEsTUFBMkYsSUFBRSxLQUFHLENBQUgsR0FBSyxNQUFsRztBQUFBLE1BQXlHLElBQUUsSUFBRSxRQUE3RztBQUNBLFNBQU8sTUFBSSxDQUFDLFlBQVUsQ0FBQyxLQUFLLEtBQUwsQ0FBVyxDQUFDLElBQUUsQ0FBSCxJQUFNLENBQWpCLElBQW9CLENBQXJCLElBQXdCLE9BQWxDLEdBQTBDLENBQUMsS0FBSyxLQUFMLENBQVcsQ0FBQyxJQUFFLENBQUgsSUFBTSxDQUFqQixJQUFvQixDQUFyQixJQUF3QixLQUFsRSxJQUF5RSxLQUFLLEtBQUwsQ0FBVyxDQUFDLElBQUUsQ0FBSCxJQUFNLENBQWpCLElBQW9CLENBQTdGLENBQUQsRUFBa0csUUFBbEcsQ0FBMkcsRUFBM0csRUFBK0csS0FBL0csQ0FBcUgsQ0FBckgsQ0FBWDtBQUNIOztRQUVtQixPLEdBQVgsTzs7Ozs7Ozs7Ozs7OztJQ3RGSCxROzs7Ozs7OzJCQUNHLEUsRUFBSTtBQUNULGFBQU8sU0FBUyxRQUFULEdBQW9CLEdBQXBCLGVBQW9DLEVBQXBDLENBQVA7QUFDRDs7O2dDQUVXLEUsRUFBSSxDLEVBQUcsQyxFQUFHO0FBQ3BCLGFBQU8sU0FBUyxRQUFULEdBQW9CLEdBQXBCLGVBQW9DLEVBQXBDLFNBQTBDLENBQTFDLFNBQStDLENBQS9DLENBQVA7QUFDRDs7OytCQUVVO0FBQ1QsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsQ0FBd0IsVUFBeEIsQ0FBUDtBQUNEOzs7NEJBRU8sRSxFQUFJO0FBQ1YsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsZUFBb0MsRUFBcEMsQ0FBUDtBQUNEOzs7NkNBRXdCLEUsRUFBSTtBQUMzQixhQUFPLFNBQVMsUUFBVCxHQUFvQixHQUFwQixlQUFvQyxFQUFwQyx3QkFBUDtBQUNEOzs7dUNBRWtCLEUsRUFBSSxJLEVBQU07QUFDM0IsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsZUFBb0MsRUFBcEMsZ0JBQWlELElBQWpELENBQVA7QUFDRDs7O2tDQUVhLEUsRUFBSTtBQUNoQixhQUFPLFNBQVMsUUFBVCxHQUFvQixHQUFwQixlQUFvQyxFQUFwQyxhQUFQO0FBQ0Q7Ozs2QkFFUTtBQUNQLGFBQU8sU0FBUyxRQUFULEdBQW9CLEdBQXBCLENBQXdCLFFBQXhCLENBQVA7QUFDRDs7O2dDQUVXO0FBQ1YsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsQ0FBd0IsVUFBeEIsQ0FBUDtBQUNEOzs7NkJBRVEsRSxFQUFJO0FBQ1gsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsZUFBb0MsRUFBcEMsQ0FBUDtBQUNEOzs7aUNBRVksRSxFQUFJO0FBQ2YsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsbUJBQXdDLEVBQXhDLGVBQVA7QUFDRDs7O2lDQUNZLEUsRUFBSTtBQUNmLGFBQU8sU0FBUyxRQUFULEdBQW9CLEdBQXBCLG9CQUF5QyxFQUF6QyxlQUFQO0FBQ0Q7Ozs7OztRQUdrQixPLEdBQVosUTs7Ozs7QUNqRFQ7Ozs7OztBQUVBLFNBQVMsYUFBVCxDQUF1QjtBQUNyQixVQUFRLHlDQURhO0FBRXJCLGNBQVksNEJBRlM7QUFHckIsZUFBYSxtQ0FIUTtBQUlyQixpQkFBZTtBQUpNLENBQXZCOztBQVFBLElBQUksVUFBVSxzQkFBWSxFQUFFLFVBQUYsQ0FBWixFQUEyQixzQkFBM0IsQ0FBZDs7QUFFQSxRQUFRLElBQVIsQ0FBYSxTQUFiLEVBQXdCLEVBQUMsV0FBVyxTQUFaLEVBQXhCLEVBQWdELEVBQUUsT0FBRixFQUFXLEtBQVgsRUFBaEQsRUFBb0UsRUFBRSxPQUFPLEdBQVQsRUFBYyxRQUFRLEVBQXRCLEVBQXBFLEVBQWdHLFlBQU07QUFDcEc7QUFDRCxDQUZEOzs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOXRDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBSZXNvdXJjZSBmcm9tICcuLi9saWIvcmVzb3VyY2UnO1xuaW1wb3J0IERpc3BsYXlDb3VwbGVyIGZyb20gJ2Rpc3BsYXktY291cGxlcic7XG5cbmNsYXNzIERpc3BsYXkge1xuICBjb25zdHJ1Y3RvcigkZWwsIGRpc3BsYXlLZXkpIHtcbiAgICB0aGlzLiRlbCA9ICRlbDtcbiAgICB0aGlzLmRpc3BsYXlLZXkgPSBkaXNwbGF5S2V5O1xuICB9XG5cbiAgbG9hZCh3aWR0aCwgZGltZW5zaW9ucywgY2FsbGJhY2spIHtcbiAgICB0aGlzLnJlbmRlcih3aWR0aCwgZGltZW5zaW9ucyk7XG5cbiAgICB2YXIgZGlzcGxheUNvdXBsZXIgPSBuZXcgRGlzcGxheUNvdXBsZXIoZmlyZWJhc2UuZGF0YWJhc2UoKSk7XG4gICAgZGlzcGxheUNvdXBsZXIuY29ubmVjdCh0aGlzLmRpc3BsYXlLZXksIHtcbiAgICAgIG9uUmVhZHk6IGZ1bmN0aW9uKGRpc3BsYXlEYXRhLCBuZXh0KSB7XG4gICAgICAgIG5leHQoKVxuICAgICAgfSxcbiAgICAgIG9uUGl4ZWxDaGFuZ2U6ICh5LCB4LCBoZXgsIGRpc3BsYXlEYXRhKSA9PiB7XG4gICAgICAgIGRpc3BsYXlEYXRhID0gZGlzcGxheURhdGEgfHwge307XG4gICAgICAgIHRoaXMucmVmcmVzaFBpeGVsQnlDb29yZGluYXRlcyh5LCB4LCBoZXgsIGRpc3BsYXlEYXRhKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjYWxsYmFjaygpO1xuICB9XG5cbiAgZGVtbyhtYWNybywgbWFjcm9Db25maWcsIHdpZHRoLCBkaW1lbnNpb25zLCBjYWxsYmFjaykge1xuICAgIHZhciBkaXNwbGF5Q29uZmlnID0ge1xuICAgICAgbWFjcm86IG1hY3JvLFxuICAgICAgbWFjcm9Db25maWc6IG1hY3JvQ29uZmlnLFxuICAgICAgd2lkdGg6IGRpbWVuc2lvbnMud2lkdGgsXG4gICAgICBoZWlnaHQ6IGRpbWVuc2lvbnMuaGVpZ2h0XG4gICAgfTtcblxuICAgIHRoaXMucmVuZGVyKHdpZHRoLCBkaW1lbnNpb25zKTtcblxuICAgIHZhciBkaXNwbGF5Q291cGxlciA9IG5ldyBEaXNwbGF5Q291cGxlcigpO1xuICAgIGRpc3BsYXlDb3VwbGVyLmRlbW8oZGlzcGxheUNvbmZpZywge1xuICAgICAgb25SZWFkeTogZnVuY3Rpb24oZGlzcGxheURhdGEsIG5leHQpIHtcbiAgICAgICAgbmV4dCgpXG4gICAgICB9LFxuICAgICAgb25QaXhlbENoYW5nZTogKHksIHgsIGhleCwgZGlzcGxheURhdGEpID0+IHtcbiAgICAgICAgZGlzcGxheURhdGEgPSBkaXNwbGF5RGF0YSB8fCB7fTtcbiAgICAgICAgdGhpcy5yZWZyZXNoUGl4ZWxCeUNvb3JkaW5hdGVzKHksIHgsIGhleCwgZGlzcGxheURhdGEpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cblxuICByZW5kZXIod2lkdGgsIGRpbWVuc2lvbnMpIHtcbiAgICB0aGlzLiRlbC5odG1sKGBcbiAgICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0b3BcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInJpZ2h0XCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmcm9udFwiPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYCk7XG5cbiAgICB2YXIgYWRqdXN0ZWRCcmlnaHRuZXNzID0gKDUwICsgKDEwMCAvIDIpKSAvIDEwMCxcbiAgICAgICAgc2l6ZSA9ICh3aWR0aCAtIDIwKSAvIGRpbWVuc2lvbnMud2lkdGg7XG5cbiAgICBmb3IodmFyIHkgPSAwOyB5IDwgZGltZW5zaW9ucy5oZWlnaHQ7IHkrKykge1xuICAgICAgdmFyICRyb3cgPSAkKGA8ZGl2IGNsYXNzPVwibWF0cml4LXJvd1wiIHN0eWxlPVwib3BhY2l0eTogJHthZGp1c3RlZEJyaWdodG5lc3N9OyBoZWlnaHQ6ICR7c2l6ZX1weDsgbGluZS1oZWlnaHQ6ICR7c2l6ZX1weDtcIj5gKTtcbiAgICAgIGZvcih2YXIgeCA9IDA7IHggPCBkaW1lbnNpb25zLndpZHRoOyB4KyspIHtcbiAgICAgICAgJHJvdy5hcHBlbmQoYFxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWF0cml4LWRvdC13cmFwcGVyXCIgc3R5bGU9XCJ3aWR0aDogJHtzaXplfXB4OyBoZWlnaHQ6ICR7c2l6ZX1weDtcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYXRyaXgtZG90XCIgZGF0YS15PVwiJHt5fVwiIGRhdGEteD1cIiR7eH1cIiBkYXRhLWNvb3JkaW5hdGVzPVwiJHt5fToke3h9XCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAjNDQ0XCI+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICBgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuJGVsLmZpbmQoJy5mcm9udCcpLmFwcGVuZCgkcm93KTtcbiAgICB9XG4gIH1cblxuICByZWZyZXNoUGl4ZWxCeUNvb3JkaW5hdGVzKHksIHgsIGhleCwgZGlzcGxheURhdGEpIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBbZGF0YS1jb29yZGluYXRlcz0nJHt5fToke3h9J11gKTtcbiAgICBpZihlbC5sZW5ndGggPiAwKSB7XG4gICAgICBlbFswXS5zdHlsZS5iYWNrZ3JvdW5kID0gKGhleCA9PT0gJyMwMDAwMDAnID8gYCM0NDRgIDogaGV4KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2hhZGVIZXgoY29sb3IsIHBlcmNlbnQpIHtcbiAgICB2YXIgZj1wYXJzZUludChjb2xvci5zbGljZSgxKSwxNiksdD1wZXJjZW50PDA/MDoyNTUscD1wZXJjZW50PDA/cGVyY2VudCotMTpwZXJjZW50LFI9Zj4+MTYsRz1mPj44JjB4MDBGRixCPWYmMHgwMDAwRkY7XG4gICAgcmV0dXJuIFwiI1wiKygweDEwMDAwMDArKE1hdGgucm91bmQoKHQtUikqcCkrUikqMHgxMDAwMCsoTWF0aC5yb3VuZCgodC1HKSpwKStHKSoweDEwMCsoTWF0aC5yb3VuZCgodC1CKSpwKStCKSkudG9TdHJpbmcoMTYpLnNsaWNlKDEpO1xufVxuXG5leHBvcnQgeyBEaXNwbGF5IGFzIGRlZmF1bHQgfVxuIiwiY2xhc3MgUmVzb3VyY2Uge1xuICBtYXRyaXgoaWQpIHtcbiAgICByZXR1cm4gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoYG1hdHJpY2VzLyR7aWR9YCk7XG4gIH1cblxuICBtYXRyaXhQaXhlbChpZCwgeSwgeCkge1xuICAgIHJldHVybiBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZihgbWF0cmljZXMvJHtpZH0vJHt5fToke3h9YCk7XG4gIH1cblxuICBkaXNwbGF5cygpIHtcbiAgICByZXR1cm4gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoJ2Rpc3BsYXlzJyk7XG4gIH1cblxuICBkaXNwbGF5KGlkKSB7XG4gICAgcmV0dXJuIGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKGBkaXNwbGF5cy8ke2lkfWApO1xuICB9XG5cbiAgZGlzcGxheUNvbm5lY3RlZEhhcmR3YXJlKGlkKSB7XG4gICAgcmV0dXJuIGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKGBkaXNwbGF5cy8ke2lkfS9jb25uZWN0ZWRIYXJkd2FyZWApO1xuICB9XG5cbiAgZGlzcGxheU1hY3JvQ29uZmlnKGlkLCBtb2RlKSB7XG4gICAgcmV0dXJuIGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKGBkaXNwbGF5cy8ke2lkfS9tYWNyb3MvJHttb2RlfWApO1xuICB9XG5cbiAgZGlzcGxheU93bmVycyhpZCkge1xuICAgIHJldHVybiBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZihgZGlzcGxheXMvJHtpZH0vb3duZXJzYCk7XG4gIH1cblxuICBtYWNyb3MoKSB7XG4gICAgcmV0dXJuIGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCdtYWNyb3MnKTtcbiAgfVxuXG4gIGhhcmR3YXJlcygpIHtcbiAgICByZXR1cm4gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoJ2hhcmR3YXJlJyk7XG4gIH1cblxuICBoYXJkd2FyZShpZCkge1xuICAgIHJldHVybiBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZihgaGFyZHdhcmUvJHtpZH1gKTtcbiAgfVxuXG4gIHVzZXJJZGVudGl0eShpZCkge1xuICAgIHJldHVybiBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZihgdXNlcnMvcHVibGljLyR7aWR9L2lkZW50aXR5YCk7XG4gIH1cbiAgdXNlckRpc3BsYXlzKGlkKSB7XG4gICAgcmV0dXJuIGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKGB1c2Vycy9wcml2YXRlLyR7aWR9L2Rpc3BsYXlzYCk7XG4gIH1cbn1cblxuZXhwb3J0IHsgUmVzb3VyY2UgYXMgZGVmYXVsdCB9XG4iLCJpbXBvcnQgRGlzcGxheSBmcm9tICcuL2NvbXBvbmVudHMvZGlzcGxheSc7XG5cbmZpcmViYXNlLmluaXRpYWxpemVBcHAoe1xuICBhcGlLZXk6IFwiQUl6YVN5QU5vYjREYkNCdnBVVTFQSmpxNnA3N3FwVHdzTXJjSmZJXCIsXG4gIGF1dGhEb21haW46IFwibGVkLWZpZXN0YS5maXJlYmFzZWFwcC5jb21cIixcbiAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly9sZWQtZmllc3RhLmZpcmViYXNlaW8uY29tXCIsXG4gIHN0b3JhZ2VCdWNrZXQ6IFwibGVkLWZpZXN0YS5hcHBzcG90LmNvbVwiXG59KTtcblxuXG52YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCQoJyNkaXNwbGF5JyksICctS1FCcXozSTNhU01nV3ZQUUt4eicpO1xuXG5kaXNwbGF5LmRlbW8oJ3R3aW5rbGUnLCB7c2VlZENvbG9yOiAnI0ZGRkZGRid9LCAkKCcuZGVtbycpLndpZHRoKCksIHsgd2lkdGg6IDEyOCwgaGVpZ2h0OiAzMiB9LCAoKSA9PiB7XG4gIC8vIFNvbWV0aGluZy4uLlxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIE1hY3JvTGlicmFyeSA9IHJlcXVpcmUoJ21hY3JvLWxpYnJhcnknKTtcblxudmFyIG1hY3JvTGlicmFyeSA9IG5ldyBNYWNyb0xpYnJhcnkoKTtcbm1hY3JvTGlicmFyeS5yZWdpc3Rlck1hY3JvcygpO1xuXG5jbGFzcyBEaXNwbGF5Q291cGxlciB7XG4gIGNvbnN0cnVjdG9yKGRiKSB7XG4gICAgdGhpcy5kYiA9IGRiO1xuICAgIHRoaXMuc3RhcnRpbmdVcCA9IHRydWU7XG4gIH1cblxuICBzdGF0aWMgcmVnaXN0ZXJlZE1hY3JvcygpIHtcbiAgICByZXR1cm4gbWFjcm9MaWJyYXJ5LnJlZ2lzdGVyZWRNYWNyb3MoKTtcbiAgfVxuXG4gIHN0YXJ0VXAoe2RpbWVuc2lvbnMsIGNhbGxiYWNrc30pIHtcbiAgICB0aGlzLmFjdGl2YXRlTWFjcm8gPSBtYWNyb0xpYnJhcnkubG9hZE1hY3JvKCdzdGFydC11cCcsIHtcbiAgICAgIGRpbWVuc2lvbnM6IGRpbWVuc2lvbnMsXG4gICAgICBjYWxsYmFja3M6IGNhbGxiYWNrc1xuICAgIH0pO1xuICAgIHRoaXMuYWN0aXZhdGVNYWNyby5zdGFydCgpO1xuICB9XG5cbiAgZGVtbyhkaXNwbGF5Q29uZmlnLCBjYWxsYmFja3MpIHtcbiAgICB2YXIgbmV4dCA9ICgpID0+IHtcbiAgICAgIHZhciBtYWNybyA9IGRpc3BsYXlDb25maWcubWFjcm8sXG4gICAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGNvbmZpZzogZGlzcGxheUNvbmZpZy5tYWNyb0NvbmZpZyB8fCB7fSxcbiAgICAgICAgICAgIGRpbWVuc2lvbnM6IHtcbiAgICAgICAgICAgICAgd2lkdGg6IGRpc3BsYXlDb25maWcud2lkdGgsXG4gICAgICAgICAgICAgIGhlaWdodDogZGlzcGxheUNvbmZpZy5oZWlnaHRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjYWxsYmFja3M6IHtcbiAgICAgICAgICAgICAgb25QaXhlbENoYW5nZTogKHksIHgsIGhleCkgPT4ge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5vblBpeGVsQ2hhbmdlKHksIHgsIGhleCwgZGlzcGxheUNvbmZpZyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuXG4gICAgICBpZih0aGlzLmFjdGl2YXRlTWFjcm8pIHtcbiAgICAgICAgdGhpcy5hY3RpdmF0ZU1hY3JvLnN0b3AoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYWN0aXZhdGVNYWNybyA9IG1hY3JvTGlicmFyeS5sb2FkTWFjcm8obWFjcm8sIG9wdGlvbnMpO1xuICAgICAgdGhpcy5hY3RpdmF0ZU1hY3JvLnN0YXJ0KCk7XG4gICAgfTtcblxuICAgIGlmKHRoaXMuc3RhcnRpbmdVcCkge1xuICAgICAgY2FsbGJhY2tzLm9uUmVhZHkoZGlzcGxheUNvbmZpZywgKCkgPT4ge1xuICAgICAgICB0aGlzLnN0YXJ0aW5nVXAgPSBmYWxzZTtcbiAgICAgICAgbmV4dCgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHQoKVxuICAgIH1cbiAgfVxuXG4gIGNvbm5lY3QoZGlzcGxheUtleSwgY2FsbGJhY2tzKSB7XG4gICAgdGhpcy5kYi5yZWYoYGRpc3BsYXlzLyR7ZGlzcGxheUtleX0vYCkub24oJ3ZhbHVlJywgKHNuYXBzaG90KSA9PiB7XG4gICAgICB2YXIgZGlzcGxheURhdGEgPSBzbmFwc2hvdC52YWwoKTtcblxuICAgICAgdmFyIG5leHQgPSAoKSA9PiB7XG4gICAgICAgIHZhciBtYWNybyA9IGRpc3BsYXlEYXRhLm1hY3JvLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgY29uZmlnOiBkaXNwbGF5RGF0YS5tYWNyb0NvbmZpZyB8fCB7fSxcbiAgICAgICAgICAgICAgZGltZW5zaW9uczoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiBkaXNwbGF5RGF0YS53aWR0aCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGRpc3BsYXlEYXRhLmhlaWdodFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBkYjogdGhpcy5kYixcbiAgICAgICAgICAgICAgY2FsbGJhY2tzOiB7XG4gICAgICAgICAgICAgICAgb25QaXhlbENoYW5nZTogKHksIHgsIGhleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgY2FsbGJhY2tzLm9uUGl4ZWxDaGFuZ2UoeSwgeCwgaGV4LCBkaXNwbGF5RGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGlmKG1hY3JvID09PSBcInByb2dyYW1tYWJsZVwiKSB7XG4gICAgICAgICAgb3B0aW9ucy5jb25maWcubWF0cml4ID0gZGlzcGxheURhdGEubWF0cml4O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5hY3RpdmF0ZU1hY3JvKSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmF0ZU1hY3JvLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFjdGl2YXRlTWFjcm8gPSBtYWNyb0xpYnJhcnkubG9hZE1hY3JvKG1hY3JvLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5hY3RpdmF0ZU1hY3JvLnN0YXJ0KCk7XG4gICAgICB9O1xuXG4gICAgICBpZih0aGlzLnN0YXJ0aW5nVXApIHtcbiAgICAgICAgY2FsbGJhY2tzLm9uUmVhZHkoZGlzcGxheURhdGEsICgpID0+IHtcbiAgICAgICAgICB0aGlzLnN0YXJ0aW5nVXAgPSBmYWxzZTtcbiAgICAgICAgICBuZXh0KCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV4dCgpXG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaXNwbGF5Q291cGxlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgUHJvZ3JhbW1hYmxlTWFjcm8gPSByZXF1aXJlKCcuL21hY3Jvcy9wcm9ncmFtbWFibGUnKSxcbiAgICBUd2lua2xlTWFjcm8gPSByZXF1aXJlKCcuL21hY3Jvcy90d2lua2xlJyksXG4gICAgU3RhcnRVcE1hY3JvID0gcmVxdWlyZSgnLi9tYWNyb3Mvc3RhcnQtdXAnKSxcbiAgICBTb2xpZENvbG9yTWFjcm8gPSByZXF1aXJlKCcuL21hY3Jvcy9zb2xpZC1jb2xvcicpLFxuICAgIFVuc3VwcG9ydGVkTWFjcm8gPSByZXF1aXJlKCcuL21hY3Jvcy91bnN1cHBvcnRlZCcpLFxuICAgIFRleHRNYWNybyA9IHJlcXVpcmUoJy4vbWFjcm9zL3RleHQnKTtcblxudmFyIE1hY3JvQ29uZmlnID0gcmVxdWlyZSgnLi9tYWNyby1jb25maWcnKTtcblxuY2xhc3MgTWFjcm9MaWJyYXJ5IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5NYWNyb3MgPSB7fTtcbiAgfVxuXG4gIHJlZ2lzdGVyTWFjcm9zKCkge1xuICAgIHRoaXMuTWFjcm9zW1Byb2dyYW1tYWJsZU1hY3JvLmlkZW50aWZpZXJdID0gUHJvZ3JhbW1hYmxlTWFjcm87XG4gICAgdGhpcy5NYWNyb3NbVHdpbmtsZU1hY3JvLmlkZW50aWZpZXJdID0gVHdpbmtsZU1hY3JvO1xuICAgIHRoaXMuTWFjcm9zW1N0YXJ0VXBNYWNyby5pZGVudGlmaWVyXSA9IFN0YXJ0VXBNYWNybztcbiAgICB0aGlzLk1hY3Jvc1tTb2xpZENvbG9yTWFjcm8uaWRlbnRpZmllcl0gPSBTb2xpZENvbG9yTWFjcm87XG4gICAgdGhpcy5NYWNyb3NbVGV4dE1hY3JvLmlkZW50aWZpZXJdID0gVGV4dE1hY3JvO1xuICB9XG5cbiAgYXZhaWxhYmxlTWFjcm9zKCkge1xuICAgIHJldHVybiBNYWNyb0NvbmZpZztcbiAgfVxuXG4gIGxvYWRNYWNybyhuYW1lLCBvcHRpb25zKSB7XG4gICAgdmFyIE1hY3JvID0gdGhpcy5NYWNyb3NbbmFtZV0gfHwgVW5zdXBwb3J0ZWRNYWNybztcbiAgICByZXR1cm4gbmV3IE1hY3JvKG9wdGlvbnMpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFjcm9MaWJyYXJ5O1xuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcInR3aW5rbGVcIjoge1xuICAgIFwibmFtZVwiOiBcIlR3aW5rbGVcIixcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiQ2hvb3NlIGEgY29sb3IgYW5kIHJhbmRvbWx5IHRvZ2dsZSB0aGUgYnJpZ2h0bmVzcyBvZiBlYWNoIExFRCBvbiB0aGUgYm9hcmQuXCJcbiAgfSxcbiAgXCJwcm9ncmFtbWFibGVcIjoge1xuICAgIFwibmFtZVwiOiBcIlByb2dyYW1tYWJsZVwiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJVcGRhdGUgZWFjaCBMRUQgdmlhIGEgcmVzdGZ1bCBpbnRlcmZhY2UgcHJvZ3JhbW1hdGljYWxseS5cIlxuICB9LFxuICBcInNvbGlkLWNvbG9yXCI6IHtcbiAgICBcIm5hbWVcIjogXCJTb2xpZCBDb2xvclwiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJGaWxsIHRoZSBib2FyZCB3aXRoIG9uZSBzb2xpZCBjb2xvci5cIlxuICB9LFxuICBcInN0YXJ0LXVwXCI6IHtcbiAgICBcIm5hbWVcIjogXCJTdGFydCB1cFwiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJUaGUgc3RhcnRpbmcgdXAgYW5pbWF0aW9uXCJcbiAgfSxcbiAgXCJ0ZXh0XCI6IHtcbiAgICBcIm5hbWVcIjogXCJUZXh0XCIsXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIkRpc3BsYXkgYW55IHRleHQgd2l0aCBhIHNwZWNpZmljIGNvbG9yIGFuZCBmb250XCJcbiAgfSxcbiAgXCJ1bnN1cHBvcnRlZFwiOiB7XG4gICAgXCJuYW1lXCI6IFwiVW5zdXBwb3J0ZWRcIixcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiV2hlbiBhIG1hY3JvIGNhbid0IGJlIGZvdW5kLCB0aGlzIGlzIG1hY3JvIGlzIHVzZWRcIlxuICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuY2xhc3MgTWFjcm8ge1xuICBjb25zdHJ1Y3Rvcih7Y29uZmlnLCBkaW1lbnNpb25zLCBkYiwgY2FsbGJhY2tzfSkge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuZGltZW5zaW9ucyA9IGRpbWVuc2lvbnM7XG4gICAgdGhpcy5kYiA9IGRiO1xuICAgIHRoaXMuY2FsbGJhY2tzID0gY2FsbGJhY2tzO1xuXG4gICAgaWYoIXRoaXMuY29uc3RydWN0b3IuaWRlbnRpZmllcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQSBtYWNybyBpcyBtaXNzaW5nIGl0J3MgY2xhc3MgaWRlbnRpZmllciBmdW5jdGlvblwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYoIXRoaXMuc3RhcnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3RoaXMuaWRlbnRpZmllcigpfSBkaWQgbm90IGltcGxlbWVudCBhIHN0YXJ0IG1ldGhvZGApO1xuICAgICAgfVxuXG4gICAgICBpZighdGhpcy5zdG9wKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgJHt0aGlzLmlkZW50aWZpZXIoKX0gZGlkIG5vdCBpbXBsZW1lbnQgYSBzdG9wIG1ldGhvZGApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldENvbG9yKGNvbG9yKSB7XG4gICAgdmFyIGhlaWdodCA9IHRoaXMuZGltZW5zaW9ucy5oZWlnaHQsXG4gICAgICAgIHdpZHRoID0gdGhpcy5kaW1lbnNpb25zLndpZHRoO1xuICAgICAgICBcbiAgICBmb3IodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgIGZvcih2YXIgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLm9uUGl4ZWxDaGFuZ2UoeSwgeCwgY29sb3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hY3JvO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBNYWNybyA9IHJlcXVpcmUoJy4vbWFjcm8nKTtcblxuY29uc3QgaWRlbnRpZmllciA9ICdwcm9ncmFtbWFibGUnO1xuXG5jbGFzcyBQcm9ncmFtbWFibGVNYWNybyBleHRlbmRzIE1hY3JvIHtcbiAgc3RhdGljIGdldCBpZGVudGlmaWVyKCkge1xuICAgIHJldHVybiBpZGVudGlmaWVyO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdmFyIG1hdHJpeEtleSA9IHRoaXMuY29uZmlnLm1hdHJpeDtcbiAgICB0aGlzLm1hdHJpeFJlZiA9IHRoaXMuZGIucmVmKGBtYXRyaWNlcy8ke21hdHJpeEtleX1gKTtcbiAgICB0aGlzLm1hdHJpeFJlZi5vbmNlKCd2YWx1ZScpLnRoZW4oKHNuYXBzaG90KSA9PiB7XG4gICAgICB2YXIgZGF0YSA9IHNuYXBzaG90LnZhbCgpO1xuXG4gICAgICBmb3IobGV0IGtleSBpbiBzbmFwc2hvdC52YWwoKSkge1xuICAgICAgICB2YXIgaGV4ID0gZGF0YVtrZXldLmhleCxcbiAgICAgICAgICAgIFt5LCB4XSA9IGtleS5zcGxpdCgnOicpO1xuXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLm9uUGl4ZWxDaGFuZ2UoeSwgeCwgaGV4KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuY2hpbGRDaGFuZ2VkQ2FsbGJhY2sgPSB0aGlzLm1hdHJpeFJlZi5vbignY2hpbGRfY2hhbmdlZCcsIChzbmFwc2hvdCkgPT4ge1xuICAgICAgdmFyIGhleCA9IHNuYXBzaG90LnZhbCgpLmhleCxcbiAgICAgICAgICBbeSwgeF0gPSBzbmFwc2hvdC5rZXkuc3BsaXQoJzonKTtcblxuICAgICAgdGhpcy5jYWxsYmFja3Mub25QaXhlbENoYW5nZSh5LCB4LCBoZXgpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RvcCgpIHtcbiAgICB0aGlzLm1hdHJpeFJlZi5vZmYoJ2NoaWxkX2NoYW5nZWQnLCB0aGlzLmNoaWxkQ2hhbmdlZENhbGxiYWNrKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2dyYW1tYWJsZU1hY3JvO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBNYWNybyA9IHJlcXVpcmUoJy4vbWFjcm8nKTtcblxuY29uc3QgaWRlbnRpZmllciA9ICdzb2xpZC1jb2xvcic7XG5cbmNsYXNzIFNvbGlkQ29sb3JNYWNybyBleHRlbmRzIE1hY3JvIHtcbiAgc3RhdGljIGdldCBpZGVudGlmaWVyKCkge1xuICAgIHJldHVybiBpZGVudGlmaWVyO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMuY29uZmlnIHx8IHRoaXMuZGVmYXVsdENvbmZpZygpO1xuXG4gICAgdmFyIGhlaWdodCA9IHRoaXMuZGltZW5zaW9ucy5oZWlnaHQsXG4gICAgICAgIHdpZHRoID0gdGhpcy5kaW1lbnNpb25zLndpZHRoLFxuICAgICAgICBjb2xvciA9IHRoaXMuY29uZmlnLmNvbG9yO1xuXG4gICAgZm9yKHZhciB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgICBmb3IodmFyIHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xuICAgICAgICB0aGlzLmNhbGxiYWNrcy5vblBpeGVsQ2hhbmdlKHksIHgsIGNvbG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdG9wKCkge1xuICAgIC8vIG5vdGhpbmcuLi5cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNvbGlkQ29sb3JNYWNybztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgTWFjcm8gPSByZXF1aXJlKCcuL21hY3JvJyk7XG5cbmNvbnN0IGlkZW50aWZpZXIgPSAnc3RhcnQtdXAnO1xuXG5jbGFzcyBTdGFydFVwTWFjcm8gZXh0ZW5kcyBNYWNybyB7XG4gIHN0YXRpYyBnZXQgaWRlbnRpZmllcigpIHtcbiAgICByZXR1cm4gaWRlbnRpZmllcjtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuc2V0Q29sb3IoJyMwMDAwMDAnKTtcblxuICAgIHRoaXMuZnJhbWVJbmRleCA9IDA7XG4gICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGZvciAobGV0IGtleSBpbiBmcmFtZXNbdGhpcy5mcmFtZUluZGV4XSkge1xuICAgICAgICB2YXIgW3ksIHhdID0ga2V5LnNwbGl0KCc6JyksXG4gICAgICAgICAgICBoZXggPSBmcmFtZXNbdGhpcy5mcmFtZUluZGV4XVtrZXldLmhleDtcbiAgICAgICAgdGhpcy5jYWxsYmFja3Mub25QaXhlbENoYW5nZSh5LCB4LCBoZXgpO1xuICAgICAgfVxuXG4gICAgICBpZih0aGlzLmZyYW1lSW5kZXggPT0gZnJhbWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgdGhpcy5mcmFtZUluZGV4ID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZnJhbWVJbmRleCA9IHRoaXMuZnJhbWVJbmRleCArIDE7XG4gICAgICB9XG5cbiAgICB9LCAxMDApO1xuICB9XG5cbiAgc3RvcCgpIHtcbiAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xuICB9XG59XG5cbnZhciBmcmFtZXMgPSBbXG4gIHtcbiAgICAnMDowJzoge2hleDogJyM5OTAwMDAnfSxcbiAgICAnMDoxJzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDoyJzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDozJzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo0Jzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo1Jzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo2Jzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo3Jzoge2hleDogJyMwMDAwMDAnfVxuICB9LCB7XG4gICAgJzA6MCc6IHtoZXg6ICcjOTkwMDAwJ30sXG4gICAgJzA6MSc6IHtoZXg6ICcjQ0M0NDAwJ30sXG4gICAgJzA6Mic6IHtoZXg6ICcjMDAwMDAwJ30sXG4gICAgJzA6Myc6IHtoZXg6ICcjMDAwMDAwJ30sXG4gICAgJzA6NCc6IHtoZXg6ICcjMDAwMDAwJ30sXG4gICAgJzA6NSc6IHtoZXg6ICcjMDAwMDAwJ30sXG4gICAgJzA6Nic6IHtoZXg6ICcjMDAwMDAwJ30sXG4gICAgJzA6Nyc6IHtoZXg6ICcjMDAwMDAwJ31cbiAgfSwge1xuICAgICcwOjAnOiB7aGV4OiAnIzk5MDAwMCd9LFxuICAgICcwOjEnOiB7aGV4OiAnI0NDNDQwMCd9LFxuICAgICcwOjInOiB7aGV4OiAnI0ZGQUEwMCd9LFxuICAgICcwOjMnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjQnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjUnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjYnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjcnOiB7aGV4OiAnIzAwMDAwMCd9XG4gIH0sIHtcbiAgICAnMDowJzoge2hleDogJyM5OTAwMDAnfSxcbiAgICAnMDoxJzoge2hleDogJyNDQzQ0MDAnfSxcbiAgICAnMDoyJzoge2hleDogJyNGRkFBMDAnfSxcbiAgICAnMDozJzoge2hleDogJyNDQ0NDMDAnfSxcbiAgICAnMDo0Jzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo1Jzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo2Jzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo3Jzoge2hleDogJyMwMDAwMDAnfVxuICB9LCB7XG4gICAgJzA6MCc6IHtoZXg6ICcjOTkwMDAwJ30sXG4gICAgJzA6MSc6IHtoZXg6ICcjQ0M0NDAwJ30sXG4gICAgJzA6Mic6IHtoZXg6ICcjRkZBQTAwJ30sXG4gICAgJzA6Myc6IHtoZXg6ICcjQ0NDQzAwJ30sXG4gICAgJzA6NCc6IHtoZXg6ICcjODhDQzAwJ30sXG4gICAgJzA6NSc6IHtoZXg6ICcjMDAwMDAwJ30sXG4gICAgJzA6Nic6IHtoZXg6ICcjMDAwMDAwJ30sXG4gICAgJzA6Nyc6IHtoZXg6ICcjMDAwMDAwJ31cbiAgfSwge1xuICAgICcwOjAnOiB7aGV4OiAnIzk5MDAwMCd9LFxuICAgICcwOjEnOiB7aGV4OiAnI0NDNDQwMCd9LFxuICAgICcwOjInOiB7aGV4OiAnI0ZGQUEwMCd9LFxuICAgICcwOjMnOiB7aGV4OiAnI0NDQ0MwMCd9LFxuICAgICcwOjQnOiB7aGV4OiAnIzg4Q0MwMCd9LFxuICAgICcwOjUnOiB7aGV4OiAnIzAwQ0M4OCd9LFxuICAgICcwOjYnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjcnOiB7aGV4OiAnIzAwMDAwMCd9XG4gIH0sIHtcbiAgICAnMDowJzoge2hleDogJyM5OTAwMDAnfSxcbiAgICAnMDoxJzoge2hleDogJyNDQzQ0MDAnfSxcbiAgICAnMDoyJzoge2hleDogJyNGRkFBMDAnfSxcbiAgICAnMDozJzoge2hleDogJyNDQ0NDMDAnfSxcbiAgICAnMDo0Jzoge2hleDogJyM4OENDMDAnfSxcbiAgICAnMDo1Jzoge2hleDogJyMwMENDODgnfSxcbiAgICAnMDo2Jzoge2hleDogJyMwMDY2Q0MnfSxcbiAgICAnMDo3Jzoge2hleDogJyMwMDAwMDAnfVxuICB9LCB7XG4gICAgJzA6MCc6IHtoZXg6ICcjOTkwMDAwJ30sXG4gICAgJzA6MSc6IHtoZXg6ICcjQ0M0NDAwJ30sXG4gICAgJzA6Mic6IHtoZXg6ICcjRkZBQTAwJ30sXG4gICAgJzA6Myc6IHtoZXg6ICcjQ0NDQzAwJ30sXG4gICAgJzA6NCc6IHtoZXg6ICcjODhDQzAwJ30sXG4gICAgJzA6NSc6IHtoZXg6ICcjMDBDQzg4J30sXG4gICAgJzA6Nic6IHtoZXg6ICcjMDA2NkNDJ30sXG4gICAgJzA6Nyc6IHtoZXg6ICcjQ0MwMENDJ31cbiAgfVxuXTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGFydFVwTWFjcm87XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIE1hY3JvID0gcmVxdWlyZSgnLi9tYWNybycpO1xudmFyIFR5cGVXcml0ZXIgPSByZXF1aXJlKCd0eXBld3JpdGVyJyk7XG5cbmNvbnN0IGlkZW50aWZpZXIgPSAndGV4dCc7XG5cbmNsYXNzIFNvbGlkQ29sb3JNYWNybyBleHRlbmRzIE1hY3JvIHtcbiAgc3RhdGljIGdldCBpZGVudGlmaWVyKCkge1xuICAgIHJldHVybiBpZGVudGlmaWVyO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMuY29uZmlnO1xuICAgIHZhciBjb29yZGluYXRlcyA9IFtdO1xuICAgIHZhciB0eXBlV3JpdGVyID0gbmV3IFR5cGVXcml0ZXIoeyBmb250OiB0aGlzLmNvbmZpZy5mb250fSk7XG4gICAgdHlwZVdyaXRlci50ZXh0KHRoaXMuY29uZmlnLnRleHQsIChpdGVtKSA9PiB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5vblBpeGVsQ2hhbmdlKGl0ZW0ueSwgaXRlbS54LCB0aGlzLmNvbmZpZy5jb2xvcik7XG4gICAgICBjb29yZGluYXRlcy5wdXNoKHt5OiBpdGVtLnksIHg6IGl0ZW0ueH0pO1xuICAgIH0pO1xuXG4gICAgdmFyIG1lc3NhZ2VMZW5ndGggPSBNYXRoLm1heC5hcHBseShNYXRoLCBjb29yZGluYXRlcy5tYXAoZnVuY3Rpb24oY29vcmRpbmF0ZSkge1xuICAgICAgcmV0dXJuIGNvb3JkaW5hdGUueDtcbiAgICB9KSk7XG5cbiAgICBpZiAobWVzc2FnZUxlbmd0aCA+IHRoaXMuZGltZW5zaW9ucy53aWR0aCkge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHZhciBvZmZzZXQgPSAwO1xuICAgICAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgIGNvb3JkaW5hdGVzLmZvckVhY2goKGNvb3JkaW5hdGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLm9uUGl4ZWxDaGFuZ2UoY29vcmRpbmF0ZS55LCBjb29yZGluYXRlLnggLSBvZmZzZXQsICcjMDAwMDAwJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29vcmRpbmF0ZXMuZm9yRWFjaCgoY29vcmRpbmF0ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFja3Mub25QaXhlbENoYW5nZShjb29yZGluYXRlLnksIGNvb3JkaW5hdGUueCAtIChvZmZzZXQgKyAxKSwgdGhpcy5jb25maWcuY29sb3IpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYob2Zmc2V0ID4gbWVzc2FnZUxlbmd0aCkge1xuICAgICAgICAgICAgb2Zmc2V0ID0gLSh0aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG9mZnNldCArPSAxO1xuICAgICAgICB9LCB0aGlzLmNvbmZpZy5tYXJxdWVlU3BlZWQpO1xuICAgICAgfSwgdGhpcy5jb25maWcubWFycXVlZUluaXRpYWxEZWxheSk7XG4gICAgfVxuICB9XG5cbiAgc3RvcCgpIHtcbiAgICBpZiAodGhpcy5jb25maWcubWFycXVlZSkge1xuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTb2xpZENvbG9yTWFjcm87XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIE1hY3JvID0gcmVxdWlyZSgnLi9tYWNybycpO1xuXG5jb25zdCBpZGVudGlmaWVyID0gJ3R3aW5rbGUnO1xuXG5jbGFzcyBUd2lua2xlTWFjcm8gZXh0ZW5kcyBNYWNybyB7XG4gIHN0YXRpYyBnZXQgaWRlbnRpZmllcigpIHtcbiAgICByZXR1cm4gaWRlbnRpZmllcjtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHZhciBoZWlnaHQgPSB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0LFxuICAgICAgICB3aWR0aCA9IHRoaXMuZGltZW5zaW9ucy53aWR0aCxcbiAgICAgICAgc2VlZENvbG9yID0gdGhpcy5jb25maWcuc2VlZENvbG9yO1xuXG4gICAgZm9yKHZhciB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgICBmb3IodmFyIHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xuICAgICAgICB0aGlzLmNhbGxiYWNrcy5vblBpeGVsQ2hhbmdlKHksIHgsIGdlbmVyYXRlQ29sb3JTaGFkZShzZWVkQ29sb3IpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IDEwMDsgaSsrKSB7XG4gICAgICAgIHZhciB5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKChoZWlnaHQgLSAxKSAtIDAgKyAxKSkgKyAwO1xuICAgICAgICB2YXIgeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgod2lkdGggLSAxKSAtIDAgKyAxKSkgKyAwO1xuICAgICAgICB0aGlzLmNhbGxiYWNrcy5vblBpeGVsQ2hhbmdlKHksIHgsIGdlbmVyYXRlQ29sb3JTaGFkZShzZWVkQ29sb3IpKTtcbiAgICAgIH1cbiAgICB9LCAxMDApXG4gIH1cblxuICBzdG9wKCkge1xuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVDb2xvclNoYWRlKHNlZWRDb2xvcikge1xuICB2YXIgY29sb3JzID0gW107XG5cbiAgY29sb3JzLnB1c2goY29sb3JMdW1pbmFuY2Uoc2VlZENvbG9yLCAwKSlcbiAgY29sb3JzLnB1c2goY29sb3JMdW1pbmFuY2Uoc2VlZENvbG9yLCAtMC41KSlcbiAgY29sb3JzLnB1c2goY29sb3JMdW1pbmFuY2Uoc2VlZENvbG9yLCAtMC44KSlcbiAgY29sb3JzLnB1c2goY29sb3JMdW1pbmFuY2Uoc2VlZENvbG9yLCAtMC44KSlcbiAgY29sb3JzLnB1c2goY29sb3JMdW1pbmFuY2Uoc2VlZENvbG9yLCAtMC44KSlcbiAgY29sb3JzLnB1c2goY29sb3JMdW1pbmFuY2Uoc2VlZENvbG9yLCAtMSkpXG5cbiAgdmFyIGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDUgLSAwICsgMSkpICsgMDtcblxuICByZXR1cm4gY29sb3JzW2luZGV4XTtcbn1cblxuZnVuY3Rpb24gY29sb3JMdW1pbmFuY2UoaGV4LCBsdW0pIHtcblx0aGV4ID0gU3RyaW5nKGhleCkucmVwbGFjZSgvW14wLTlhLWZdL2dpLCAnJyk7XG5cdGlmIChoZXgubGVuZ3RoIDwgNikge1xuXHRcdGhleCA9IGhleFswXStoZXhbMF0raGV4WzFdK2hleFsxXStoZXhbMl0raGV4WzJdO1xuXHR9XG5cdGx1bSA9IGx1bSB8fCAwO1xuXHR2YXIgcmdiID0gXCIjXCIsIGMsIGk7XG5cdGZvciAoaSA9IDA7IGkgPCAzOyBpKyspIHtcblx0XHRjID0gcGFyc2VJbnQoaGV4LnN1YnN0cihpKjIsMiksIDE2KTtcblx0XHRjID0gTWF0aC5yb3VuZChNYXRoLm1pbihNYXRoLm1heCgwLCBjICsgKGMgKiBsdW0pKSwgMjU1KSkudG9TdHJpbmcoMTYpO1xuXHRcdHJnYiArPSAoXCIwMFwiK2MpLnN1YnN0cihjLmxlbmd0aCk7XG5cdH1cblx0cmV0dXJuIHJnYjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUd2lua2xlTWFjcm87XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIE1hY3JvID0gcmVxdWlyZSgnLi9tYWNybycpO1xudmFyIFR5cGVXcml0ZXIgPSByZXF1aXJlKCd0eXBld3JpdGVyJyk7XG5cbmNvbnN0IGlkZW50aWZpZXIgPSAndW5zdXBwb3J0ZWQnO1xuXG5jbGFzcyBVbnN1cHBvcnRlZE1hY3JvIGV4dGVuZHMgTWFjcm8ge1xuICBzdGF0aWMgZ2V0IGlkZW50aWZpZXIoKSB7XG4gICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB0aGlzLnNldENvbG9yKCcjMDAwMDAwJyk7XG5cbiAgICB2YXIgdHlwZVdyaXRlciA9IG5ldyBUeXBlV3JpdGVyKHsgZm9udDogJ3N5c3RlbS1taWNybyd9KTtcbiAgICB0eXBlV3JpdGVyLnRleHQoXCJVTlNVUFBPUlRFRFwiLCAoaXRlbSkgPT4ge1xuICAgICAgdGhpcy5jYWxsYmFja3Mub25QaXhlbENoYW5nZShpdGVtLnksIGl0ZW0ueCwgJyNGRkZGRkYnKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgLy8gTm90aGluZy4uXG4gIH1cbn1cblxudmFyIGRhdGEgPSBbXG4gIFsxLCAwXSxcbiAgWzIsIDBdLFxuICBbMywgMF0sXG4gIFs0LCAwXVxuXTtcblxubW9kdWxlLmV4cG9ydHMgPSBVbnN1cHBvcnRlZE1hY3JvO1xuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcImhlaWdodFwiOiAxNCxcbiAgXCJ3aWR0aFwiOiA2LFxuICBcImNoYXJhY3RlcnNcIjoge1xuICAgIFwiMFwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDcsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA4LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTEsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDgsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCIxXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTEsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDksXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA4LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNyxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiMlwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDExLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNyxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDgsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA5LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIjNcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTEsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDExLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiNFwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDksXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDExLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiNVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDcsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA4LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTEsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDExLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiNlwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDgsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA5LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTEsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDksXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA4LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDcsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCI3XCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDgsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA5LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiOFwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA4LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTEsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDExLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA5LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIjlcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDcsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA4LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTEsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDExLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIixcIjoge1xuICAgICAgXCJ3aWR0aFwiOiAzLFxuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiaGVpZ2h0XCI6IDYsXG4gIFwid2lkdGhcIjogNSxcbiAgXCJjaGFyYWN0ZXJzXCI6IHtcbiAgICBcIjBcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCIxXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCIyXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiM1wiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiNFwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiNVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCI2XCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIjdcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIjhcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiOVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiIFwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtdXG4gICAgfSxcbiAgICBcIlJcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJZXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJPXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiVVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIk5cIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiU1wiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiUFwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJUXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJBXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiQlwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiQ1wiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJEXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJFXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJGXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIkdcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiSFwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJJXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiSlwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJLXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJNXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJRXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiVlwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIkxcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIldcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJYXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiWlwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIEZvbnRzID0ge1xuICAnc3lzdGVtLW1pY3JvJzogcmVxdWlyZSgnLi9mb250cy9zeXN0ZW0tbWljcm8nKSxcbiAgJ3N5c3RlbS1tZWRpdW0nOiByZXF1aXJlKCcuL2ZvbnRzL3N5c3RlbS1tZWRpdW0nKVxufTtcblxuY2xhc3MgVHlwZVdyaXRlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLmZvbnQgPSBvcHRpb25zLmZvbnQ7XG4gICAgdGhpcy5jb2x1bW4gPSBvcHRpb25zLnN0YXJ0aW5nQ29sdW1uIHx8IDA7XG4gICAgdGhpcy5yb3cgPSBvcHRpb25zLnN0YXJ0aW5nUm93IHx8IDA7XG4gICAgdGhpcy5zcGFjZUJldHdlZW5MZXR0ZXJzID0gb3B0aW9ucy5zcGFjZUJldHdlZW5MZXR0ZXJzIHx8IDE7XG4gICAgdGhpcy5hbGlnbm1lbnQgPSBvcHRpb25zLmFsaWdubWVudCB8fCAnbGVmdCc7XG4gIH1cblxuICBzdGF0aWMgYXZhaWxhYmxlRm9udHMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKEZvbnRzKTtcbiAgfVxuXG4gIHRleHQoY29weSwgY2FsbGJhY2spIHtcbiAgICB2YXIgZm9udCA9IEZvbnRzW3RoaXMuZm9udF0sXG4gICAgICAgIGNoYXJhY3RlcnMgPSBmb250LmNoYXJhY3RlcnM7XG5cbiAgICBpZih0aGlzLmFsaWdubWVudCA9PT0gJ2xlZnQnKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvcHkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNoYXJhY3RlciA9IGNoYXJhY3RlcnNbY29weVtpXV07XG5cbiAgICAgICAgaWYoY2hhcmFjdGVyKSB7XG4gICAgICAgICAgdmFyIGNvb3JkaW5hdGVzID0gY2hhcmFjdGVyLmNvb3JkaW5hdGVzO1xuXG4gICAgICAgICAgaWYoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICAgIGNvb3JkaW5hdGVzLmZvckVhY2goKHBvaW50KSA9PiB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrKHtcbiAgICAgICAgICAgICAgICB5OiB0aGlzLnJvdyArIHBvaW50LnksXG4gICAgICAgICAgICAgICAgeDogdGhpcy5jb2x1bW4gKyBwb2ludC54XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciB3aWR0aCA9IGNoYXJhY3Rlci53aWR0aCB8fCBmb250LndpZHRoO1xuICAgICAgICAgICAgdGhpcy5jb2x1bW4gPSB0aGlzLmNvbHVtbiArIHdpZHRoICsgdGhpcy5zcGFjZUJldHdlZW5MZXR0ZXJzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvbHVtbiAtPSBjaGFyYWN0ZXJzW2NvcHlbY29weS5sZW5ndGggLSAxXV0ud2lkdGggfHwgZm9udC53aWR0aDtcbiAgICAgIGZvciAobGV0IGkgPSBjb3B5Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHZhciBjaGFyYWN0ZXIgPSBjaGFyYWN0ZXJzW2NvcHlbaV1dO1xuXG4gICAgICAgIGlmKGNoYXJhY3Rlcikge1xuICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9IGNoYXJhY3Rlci5jb29yZGluYXRlcztcblxuICAgICAgICAgIGlmKGNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgICBjb29yZGluYXRlcy5mb3JFYWNoKChwb2ludCkgPT4ge1xuICAgICAgICAgICAgICBjYWxsYmFjayh7XG4gICAgICAgICAgICAgICAgeTogdGhpcy5yb3cgKyBwb2ludC55LFxuICAgICAgICAgICAgICAgIHg6IHRoaXMuY29sdW1uICsgcG9pbnQueFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgd2lkdGggPSBjaGFyYWN0ZXIud2lkdGggfHwgZm9udC53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuY29sdW1uID0gdGhpcy5jb2x1bW4gLSB3aWR0aCAtIHRoaXMuc3BhY2VCZXR3ZWVuTGV0dGVycztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUeXBlV3JpdGVyO1xuIl19
