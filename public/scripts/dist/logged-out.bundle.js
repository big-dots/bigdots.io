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
    UnsupportedMacro = require('./macros/unsupported');

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

},{"./macro-config":6,"./macros/programmable":8,"./macros/solid-color":9,"./macros/start-up":10,"./macros/twinkle":11,"./macros/unsupported":12}],6:[function(require,module,exports){
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

},{"./macro":7}],12:[function(require,module,exports){
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

},{"./macro":7,"typewriter":15}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
"use strict";

var Fonts = {
  'system-micro': require('./fonts/system-micro'),
  'system-medium': require('./fonts/system-medium')
};

class TypeWriter {
  constructor(options) {
    options = options || {};
    debugger
    this.font = options.font;
    this.column = options.startingColumn || 0;
    this.row = options.startingRow || 0;
    this.spaceBetweenLetters = options.spaceBetweenLetters || 1;
    this.alignment = options.alignment || 'left';
  }

  text(copy, callback) {
    var font = Fonts[this.font],
        characters = font.characters;

    if(this.alignment === 'left') {
      for (let i = 0; i < copy.length; i++) {
        var character = characters[copy[i]],
            coordinates = character.coordinates;

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
    } else {
      this.column -= characters[copy[copy.length - 1]].width || font.width;
      for (let i = copy.length - 1; i >= 0; i--) {
        var character = characters[copy[i]],
            coordinates = character.coordinates;

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

module.exports = TypeWriter;

},{"./fonts/system-medium":13,"./fonts/system-micro":14}]},{},[3])


//# sourceMappingURL=logged-out.bundle.js.map
