(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"macro-library":2}],2:[function(require,module,exports){
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

},{"./macro-config":3,"./macros/programmable":5,"./macros/solid-color":6,"./macros/start-up":7,"./macros/text":8,"./macros/twinkle":9,"./macros/unsupported":10}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{"./macro":4}],6:[function(require,module,exports){
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

},{"./macro":4}],7:[function(require,module,exports){
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

},{"./macro":4}],8:[function(require,module,exports){
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

},{"./macro":4,"typewriter":13}],9:[function(require,module,exports){
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

},{"./macro":4}],10:[function(require,module,exports){
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

},{"./macro":4,"typewriter":13}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{"./fonts/system-medium":11,"./fonts/system-micro":12}],14:[function(require,module,exports){
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

},{"../lib/resource":15,"display-coupler":1}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{"./components/display":14}]},{},[16])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZGlzcGxheS1jb3VwbGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Rpc3BsYXktY291cGxlci9ub2RlX21vZHVsZXMvbWFjcm8tbGlicmFyeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kaXNwbGF5LWNvdXBsZXIvbm9kZV9tb2R1bGVzL21hY3JvLWxpYnJhcnkvbWFjcm8tY29uZmlnLmpzb24iLCJub2RlX21vZHVsZXMvZGlzcGxheS1jb3VwbGVyL25vZGVfbW9kdWxlcy9tYWNyby1saWJyYXJ5L21hY3Jvcy9tYWNyby5qcyIsIm5vZGVfbW9kdWxlcy9kaXNwbGF5LWNvdXBsZXIvbm9kZV9tb2R1bGVzL21hY3JvLWxpYnJhcnkvbWFjcm9zL3Byb2dyYW1tYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9kaXNwbGF5LWNvdXBsZXIvbm9kZV9tb2R1bGVzL21hY3JvLWxpYnJhcnkvbWFjcm9zL3NvbGlkLWNvbG9yLmpzIiwibm9kZV9tb2R1bGVzL2Rpc3BsYXktY291cGxlci9ub2RlX21vZHVsZXMvbWFjcm8tbGlicmFyeS9tYWNyb3Mvc3RhcnQtdXAuanMiLCJub2RlX21vZHVsZXMvZGlzcGxheS1jb3VwbGVyL25vZGVfbW9kdWxlcy9tYWNyby1saWJyYXJ5L21hY3Jvcy90ZXh0LmpzIiwibm9kZV9tb2R1bGVzL2Rpc3BsYXktY291cGxlci9ub2RlX21vZHVsZXMvbWFjcm8tbGlicmFyeS9tYWNyb3MvdHdpbmtsZS5qcyIsIm5vZGVfbW9kdWxlcy9kaXNwbGF5LWNvdXBsZXIvbm9kZV9tb2R1bGVzL21hY3JvLWxpYnJhcnkvbWFjcm9zL3Vuc3VwcG9ydGVkLmpzIiwibm9kZV9tb2R1bGVzL2Rpc3BsYXktY291cGxlci9ub2RlX21vZHVsZXMvbWFjcm8tbGlicmFyeS9ub2RlX21vZHVsZXMvdHlwZXdyaXRlci9mb250cy9zeXN0ZW0tbWVkaXVtLmpzb24iLCJub2RlX21vZHVsZXMvZGlzcGxheS1jb3VwbGVyL25vZGVfbW9kdWxlcy9tYWNyby1saWJyYXJ5L25vZGVfbW9kdWxlcy90eXBld3JpdGVyL2ZvbnRzL3N5c3RlbS1taWNyby5qc29uIiwibm9kZV9tb2R1bGVzL2Rpc3BsYXktY291cGxlci9ub2RlX21vZHVsZXMvbWFjcm8tbGlicmFyeS9ub2RlX21vZHVsZXMvdHlwZXdyaXRlci9pbmRleC5qcyIsInB1YmxpYy9zY3JpcHRzL2NvbXBvbmVudHMvZGlzcGxheS5qcyIsInB1YmxpYy9zY3JpcHRzL2xpYi9yZXNvdXJjZS5qcyIsInB1YmxpYy9zY3JpcHRzL2xvZ2dlZC1vdXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOXRDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbnFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDdkVBOzs7O0FBQ0E7Ozs7Ozs7O0lBRU0sTztBQUNKLG1CQUFZLEdBQVosRUFBaUIsVUFBakIsRUFBNkI7QUFBQTs7QUFDM0IsU0FBSyxHQUFMLEdBQVcsR0FBWDtBQUNBLFNBQUssVUFBTCxHQUFrQixVQUFsQjtBQUNEOzs7O3lCQUVJLEssRUFBTyxVLEVBQVksUSxFQUFVO0FBQUE7O0FBQ2hDLFdBQUssTUFBTCxDQUFZLEtBQVosRUFBbUIsVUFBbkI7O0FBRUEsVUFBSSxpQkFBaUIsNkJBQW1CLFNBQVMsUUFBVCxFQUFuQixDQUFyQjtBQUNBLHFCQUFlLE9BQWYsQ0FBdUIsS0FBSyxVQUE1QixFQUF3QztBQUN0QyxpQkFBUyxpQkFBUyxXQUFULEVBQXNCLElBQXRCLEVBQTRCO0FBQ25DO0FBQ0QsU0FIcUM7QUFJdEMsdUJBQWUsdUJBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxHQUFQLEVBQVksV0FBWixFQUE0QjtBQUN6Qyx3QkFBYyxlQUFlLEVBQTdCO0FBQ0EsZ0JBQUsseUJBQUwsQ0FBK0IsQ0FBL0IsRUFBa0MsQ0FBbEMsRUFBcUMsR0FBckMsRUFBMEMsV0FBMUM7QUFDRDtBQVBxQyxPQUF4QztBQVNBO0FBQ0Q7Ozt5QkFFSSxLLEVBQU8sVyxFQUFhLEssRUFBTyxVLEVBQVksUSxFQUFVO0FBQUE7O0FBQ3BELFVBQUksZ0JBQWdCO0FBQ2xCLGVBQU8sS0FEVztBQUVsQixxQkFBYSxXQUZLO0FBR2xCLGVBQU8sV0FBVyxLQUhBO0FBSWxCLGdCQUFRLFdBQVc7QUFKRCxPQUFwQjs7QUFPQSxXQUFLLE1BQUwsQ0FBWSxLQUFaLEVBQW1CLFVBQW5COztBQUVBLFVBQUksaUJBQWlCLDhCQUFyQjtBQUNBLHFCQUFlLElBQWYsQ0FBb0IsYUFBcEIsRUFBbUM7QUFDakMsaUJBQVMsaUJBQVMsV0FBVCxFQUFzQixJQUF0QixFQUE0QjtBQUNuQztBQUNELFNBSGdDO0FBSWpDLHVCQUFlLHVCQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sR0FBUCxFQUFZLFdBQVosRUFBNEI7QUFDekMsd0JBQWMsZUFBZSxFQUE3QjtBQUNBLGlCQUFLLHlCQUFMLENBQStCLENBQS9CLEVBQWtDLENBQWxDLEVBQXFDLEdBQXJDLEVBQTBDLFdBQTFDO0FBQ0Q7QUFQZ0MsT0FBbkM7QUFTQTtBQUNEOzs7MkJBRU0sSyxFQUFPLFUsRUFBWTtBQUN4QixXQUFLLEdBQUwsQ0FBUyxJQUFUOztBQVFBLFVBQUkscUJBQXFCLENBQUMsS0FBTSxNQUFNLENBQWIsSUFBbUIsR0FBNUM7QUFBQSxVQUNJLE9BQU8sQ0FBQyxRQUFRLEVBQVQsSUFBZSxXQUFXLEtBRHJDOztBQUdBLFdBQUksSUFBSSxJQUFJLENBQVosRUFBZSxJQUFJLFdBQVcsTUFBOUIsRUFBc0MsR0FBdEMsRUFBMkM7QUFDekMsWUFBSSxPQUFPLCtDQUE2QyxrQkFBN0Msa0JBQTRFLElBQTVFLHlCQUFvRyxJQUFwRyxXQUFYO0FBQ0EsYUFBSSxJQUFJLElBQUksQ0FBWixFQUFlLElBQUksV0FBVyxLQUE5QixFQUFxQyxHQUFyQyxFQUEwQztBQUN4QyxlQUFLLE1BQUwsaUVBQ21ELElBRG5ELG9CQUNzRSxJQUR0RSwyREFFc0MsQ0FGdEMsa0JBRW9ELENBRnBELDRCQUU0RSxDQUY1RSxTQUVpRixDQUZqRjtBQUtEO0FBQ0QsYUFBSyxHQUFMLENBQVMsSUFBVCxDQUFjLFFBQWQsRUFBd0IsTUFBeEIsQ0FBK0IsSUFBL0I7QUFDRDtBQUNGOzs7OENBRXlCLEMsRUFBRyxDLEVBQUcsRyxFQUFLLFcsRUFBYTtBQUNoRCxVQUFJLEtBQUssU0FBUyxnQkFBVCwwQkFBZ0QsQ0FBaEQsU0FBcUQsQ0FBckQsU0FBVDtBQUNBLFVBQUcsR0FBRyxNQUFILEdBQVksQ0FBZixFQUFrQjtBQUNoQixXQUFHLENBQUgsRUFBTSxLQUFOLENBQVksVUFBWixHQUEwQixRQUFRLFNBQVIsWUFBNkIsR0FBdkQ7QUFDRDtBQUNGOzs7Ozs7QUFHSCxTQUFTLFFBQVQsQ0FBa0IsS0FBbEIsRUFBeUIsT0FBekIsRUFBa0M7QUFDOUIsTUFBSSxJQUFFLFNBQVMsTUFBTSxLQUFOLENBQVksQ0FBWixDQUFULEVBQXdCLEVBQXhCLENBQU47QUFBQSxNQUFrQyxJQUFFLFVBQVEsQ0FBUixHQUFVLENBQVYsR0FBWSxHQUFoRDtBQUFBLE1BQW9ELElBQUUsVUFBUSxDQUFSLEdBQVUsVUFBUSxDQUFDLENBQW5CLEdBQXFCLE9BQTNFO0FBQUEsTUFBbUYsSUFBRSxLQUFHLEVBQXhGO0FBQUEsTUFBMkYsSUFBRSxLQUFHLENBQUgsR0FBSyxNQUFsRztBQUFBLE1BQXlHLElBQUUsSUFBRSxRQUE3RztBQUNBLFNBQU8sTUFBSSxDQUFDLFlBQVUsQ0FBQyxLQUFLLEtBQUwsQ0FBVyxDQUFDLElBQUUsQ0FBSCxJQUFNLENBQWpCLElBQW9CLENBQXJCLElBQXdCLE9BQWxDLEdBQTBDLENBQUMsS0FBSyxLQUFMLENBQVcsQ0FBQyxJQUFFLENBQUgsSUFBTSxDQUFqQixJQUFvQixDQUFyQixJQUF3QixLQUFsRSxJQUF5RSxLQUFLLEtBQUwsQ0FBVyxDQUFDLElBQUUsQ0FBSCxJQUFNLENBQWpCLElBQW9CLENBQTdGLENBQUQsRUFBa0csUUFBbEcsQ0FBMkcsRUFBM0csRUFBK0csS0FBL0csQ0FBcUgsQ0FBckgsQ0FBWDtBQUNIOztRQUVtQixPLEdBQVgsTzs7Ozs7Ozs7Ozs7OztJQ3RGSCxROzs7Ozs7OzJCQUNHLEUsRUFBSTtBQUNULGFBQU8sU0FBUyxRQUFULEdBQW9CLEdBQXBCLGVBQW9DLEVBQXBDLENBQVA7QUFDRDs7O2dDQUVXLEUsRUFBSSxDLEVBQUcsQyxFQUFHO0FBQ3BCLGFBQU8sU0FBUyxRQUFULEdBQW9CLEdBQXBCLGVBQW9DLEVBQXBDLFNBQTBDLENBQTFDLFNBQStDLENBQS9DLENBQVA7QUFDRDs7OytCQUVVO0FBQ1QsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsQ0FBd0IsVUFBeEIsQ0FBUDtBQUNEOzs7NEJBRU8sRSxFQUFJO0FBQ1YsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsZUFBb0MsRUFBcEMsQ0FBUDtBQUNEOzs7NkNBRXdCLEUsRUFBSTtBQUMzQixhQUFPLFNBQVMsUUFBVCxHQUFvQixHQUFwQixlQUFvQyxFQUFwQyx3QkFBUDtBQUNEOzs7dUNBRWtCLEUsRUFBSSxJLEVBQU07QUFDM0IsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsZUFBb0MsRUFBcEMsZ0JBQWlELElBQWpELENBQVA7QUFDRDs7O2tDQUVhLEUsRUFBSTtBQUNoQixhQUFPLFNBQVMsUUFBVCxHQUFvQixHQUFwQixlQUFvQyxFQUFwQyxhQUFQO0FBQ0Q7Ozs2QkFFUTtBQUNQLGFBQU8sU0FBUyxRQUFULEdBQW9CLEdBQXBCLENBQXdCLFFBQXhCLENBQVA7QUFDRDs7O2dDQUVXO0FBQ1YsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsQ0FBd0IsVUFBeEIsQ0FBUDtBQUNEOzs7NkJBRVEsRSxFQUFJO0FBQ1gsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsZUFBb0MsRUFBcEMsQ0FBUDtBQUNEOzs7aUNBRVksRSxFQUFJO0FBQ2YsYUFBTyxTQUFTLFFBQVQsR0FBb0IsR0FBcEIsbUJBQXdDLEVBQXhDLGVBQVA7QUFDRDs7O2lDQUNZLEUsRUFBSTtBQUNmLGFBQU8sU0FBUyxRQUFULEdBQW9CLEdBQXBCLG9CQUF5QyxFQUF6QyxlQUFQO0FBQ0Q7Ozs7OztRQUdrQixPLEdBQVosUTs7Ozs7QUNqRFQ7Ozs7OztBQUVBLFNBQVMsYUFBVCxDQUF1QjtBQUNyQixVQUFRLHlDQURhO0FBRXJCLGNBQVksNEJBRlM7QUFHckIsZUFBYSxtQ0FIUTtBQUlyQixpQkFBZTtBQUpNLENBQXZCOztBQU9BLElBQUksVUFBVSxzQkFBWSxFQUFFLFVBQUYsQ0FBWixFQUEyQixzQkFBM0IsQ0FBZDs7QUFFQSxRQUFRLElBQVIsQ0FBYSxTQUFiLEVBQXdCLEVBQUMsV0FBVyxTQUFaLEVBQXhCLEVBQWdELEVBQUUsT0FBRixFQUFXLEtBQVgsRUFBaEQsRUFBb0UsRUFBRSxPQUFPLEdBQVQsRUFBYyxRQUFRLEVBQXRCLEVBQXBFLEVBQWdHLFlBQU07QUFDcEc7QUFDRCxDQUZEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgTWFjcm9MaWJyYXJ5ID0gcmVxdWlyZSgnbWFjcm8tbGlicmFyeScpO1xuXG52YXIgbWFjcm9MaWJyYXJ5ID0gbmV3IE1hY3JvTGlicmFyeSgpO1xubWFjcm9MaWJyYXJ5LnJlZ2lzdGVyTWFjcm9zKCk7XG5cbmNsYXNzIERpc3BsYXlDb3VwbGVyIHtcbiAgY29uc3RydWN0b3IoZGIpIHtcbiAgICB0aGlzLmRiID0gZGI7XG4gICAgdGhpcy5zdGFydGluZ1VwID0gdHJ1ZTtcbiAgfVxuXG4gIHN0YXRpYyByZWdpc3RlcmVkTWFjcm9zKCkge1xuICAgIHJldHVybiBtYWNyb0xpYnJhcnkucmVnaXN0ZXJlZE1hY3JvcygpO1xuICB9XG5cbiAgc3RhcnRVcCh7ZGltZW5zaW9ucywgY2FsbGJhY2tzfSkge1xuICAgIHRoaXMuYWN0aXZhdGVNYWNybyA9IG1hY3JvTGlicmFyeS5sb2FkTWFjcm8oJ3N0YXJ0LXVwJywge1xuICAgICAgZGltZW5zaW9uczogZGltZW5zaW9ucyxcbiAgICAgIGNhbGxiYWNrczogY2FsbGJhY2tzXG4gICAgfSk7XG4gICAgdGhpcy5hY3RpdmF0ZU1hY3JvLnN0YXJ0KCk7XG4gIH1cblxuICBkZW1vKGRpc3BsYXlDb25maWcsIGNhbGxiYWNrcykge1xuICAgIHZhciBuZXh0ID0gKCkgPT4ge1xuICAgICAgdmFyIG1hY3JvID0gZGlzcGxheUNvbmZpZy5tYWNybyxcbiAgICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgICAgY29uZmlnOiBkaXNwbGF5Q29uZmlnLm1hY3JvQ29uZmlnIHx8IHt9LFxuICAgICAgICAgICAgZGltZW5zaW9uczoge1xuICAgICAgICAgICAgICB3aWR0aDogZGlzcGxheUNvbmZpZy53aWR0aCxcbiAgICAgICAgICAgICAgaGVpZ2h0OiBkaXNwbGF5Q29uZmlnLmhlaWdodFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNhbGxiYWNrczoge1xuICAgICAgICAgICAgICBvblBpeGVsQ2hhbmdlOiAoeSwgeCwgaGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2tzLm9uUGl4ZWxDaGFuZ2UoeSwgeCwgaGV4LCBkaXNwbGF5Q29uZmlnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG5cbiAgICAgIGlmKHRoaXMuYWN0aXZhdGVNYWNybykge1xuICAgICAgICB0aGlzLmFjdGl2YXRlTWFjcm8uc3RvcCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5hY3RpdmF0ZU1hY3JvID0gbWFjcm9MaWJyYXJ5LmxvYWRNYWNybyhtYWNybywgb3B0aW9ucyk7XG4gICAgICB0aGlzLmFjdGl2YXRlTWFjcm8uc3RhcnQoKTtcbiAgICB9O1xuXG4gICAgaWYodGhpcy5zdGFydGluZ1VwKSB7XG4gICAgICBjYWxsYmFja3Mub25SZWFkeShkaXNwbGF5Q29uZmlnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuc3RhcnRpbmdVcCA9IGZhbHNlO1xuICAgICAgICBuZXh0KCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dCgpXG4gICAgfVxuICB9XG5cbiAgY29ubmVjdChkaXNwbGF5S2V5LCBjYWxsYmFja3MpIHtcbiAgICB0aGlzLmRiLnJlZihgZGlzcGxheXMvJHtkaXNwbGF5S2V5fS9gKS5vbigndmFsdWUnLCAoc25hcHNob3QpID0+IHtcbiAgICAgIHZhciBkaXNwbGF5RGF0YSA9IHNuYXBzaG90LnZhbCgpO1xuXG4gICAgICB2YXIgbmV4dCA9ICgpID0+IHtcbiAgICAgICAgdmFyIG1hY3JvID0gZGlzcGxheURhdGEubWFjcm8sXG4gICAgICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgICAgICBjb25maWc6IGRpc3BsYXlEYXRhLm1hY3JvQ29uZmlnIHx8IHt9LFxuICAgICAgICAgICAgICBkaW1lbnNpb25zOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IGRpc3BsYXlEYXRhLndpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogZGlzcGxheURhdGEuaGVpZ2h0XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGRiOiB0aGlzLmRiLFxuICAgICAgICAgICAgICBjYWxsYmFja3M6IHtcbiAgICAgICAgICAgICAgICBvblBpeGVsQ2hhbmdlOiAoeSwgeCwgaGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICBjYWxsYmFja3Mub25QaXhlbENoYW5nZSh5LCB4LCBoZXgsIGRpc3BsYXlEYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgaWYobWFjcm8gPT09IFwicHJvZ3JhbW1hYmxlXCIpIHtcbiAgICAgICAgICBvcHRpb25zLmNvbmZpZy5tYXRyaXggPSBkaXNwbGF5RGF0YS5tYXRyaXg7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLmFjdGl2YXRlTWFjcm8pIHtcbiAgICAgICAgICB0aGlzLmFjdGl2YXRlTWFjcm8uc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWN0aXZhdGVNYWNybyA9IG1hY3JvTGlicmFyeS5sb2FkTWFjcm8obWFjcm8sIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmFjdGl2YXRlTWFjcm8uc3RhcnQoKTtcbiAgICAgIH07XG5cbiAgICAgIGlmKHRoaXMuc3RhcnRpbmdVcCkge1xuICAgICAgICBjYWxsYmFja3Mub25SZWFkeShkaXNwbGF5RGF0YSwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuc3RhcnRpbmdVcCA9IGZhbHNlO1xuICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0KClcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpc3BsYXlDb3VwbGVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBQcm9ncmFtbWFibGVNYWNybyA9IHJlcXVpcmUoJy4vbWFjcm9zL3Byb2dyYW1tYWJsZScpLFxuICAgIFR3aW5rbGVNYWNybyA9IHJlcXVpcmUoJy4vbWFjcm9zL3R3aW5rbGUnKSxcbiAgICBTdGFydFVwTWFjcm8gPSByZXF1aXJlKCcuL21hY3Jvcy9zdGFydC11cCcpLFxuICAgIFNvbGlkQ29sb3JNYWNybyA9IHJlcXVpcmUoJy4vbWFjcm9zL3NvbGlkLWNvbG9yJyksXG4gICAgVW5zdXBwb3J0ZWRNYWNybyA9IHJlcXVpcmUoJy4vbWFjcm9zL3Vuc3VwcG9ydGVkJyksXG4gICAgVGV4dE1hY3JvID0gcmVxdWlyZSgnLi9tYWNyb3MvdGV4dCcpO1xuXG52YXIgTWFjcm9Db25maWcgPSByZXF1aXJlKCcuL21hY3JvLWNvbmZpZycpO1xuXG5jbGFzcyBNYWNyb0xpYnJhcnkge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLk1hY3JvcyA9IHt9O1xuICB9XG5cbiAgcmVnaXN0ZXJNYWNyb3MoKSB7XG4gICAgdGhpcy5NYWNyb3NbUHJvZ3JhbW1hYmxlTWFjcm8uaWRlbnRpZmllcl0gPSBQcm9ncmFtbWFibGVNYWNybztcbiAgICB0aGlzLk1hY3Jvc1tUd2lua2xlTWFjcm8uaWRlbnRpZmllcl0gPSBUd2lua2xlTWFjcm87XG4gICAgdGhpcy5NYWNyb3NbU3RhcnRVcE1hY3JvLmlkZW50aWZpZXJdID0gU3RhcnRVcE1hY3JvO1xuICAgIHRoaXMuTWFjcm9zW1NvbGlkQ29sb3JNYWNyby5pZGVudGlmaWVyXSA9IFNvbGlkQ29sb3JNYWNybztcbiAgICB0aGlzLk1hY3Jvc1tUZXh0TWFjcm8uaWRlbnRpZmllcl0gPSBUZXh0TWFjcm87XG4gIH1cblxuICBhdmFpbGFibGVNYWNyb3MoKSB7XG4gICAgcmV0dXJuIE1hY3JvQ29uZmlnO1xuICB9XG5cbiAgbG9hZE1hY3JvKG5hbWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgTWFjcm8gPSB0aGlzLk1hY3Jvc1tuYW1lXSB8fCBVbnN1cHBvcnRlZE1hY3JvO1xuICAgIHJldHVybiBuZXcgTWFjcm8ob3B0aW9ucyk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNYWNyb0xpYnJhcnk7XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwidHdpbmtsZVwiOiB7XG4gICAgXCJuYW1lXCI6IFwiVHdpbmtsZVwiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJDaG9vc2UgYSBjb2xvciBhbmQgcmFuZG9tbHkgdG9nZ2xlIHRoZSBicmlnaHRuZXNzIG9mIGVhY2ggTEVEIG9uIHRoZSBib2FyZC5cIlxuICB9LFxuICBcInByb2dyYW1tYWJsZVwiOiB7XG4gICAgXCJuYW1lXCI6IFwiUHJvZ3JhbW1hYmxlXCIsXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIlVwZGF0ZSBlYWNoIExFRCB2aWEgYSByZXN0ZnVsIGludGVyZmFjZSBwcm9ncmFtbWF0aWNhbGx5LlwiXG4gIH0sXG4gIFwic29saWQtY29sb3JcIjoge1xuICAgIFwibmFtZVwiOiBcIlNvbGlkIENvbG9yXCIsXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIkZpbGwgdGhlIGJvYXJkIHdpdGggb25lIHNvbGlkIGNvbG9yLlwiXG4gIH0sXG4gIFwic3RhcnQtdXBcIjoge1xuICAgIFwibmFtZVwiOiBcIlN0YXJ0IHVwXCIsXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIlRoZSBzdGFydGluZyB1cCBhbmltYXRpb25cIlxuICB9LFxuICBcInRleHRcIjoge1xuICAgIFwibmFtZVwiOiBcIlRleHRcIixcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiRGlzcGxheSBhbnkgdGV4dCB3aXRoIGEgc3BlY2lmaWMgY29sb3IgYW5kIGZvbnRcIlxuICB9LFxuICBcInVuc3VwcG9ydGVkXCI6IHtcbiAgICBcIm5hbWVcIjogXCJVbnN1cHBvcnRlZFwiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaGVuIGEgbWFjcm8gY2FuJ3QgYmUgZm91bmQsIHRoaXMgaXMgbWFjcm8gaXMgdXNlZFwiXG4gIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5jbGFzcyBNYWNybyB7XG4gIGNvbnN0cnVjdG9yKHtjb25maWcsIGRpbWVuc2lvbnMsIGRiLCBjYWxsYmFja3N9KSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5kaW1lbnNpb25zID0gZGltZW5zaW9ucztcbiAgICB0aGlzLmRiID0gZGI7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBjYWxsYmFja3M7XG5cbiAgICBpZighdGhpcy5jb25zdHJ1Y3Rvci5pZGVudGlmaWVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBIG1hY3JvIGlzIG1pc3NpbmcgaXQncyBjbGFzcyBpZGVudGlmaWVyIGZ1bmN0aW9uXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZighdGhpcy5zdGFydCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7dGhpcy5pZGVudGlmaWVyKCl9IGRpZCBub3QgaW1wbGVtZW50IGEgc3RhcnQgbWV0aG9kYCk7XG4gICAgICB9XG5cbiAgICAgIGlmKCF0aGlzLnN0b3ApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3RoaXMuaWRlbnRpZmllcigpfSBkaWQgbm90IGltcGxlbWVudCBhIHN0b3AgbWV0aG9kYCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0Q29sb3IoY29sb3IpIHtcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5kaW1lbnNpb25zLmhlaWdodCxcbiAgICAgICAgd2lkdGggPSB0aGlzLmRpbWVuc2lvbnMud2lkdGg7XG4gICAgICAgIFxuICAgIGZvcih2YXIgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgICAgZm9yKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcbiAgICAgICAgdGhpcy5jYWxsYmFja3Mub25QaXhlbENoYW5nZSh5LCB4LCBjb2xvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFjcm87XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIE1hY3JvID0gcmVxdWlyZSgnLi9tYWNybycpO1xuXG5jb25zdCBpZGVudGlmaWVyID0gJ3Byb2dyYW1tYWJsZSc7XG5cbmNsYXNzIFByb2dyYW1tYWJsZU1hY3JvIGV4dGVuZHMgTWFjcm8ge1xuICBzdGF0aWMgZ2V0IGlkZW50aWZpZXIoKSB7XG4gICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB2YXIgbWF0cml4S2V5ID0gdGhpcy5jb25maWcubWF0cml4O1xuICAgIHRoaXMubWF0cml4UmVmID0gdGhpcy5kYi5yZWYoYG1hdHJpY2VzLyR7bWF0cml4S2V5fWApO1xuICAgIHRoaXMubWF0cml4UmVmLm9uY2UoJ3ZhbHVlJykudGhlbigoc25hcHNob3QpID0+IHtcbiAgICAgIHZhciBkYXRhID0gc25hcHNob3QudmFsKCk7XG5cbiAgICAgIGZvcihsZXQga2V5IGluIHNuYXBzaG90LnZhbCgpKSB7XG4gICAgICAgIHZhciBoZXggPSBkYXRhW2tleV0uaGV4LFxuICAgICAgICAgICAgW3ksIHhdID0ga2V5LnNwbGl0KCc6Jyk7XG5cbiAgICAgICAgdGhpcy5jYWxsYmFja3Mub25QaXhlbENoYW5nZSh5LCB4LCBoZXgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5jaGlsZENoYW5nZWRDYWxsYmFjayA9IHRoaXMubWF0cml4UmVmLm9uKCdjaGlsZF9jaGFuZ2VkJywgKHNuYXBzaG90KSA9PiB7XG4gICAgICB2YXIgaGV4ID0gc25hcHNob3QudmFsKCkuaGV4LFxuICAgICAgICAgIFt5LCB4XSA9IHNuYXBzaG90LmtleS5zcGxpdCgnOicpO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrcy5vblBpeGVsQ2hhbmdlKHksIHgsIGhleCk7XG4gICAgfSk7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIHRoaXMubWF0cml4UmVmLm9mZignY2hpbGRfY2hhbmdlZCcsIHRoaXMuY2hpbGRDaGFuZ2VkQ2FsbGJhY2spO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvZ3JhbW1hYmxlTWFjcm87XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIE1hY3JvID0gcmVxdWlyZSgnLi9tYWNybycpO1xuXG5jb25zdCBpZGVudGlmaWVyID0gJ3NvbGlkLWNvbG9yJztcblxuY2xhc3MgU29saWRDb2xvck1hY3JvIGV4dGVuZHMgTWFjcm8ge1xuICBzdGF0aWMgZ2V0IGlkZW50aWZpZXIoKSB7XG4gICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5jb25maWcgfHwgdGhpcy5kZWZhdWx0Q29uZmlnKCk7XG5cbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5kaW1lbnNpb25zLmhlaWdodCxcbiAgICAgICAgd2lkdGggPSB0aGlzLmRpbWVuc2lvbnMud2lkdGgsXG4gICAgICAgIGNvbG9yID0gdGhpcy5jb25maWcuY29sb3I7XG5cbiAgICBmb3IodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgIGZvcih2YXIgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLm9uUGl4ZWxDaGFuZ2UoeSwgeCwgY29sb3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgLy8gbm90aGluZy4uLlxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU29saWRDb2xvck1hY3JvO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBNYWNybyA9IHJlcXVpcmUoJy4vbWFjcm8nKTtcblxuY29uc3QgaWRlbnRpZmllciA9ICdzdGFydC11cCc7XG5cbmNsYXNzIFN0YXJ0VXBNYWNybyBleHRlbmRzIE1hY3JvIHtcbiAgc3RhdGljIGdldCBpZGVudGlmaWVyKCkge1xuICAgIHJldHVybiBpZGVudGlmaWVyO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5zZXRDb2xvcignIzAwMDAwMCcpO1xuXG4gICAgdGhpcy5mcmFtZUluZGV4ID0gMDtcbiAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgZm9yIChsZXQga2V5IGluIGZyYW1lc1t0aGlzLmZyYW1lSW5kZXhdKSB7XG4gICAgICAgIHZhciBbeSwgeF0gPSBrZXkuc3BsaXQoJzonKSxcbiAgICAgICAgICAgIGhleCA9IGZyYW1lc1t0aGlzLmZyYW1lSW5kZXhdW2tleV0uaGV4O1xuICAgICAgICB0aGlzLmNhbGxiYWNrcy5vblBpeGVsQ2hhbmdlKHksIHgsIGhleCk7XG4gICAgICB9XG5cbiAgICAgIGlmKHRoaXMuZnJhbWVJbmRleCA9PSBmcmFtZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICB0aGlzLmZyYW1lSW5kZXggPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5mcmFtZUluZGV4ID0gdGhpcy5mcmFtZUluZGV4ICsgMTtcbiAgICAgIH1cblxuICAgIH0sIDEwMCk7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XG4gIH1cbn1cblxudmFyIGZyYW1lcyA9IFtcbiAge1xuICAgICcwOjAnOiB7aGV4OiAnIzk5MDAwMCd9LFxuICAgICcwOjEnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjInOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjMnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjQnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjUnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjYnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjcnOiB7aGV4OiAnIzAwMDAwMCd9XG4gIH0sIHtcbiAgICAnMDowJzoge2hleDogJyM5OTAwMDAnfSxcbiAgICAnMDoxJzoge2hleDogJyNDQzQ0MDAnfSxcbiAgICAnMDoyJzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDozJzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo0Jzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo1Jzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo2Jzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo3Jzoge2hleDogJyMwMDAwMDAnfVxuICB9LCB7XG4gICAgJzA6MCc6IHtoZXg6ICcjOTkwMDAwJ30sXG4gICAgJzA6MSc6IHtoZXg6ICcjQ0M0NDAwJ30sXG4gICAgJzA6Mic6IHtoZXg6ICcjRkZBQTAwJ30sXG4gICAgJzA6Myc6IHtoZXg6ICcjMDAwMDAwJ30sXG4gICAgJzA6NCc6IHtoZXg6ICcjMDAwMDAwJ30sXG4gICAgJzA6NSc6IHtoZXg6ICcjMDAwMDAwJ30sXG4gICAgJzA6Nic6IHtoZXg6ICcjMDAwMDAwJ30sXG4gICAgJzA6Nyc6IHtoZXg6ICcjMDAwMDAwJ31cbiAgfSwge1xuICAgICcwOjAnOiB7aGV4OiAnIzk5MDAwMCd9LFxuICAgICcwOjEnOiB7aGV4OiAnI0NDNDQwMCd9LFxuICAgICcwOjInOiB7aGV4OiAnI0ZGQUEwMCd9LFxuICAgICcwOjMnOiB7aGV4OiAnI0NDQ0MwMCd9LFxuICAgICcwOjQnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjUnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjYnOiB7aGV4OiAnIzAwMDAwMCd9LFxuICAgICcwOjcnOiB7aGV4OiAnIzAwMDAwMCd9XG4gIH0sIHtcbiAgICAnMDowJzoge2hleDogJyM5OTAwMDAnfSxcbiAgICAnMDoxJzoge2hleDogJyNDQzQ0MDAnfSxcbiAgICAnMDoyJzoge2hleDogJyNGRkFBMDAnfSxcbiAgICAnMDozJzoge2hleDogJyNDQ0NDMDAnfSxcbiAgICAnMDo0Jzoge2hleDogJyM4OENDMDAnfSxcbiAgICAnMDo1Jzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo2Jzoge2hleDogJyMwMDAwMDAnfSxcbiAgICAnMDo3Jzoge2hleDogJyMwMDAwMDAnfVxuICB9LCB7XG4gICAgJzA6MCc6IHtoZXg6ICcjOTkwMDAwJ30sXG4gICAgJzA6MSc6IHtoZXg6ICcjQ0M0NDAwJ30sXG4gICAgJzA6Mic6IHtoZXg6ICcjRkZBQTAwJ30sXG4gICAgJzA6Myc6IHtoZXg6ICcjQ0NDQzAwJ30sXG4gICAgJzA6NCc6IHtoZXg6ICcjODhDQzAwJ30sXG4gICAgJzA6NSc6IHtoZXg6ICcjMDBDQzg4J30sXG4gICAgJzA6Nic6IHtoZXg6ICcjMDAwMDAwJ30sXG4gICAgJzA6Nyc6IHtoZXg6ICcjMDAwMDAwJ31cbiAgfSwge1xuICAgICcwOjAnOiB7aGV4OiAnIzk5MDAwMCd9LFxuICAgICcwOjEnOiB7aGV4OiAnI0NDNDQwMCd9LFxuICAgICcwOjInOiB7aGV4OiAnI0ZGQUEwMCd9LFxuICAgICcwOjMnOiB7aGV4OiAnI0NDQ0MwMCd9LFxuICAgICcwOjQnOiB7aGV4OiAnIzg4Q0MwMCd9LFxuICAgICcwOjUnOiB7aGV4OiAnIzAwQ0M4OCd9LFxuICAgICcwOjYnOiB7aGV4OiAnIzAwNjZDQyd9LFxuICAgICcwOjcnOiB7aGV4OiAnIzAwMDAwMCd9XG4gIH0sIHtcbiAgICAnMDowJzoge2hleDogJyM5OTAwMDAnfSxcbiAgICAnMDoxJzoge2hleDogJyNDQzQ0MDAnfSxcbiAgICAnMDoyJzoge2hleDogJyNGRkFBMDAnfSxcbiAgICAnMDozJzoge2hleDogJyNDQ0NDMDAnfSxcbiAgICAnMDo0Jzoge2hleDogJyM4OENDMDAnfSxcbiAgICAnMDo1Jzoge2hleDogJyMwMENDODgnfSxcbiAgICAnMDo2Jzoge2hleDogJyMwMDY2Q0MnfSxcbiAgICAnMDo3Jzoge2hleDogJyNDQzAwQ0MnfVxuICB9XG5dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJ0VXBNYWNybztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgTWFjcm8gPSByZXF1aXJlKCcuL21hY3JvJyk7XG52YXIgVHlwZVdyaXRlciA9IHJlcXVpcmUoJ3R5cGV3cml0ZXInKTtcblxuY29uc3QgaWRlbnRpZmllciA9ICd0ZXh0JztcblxuY2xhc3MgU29saWRDb2xvck1hY3JvIGV4dGVuZHMgTWFjcm8ge1xuICBzdGF0aWMgZ2V0IGlkZW50aWZpZXIoKSB7XG4gICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5jb25maWc7XG4gICAgdmFyIGNvb3JkaW5hdGVzID0gW107XG4gICAgdmFyIHR5cGVXcml0ZXIgPSBuZXcgVHlwZVdyaXRlcih7IGZvbnQ6IHRoaXMuY29uZmlnLmZvbnR9KTtcbiAgICB0eXBlV3JpdGVyLnRleHQodGhpcy5jb25maWcudGV4dCwgKGl0ZW0pID0+IHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLm9uUGl4ZWxDaGFuZ2UoaXRlbS55LCBpdGVtLngsIHRoaXMuY29uZmlnLmNvbG9yKTtcbiAgICAgIGNvb3JkaW5hdGVzLnB1c2goe3k6IGl0ZW0ueSwgeDogaXRlbS54fSk7XG4gICAgfSk7XG5cbiAgICB2YXIgbWVzc2FnZUxlbmd0aCA9IE1hdGgubWF4LmFwcGx5KE1hdGgsIGNvb3JkaW5hdGVzLm1hcChmdW5jdGlvbihjb29yZGluYXRlKSB7XG4gICAgICByZXR1cm4gY29vcmRpbmF0ZS54O1xuICAgIH0pKTtcblxuICAgIGlmIChtZXNzYWdlTGVuZ3RoID4gdGhpcy5kaW1lbnNpb25zLndpZHRoKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdmFyIG9mZnNldCA9IDA7XG4gICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgY29vcmRpbmF0ZXMuZm9yRWFjaCgoY29vcmRpbmF0ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFja3Mub25QaXhlbENoYW5nZShjb29yZGluYXRlLnksIGNvb3JkaW5hdGUueCAtIG9mZnNldCwgJyMwMDAwMDAnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb29yZGluYXRlcy5mb3JFYWNoKChjb29yZGluYXRlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5vblBpeGVsQ2hhbmdlKGNvb3JkaW5hdGUueSwgY29vcmRpbmF0ZS54IC0gKG9mZnNldCArIDEpLCB0aGlzLmNvbmZpZy5jb2xvcik7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZihvZmZzZXQgPiBtZXNzYWdlTGVuZ3RoKSB7XG4gICAgICAgICAgICBvZmZzZXQgPSAtKHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgb2Zmc2V0ICs9IDE7XG4gICAgICAgIH0sIHRoaXMuY29uZmlnLm1hcnF1ZWVTcGVlZCk7XG4gICAgICB9LCB0aGlzLmNvbmZpZy5tYXJxdWVlSW5pdGlhbERlbGF5KTtcbiAgICB9XG4gIH1cblxuICBzdG9wKCkge1xuICAgIGlmICh0aGlzLmNvbmZpZy5tYXJxdWVlKSB7XG4gICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNvbGlkQ29sb3JNYWNybztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgTWFjcm8gPSByZXF1aXJlKCcuL21hY3JvJyk7XG5cbmNvbnN0IGlkZW50aWZpZXIgPSAndHdpbmtsZSc7XG5cbmNsYXNzIFR3aW5rbGVNYWNybyBleHRlbmRzIE1hY3JvIHtcbiAgc3RhdGljIGdldCBpZGVudGlmaWVyKCkge1xuICAgIHJldHVybiBpZGVudGlmaWVyO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdmFyIGhlaWdodCA9IHRoaXMuZGltZW5zaW9ucy5oZWlnaHQsXG4gICAgICAgIHdpZHRoID0gdGhpcy5kaW1lbnNpb25zLndpZHRoLFxuICAgICAgICBzZWVkQ29sb3IgPSB0aGlzLmNvbmZpZy5zZWVkQ29sb3I7XG5cbiAgICBmb3IodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgIGZvcih2YXIgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLm9uUGl4ZWxDaGFuZ2UoeSwgeCwgZ2VuZXJhdGVDb2xvclNoYWRlKHNlZWRDb2xvcikpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgMTAwOyBpKyspIHtcbiAgICAgICAgdmFyIHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoKGhlaWdodCAtIDEpIC0gMCArIDEpKSArIDA7XG4gICAgICAgIHZhciB4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKCh3aWR0aCAtIDEpIC0gMCArIDEpKSArIDA7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLm9uUGl4ZWxDaGFuZ2UoeSwgeCwgZ2VuZXJhdGVDb2xvclNoYWRlKHNlZWRDb2xvcikpO1xuICAgICAgfVxuICAgIH0sIDEwMClcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUNvbG9yU2hhZGUoc2VlZENvbG9yKSB7XG4gIHZhciBjb2xvcnMgPSBbXTtcblxuICBjb2xvcnMucHVzaChjb2xvckx1bWluYW5jZShzZWVkQ29sb3IsIDApKVxuICBjb2xvcnMucHVzaChjb2xvckx1bWluYW5jZShzZWVkQ29sb3IsIC0wLjUpKVxuICBjb2xvcnMucHVzaChjb2xvckx1bWluYW5jZShzZWVkQ29sb3IsIC0wLjgpKVxuICBjb2xvcnMucHVzaChjb2xvckx1bWluYW5jZShzZWVkQ29sb3IsIC0wLjgpKVxuICBjb2xvcnMucHVzaChjb2xvckx1bWluYW5jZShzZWVkQ29sb3IsIC0wLjgpKVxuICBjb2xvcnMucHVzaChjb2xvckx1bWluYW5jZShzZWVkQ29sb3IsIC0xKSlcblxuICB2YXIgaW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoNSAtIDAgKyAxKSkgKyAwO1xuXG4gIHJldHVybiBjb2xvcnNbaW5kZXhdO1xufVxuXG5mdW5jdGlvbiBjb2xvckx1bWluYW5jZShoZXgsIGx1bSkge1xuXHRoZXggPSBTdHJpbmcoaGV4KS5yZXBsYWNlKC9bXjAtOWEtZl0vZ2ksICcnKTtcblx0aWYgKGhleC5sZW5ndGggPCA2KSB7XG5cdFx0aGV4ID0gaGV4WzBdK2hleFswXStoZXhbMV0raGV4WzFdK2hleFsyXStoZXhbMl07XG5cdH1cblx0bHVtID0gbHVtIHx8IDA7XG5cdHZhciByZ2IgPSBcIiNcIiwgYywgaTtcblx0Zm9yIChpID0gMDsgaSA8IDM7IGkrKykge1xuXHRcdGMgPSBwYXJzZUludChoZXguc3Vic3RyKGkqMiwyKSwgMTYpO1xuXHRcdGMgPSBNYXRoLnJvdW5kKE1hdGgubWluKE1hdGgubWF4KDAsIGMgKyAoYyAqIGx1bSkpLCAyNTUpKS50b1N0cmluZygxNik7XG5cdFx0cmdiICs9IChcIjAwXCIrYykuc3Vic3RyKGMubGVuZ3RoKTtcblx0fVxuXHRyZXR1cm4gcmdiO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFR3aW5rbGVNYWNybztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgTWFjcm8gPSByZXF1aXJlKCcuL21hY3JvJyk7XG52YXIgVHlwZVdyaXRlciA9IHJlcXVpcmUoJ3R5cGV3cml0ZXInKTtcblxuY29uc3QgaWRlbnRpZmllciA9ICd1bnN1cHBvcnRlZCc7XG5cbmNsYXNzIFVuc3VwcG9ydGVkTWFjcm8gZXh0ZW5kcyBNYWNybyB7XG4gIHN0YXRpYyBnZXQgaWRlbnRpZmllcigpIHtcbiAgICByZXR1cm4gaWRlbnRpZmllcjtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuc2V0Q29sb3IoJyMwMDAwMDAnKTtcblxuICAgIHZhciB0eXBlV3JpdGVyID0gbmV3IFR5cGVXcml0ZXIoeyBmb250OiAnc3lzdGVtLW1pY3JvJ30pO1xuICAgIHR5cGVXcml0ZXIudGV4dChcIlVOU1VQUE9SVEVEXCIsIChpdGVtKSA9PiB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5vblBpeGVsQ2hhbmdlKGl0ZW0ueSwgaXRlbS54LCAnI0ZGRkZGRicpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RvcCgpIHtcbiAgICAvLyBOb3RoaW5nLi5cbiAgfVxufVxuXG52YXIgZGF0YSA9IFtcbiAgWzEsIDBdLFxuICBbMiwgMF0sXG4gIFszLCAwXSxcbiAgWzQsIDBdXG5dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVuc3VwcG9ydGVkTWFjcm87XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiaGVpZ2h0XCI6IDE0LFxuICBcIndpZHRoXCI6IDYsXG4gIFwiY2hhcmFjdGVyc1wiOiB7XG4gICAgXCIwXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNyxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDgsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA5LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTAsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDExLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA5LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDcsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIjFcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDgsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCIyXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDksXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiM1wiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNyxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDgsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA5LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTAsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCI0XCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDcsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA4LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTEsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCI1XCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNyxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDgsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA5LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTAsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCI2XCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDksXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDExLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDgsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIjdcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDksXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDExLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCI4XCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDksXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMCxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDExLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDgsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA3LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiOVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDYsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA2LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNixcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDcsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA4LFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogOSxcbiAgICAgICAgICBcInhcIjogNSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEwLFxuICAgICAgICAgIFwieFwiOiA1LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTEsXG4gICAgICAgICAgXCJ4XCI6IDUsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMTIsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDExLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiLFwiOiB7XG4gICAgICBcIndpZHRoXCI6IDMsXG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEyLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJoZWlnaHRcIjogNixcbiAgXCJ3aWR0aFwiOiA1LFxuICBcImNoYXJhY3RlcnNcIjoge1xuICAgIFwiIFwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtdXG4gICAgfSxcbiAgICBcIjBcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCIxXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCIyXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCIzXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCI0XCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCI1XCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIjZcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiN1wiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiOFwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCI5XCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJSXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiWVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiT1wiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIlVcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJOXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIlNcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIlBcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiVFwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiQVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIkJcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIkNcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiRFwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiRVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiRlwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJHXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIkhcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiSVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIkpcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiS1wiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiTVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAzLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiUVwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIlZcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJMXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgXCJXXCI6IHtcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDQsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAyLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIFwiWFwiOiB7XG4gICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNCxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDMsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMixcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBcIlpcIjoge1xuICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgIFwieFwiOiAyLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICBcInhcIjogMyxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA0LFxuICAgICAgICAgIFwieFwiOiAxLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogMyxcbiAgICAgICAgICBcInhcIjogMixcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDIsXG4gICAgICAgICAgXCJ4XCI6IDMsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgIFwieFwiOiA0LFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDUsXG4gICAgICAgICAgXCJ4XCI6IDIsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwieVwiOiA1LFxuICAgICAgICAgIFwieFwiOiAzLFxuICAgICAgICAgIFwib3BhY2l0eVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInlcIjogNSxcbiAgICAgICAgICBcInhcIjogNCxcbiAgICAgICAgICBcIm9wYWNpdHlcIjogMVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgXCJ4XCI6IDQsXG4gICAgICAgICAgXCJvcGFjaXR5XCI6IDFcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH1cbiAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBGb250cyA9IHtcbiAgJ3N5c3RlbS1taWNybyc6IHJlcXVpcmUoJy4vZm9udHMvc3lzdGVtLW1pY3JvJyksXG4gICdzeXN0ZW0tbWVkaXVtJzogcmVxdWlyZSgnLi9mb250cy9zeXN0ZW0tbWVkaXVtJylcbn07XG5cbmNsYXNzIFR5cGVXcml0ZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5mb250ID0gb3B0aW9ucy5mb250O1xuICAgIHRoaXMuY29sdW1uID0gb3B0aW9ucy5zdGFydGluZ0NvbHVtbiB8fCAwO1xuICAgIHRoaXMucm93ID0gb3B0aW9ucy5zdGFydGluZ1JvdyB8fCAwO1xuICAgIHRoaXMuc3BhY2VCZXR3ZWVuTGV0dGVycyA9IG9wdGlvbnMuc3BhY2VCZXR3ZWVuTGV0dGVycyB8fCAxO1xuICAgIHRoaXMuYWxpZ25tZW50ID0gb3B0aW9ucy5hbGlnbm1lbnQgfHwgJ2xlZnQnO1xuICB9XG5cbiAgc3RhdGljIGF2YWlsYWJsZUZvbnRzKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhGb250cyk7XG4gIH1cblxuICB0ZXh0KGNvcHksIGNhbGxiYWNrKSB7XG4gICAgdmFyIGZvbnQgPSBGb250c1t0aGlzLmZvbnRdLFxuICAgICAgICBjaGFyYWN0ZXJzID0gZm9udC5jaGFyYWN0ZXJzO1xuXG4gICAgaWYodGhpcy5hbGlnbm1lbnQgPT09ICdsZWZ0Jykge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3B5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGFyYWN0ZXIgPSBjaGFyYWN0ZXJzW2NvcHlbaV1dO1xuXG4gICAgICAgIGlmKGNoYXJhY3Rlcikge1xuICAgICAgICAgIHZhciBjb29yZGluYXRlcyA9IGNoYXJhY3Rlci5jb29yZGluYXRlcztcblxuICAgICAgICAgIGlmKGNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgICBjb29yZGluYXRlcy5mb3JFYWNoKChwb2ludCkgPT4ge1xuICAgICAgICAgICAgICBjYWxsYmFjayh7XG4gICAgICAgICAgICAgICAgeTogdGhpcy5yb3cgKyBwb2ludC55LFxuICAgICAgICAgICAgICAgIHg6IHRoaXMuY29sdW1uICsgcG9pbnQueFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgd2lkdGggPSBjaGFyYWN0ZXIud2lkdGggfHwgZm9udC53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuY29sdW1uID0gdGhpcy5jb2x1bW4gKyB3aWR0aCArIHRoaXMuc3BhY2VCZXR3ZWVuTGV0dGVycztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb2x1bW4gLT0gY2hhcmFjdGVyc1tjb3B5W2NvcHkubGVuZ3RoIC0gMV1dLndpZHRoIHx8IGZvbnQud2lkdGg7XG4gICAgICBmb3IgKGxldCBpID0gY29weS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICB2YXIgY2hhcmFjdGVyID0gY2hhcmFjdGVyc1tjb3B5W2ldXTtcblxuICAgICAgICBpZihjaGFyYWN0ZXIpIHtcbiAgICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSBjaGFyYWN0ZXIuY29vcmRpbmF0ZXM7XG5cbiAgICAgICAgICBpZihjb29yZGluYXRlcykge1xuICAgICAgICAgICAgY29vcmRpbmF0ZXMuZm9yRWFjaCgocG9pbnQpID0+IHtcbiAgICAgICAgICAgICAgY2FsbGJhY2soe1xuICAgICAgICAgICAgICAgIHk6IHRoaXMucm93ICsgcG9pbnQueSxcbiAgICAgICAgICAgICAgICB4OiB0aGlzLmNvbHVtbiArIHBvaW50LnhcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIHdpZHRoID0gY2hhcmFjdGVyLndpZHRoIHx8IGZvbnQud2lkdGg7XG4gICAgICAgICAgICB0aGlzLmNvbHVtbiA9IHRoaXMuY29sdW1uIC0gd2lkdGggLSB0aGlzLnNwYWNlQmV0d2VlbkxldHRlcnM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHlwZVdyaXRlcjtcbiIsImltcG9ydCBSZXNvdXJjZSBmcm9tICcuLi9saWIvcmVzb3VyY2UnO1xuaW1wb3J0IERpc3BsYXlDb3VwbGVyIGZyb20gJ2Rpc3BsYXktY291cGxlcic7XG5cbmNsYXNzIERpc3BsYXkge1xuICBjb25zdHJ1Y3RvcigkZWwsIGRpc3BsYXlLZXkpIHtcbiAgICB0aGlzLiRlbCA9ICRlbDtcbiAgICB0aGlzLmRpc3BsYXlLZXkgPSBkaXNwbGF5S2V5O1xuICB9XG5cbiAgbG9hZCh3aWR0aCwgZGltZW5zaW9ucywgY2FsbGJhY2spIHtcbiAgICB0aGlzLnJlbmRlcih3aWR0aCwgZGltZW5zaW9ucyk7XG5cbiAgICB2YXIgZGlzcGxheUNvdXBsZXIgPSBuZXcgRGlzcGxheUNvdXBsZXIoZmlyZWJhc2UuZGF0YWJhc2UoKSk7XG4gICAgZGlzcGxheUNvdXBsZXIuY29ubmVjdCh0aGlzLmRpc3BsYXlLZXksIHtcbiAgICAgIG9uUmVhZHk6IGZ1bmN0aW9uKGRpc3BsYXlEYXRhLCBuZXh0KSB7XG4gICAgICAgIG5leHQoKVxuICAgICAgfSxcbiAgICAgIG9uUGl4ZWxDaGFuZ2U6ICh5LCB4LCBoZXgsIGRpc3BsYXlEYXRhKSA9PiB7XG4gICAgICAgIGRpc3BsYXlEYXRhID0gZGlzcGxheURhdGEgfHwge307XG4gICAgICAgIHRoaXMucmVmcmVzaFBpeGVsQnlDb29yZGluYXRlcyh5LCB4LCBoZXgsIGRpc3BsYXlEYXRhKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjYWxsYmFjaygpO1xuICB9XG5cbiAgZGVtbyhtYWNybywgbWFjcm9Db25maWcsIHdpZHRoLCBkaW1lbnNpb25zLCBjYWxsYmFjaykge1xuICAgIHZhciBkaXNwbGF5Q29uZmlnID0ge1xuICAgICAgbWFjcm86IG1hY3JvLFxuICAgICAgbWFjcm9Db25maWc6IG1hY3JvQ29uZmlnLFxuICAgICAgd2lkdGg6IGRpbWVuc2lvbnMud2lkdGgsXG4gICAgICBoZWlnaHQ6IGRpbWVuc2lvbnMuaGVpZ2h0XG4gICAgfTtcblxuICAgIHRoaXMucmVuZGVyKHdpZHRoLCBkaW1lbnNpb25zKTtcblxuICAgIHZhciBkaXNwbGF5Q291cGxlciA9IG5ldyBEaXNwbGF5Q291cGxlcigpO1xuICAgIGRpc3BsYXlDb3VwbGVyLmRlbW8oZGlzcGxheUNvbmZpZywge1xuICAgICAgb25SZWFkeTogZnVuY3Rpb24oZGlzcGxheURhdGEsIG5leHQpIHtcbiAgICAgICAgbmV4dCgpXG4gICAgICB9LFxuICAgICAgb25QaXhlbENoYW5nZTogKHksIHgsIGhleCwgZGlzcGxheURhdGEpID0+IHtcbiAgICAgICAgZGlzcGxheURhdGEgPSBkaXNwbGF5RGF0YSB8fCB7fTtcbiAgICAgICAgdGhpcy5yZWZyZXNoUGl4ZWxCeUNvb3JkaW5hdGVzKHksIHgsIGhleCwgZGlzcGxheURhdGEpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cblxuICByZW5kZXIod2lkdGgsIGRpbWVuc2lvbnMpIHtcbiAgICB0aGlzLiRlbC5odG1sKGBcbiAgICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0b3BcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInJpZ2h0XCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmcm9udFwiPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYCk7XG5cbiAgICB2YXIgYWRqdXN0ZWRCcmlnaHRuZXNzID0gKDUwICsgKDEwMCAvIDIpKSAvIDEwMCxcbiAgICAgICAgc2l6ZSA9ICh3aWR0aCAtIDIwKSAvIGRpbWVuc2lvbnMud2lkdGg7XG5cbiAgICBmb3IodmFyIHkgPSAwOyB5IDwgZGltZW5zaW9ucy5oZWlnaHQ7IHkrKykge1xuICAgICAgdmFyICRyb3cgPSAkKGA8ZGl2IGNsYXNzPVwibWF0cml4LXJvd1wiIHN0eWxlPVwib3BhY2l0eTogJHthZGp1c3RlZEJyaWdodG5lc3N9OyBoZWlnaHQ6ICR7c2l6ZX1weDsgbGluZS1oZWlnaHQ6ICR7c2l6ZX1weDtcIj5gKTtcbiAgICAgIGZvcih2YXIgeCA9IDA7IHggPCBkaW1lbnNpb25zLndpZHRoOyB4KyspIHtcbiAgICAgICAgJHJvdy5hcHBlbmQoYFxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWF0cml4LWRvdC13cmFwcGVyXCIgc3R5bGU9XCJ3aWR0aDogJHtzaXplfXB4OyBoZWlnaHQ6ICR7c2l6ZX1weDtcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYXRyaXgtZG90XCIgZGF0YS15PVwiJHt5fVwiIGRhdGEteD1cIiR7eH1cIiBkYXRhLWNvb3JkaW5hdGVzPVwiJHt5fToke3h9XCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAjNDQ0XCI+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICBgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuJGVsLmZpbmQoJy5mcm9udCcpLmFwcGVuZCgkcm93KTtcbiAgICB9XG4gIH1cblxuICByZWZyZXNoUGl4ZWxCeUNvb3JkaW5hdGVzKHksIHgsIGhleCwgZGlzcGxheURhdGEpIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBbZGF0YS1jb29yZGluYXRlcz0nJHt5fToke3h9J11gKTtcbiAgICBpZihlbC5sZW5ndGggPiAwKSB7XG4gICAgICBlbFswXS5zdHlsZS5iYWNrZ3JvdW5kID0gKGhleCA9PT0gJyMwMDAwMDAnID8gYCM0NDRgIDogaGV4KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2hhZGVIZXgoY29sb3IsIHBlcmNlbnQpIHtcbiAgICB2YXIgZj1wYXJzZUludChjb2xvci5zbGljZSgxKSwxNiksdD1wZXJjZW50PDA/MDoyNTUscD1wZXJjZW50PDA/cGVyY2VudCotMTpwZXJjZW50LFI9Zj4+MTYsRz1mPj44JjB4MDBGRixCPWYmMHgwMDAwRkY7XG4gICAgcmV0dXJuIFwiI1wiKygweDEwMDAwMDArKE1hdGgucm91bmQoKHQtUikqcCkrUikqMHgxMDAwMCsoTWF0aC5yb3VuZCgodC1HKSpwKStHKSoweDEwMCsoTWF0aC5yb3VuZCgodC1CKSpwKStCKSkudG9TdHJpbmcoMTYpLnNsaWNlKDEpO1xufVxuXG5leHBvcnQgeyBEaXNwbGF5IGFzIGRlZmF1bHQgfVxuIiwiY2xhc3MgUmVzb3VyY2Uge1xuICBtYXRyaXgoaWQpIHtcbiAgICByZXR1cm4gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoYG1hdHJpY2VzLyR7aWR9YCk7XG4gIH1cblxuICBtYXRyaXhQaXhlbChpZCwgeSwgeCkge1xuICAgIHJldHVybiBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZihgbWF0cmljZXMvJHtpZH0vJHt5fToke3h9YCk7XG4gIH1cblxuICBkaXNwbGF5cygpIHtcbiAgICByZXR1cm4gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoJ2Rpc3BsYXlzJyk7XG4gIH1cblxuICBkaXNwbGF5KGlkKSB7XG4gICAgcmV0dXJuIGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKGBkaXNwbGF5cy8ke2lkfWApO1xuICB9XG5cbiAgZGlzcGxheUNvbm5lY3RlZEhhcmR3YXJlKGlkKSB7XG4gICAgcmV0dXJuIGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKGBkaXNwbGF5cy8ke2lkfS9jb25uZWN0ZWRIYXJkd2FyZWApO1xuICB9XG5cbiAgZGlzcGxheU1hY3JvQ29uZmlnKGlkLCBtb2RlKSB7XG4gICAgcmV0dXJuIGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKGBkaXNwbGF5cy8ke2lkfS9tYWNyb3MvJHttb2RlfWApO1xuICB9XG5cbiAgZGlzcGxheU93bmVycyhpZCkge1xuICAgIHJldHVybiBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZihgZGlzcGxheXMvJHtpZH0vb3duZXJzYCk7XG4gIH1cblxuICBtYWNyb3MoKSB7XG4gICAgcmV0dXJuIGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCdtYWNyb3MnKTtcbiAgfVxuXG4gIGhhcmR3YXJlcygpIHtcbiAgICByZXR1cm4gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoJ2hhcmR3YXJlJyk7XG4gIH1cblxuICBoYXJkd2FyZShpZCkge1xuICAgIHJldHVybiBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZihgaGFyZHdhcmUvJHtpZH1gKTtcbiAgfVxuXG4gIHVzZXJJZGVudGl0eShpZCkge1xuICAgIHJldHVybiBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZihgdXNlcnMvcHVibGljLyR7aWR9L2lkZW50aXR5YCk7XG4gIH1cbiAgdXNlckRpc3BsYXlzKGlkKSB7XG4gICAgcmV0dXJuIGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKGB1c2Vycy9wcml2YXRlLyR7aWR9L2Rpc3BsYXlzYCk7XG4gIH1cbn1cblxuZXhwb3J0IHsgUmVzb3VyY2UgYXMgZGVmYXVsdCB9XG4iLCJpbXBvcnQgRGlzcGxheSBmcm9tICcuL2NvbXBvbmVudHMvZGlzcGxheSc7XG5cbmZpcmViYXNlLmluaXRpYWxpemVBcHAoe1xuICBhcGlLZXk6IFwiQUl6YVN5QU5vYjREYkNCdnBVVTFQSmpxNnA3N3FwVHdzTXJjSmZJXCIsXG4gIGF1dGhEb21haW46IFwibGVkLWZpZXN0YS5maXJlYmFzZWFwcC5jb21cIixcbiAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly9sZWQtZmllc3RhLmZpcmViYXNlaW8uY29tXCIsXG4gIHN0b3JhZ2VCdWNrZXQ6IFwibGVkLWZpZXN0YS5hcHBzcG90LmNvbVwiXG59KTtcblxudmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheSgkKCcjZGlzcGxheScpLCAnLUtRQnF6M0kzYVNNZ1d2UFFLeHonKTtcblxuZGlzcGxheS5kZW1vKCd0d2lua2xlJywge3NlZWRDb2xvcjogJyNGRkZGRkYnfSwgJCgnLmRlbW8nKS53aWR0aCgpLCB7IHdpZHRoOiAxMjgsIGhlaWdodDogMzIgfSwgKCkgPT4ge1xuICAvLyBTb21ldGhpbmcuLi5cbn0pO1xuIl19
