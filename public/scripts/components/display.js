import Resource from '../lib/resource';
import DisplayCoupler from 'display-coupler';

class Display {
  constructor($el, displayKey) {
    this.$el = $el;
    this.displayKey = displayKey;
  }

  load(width, dimensions, callback) {
    this.render(width, dimensions);

    var displayCoupler = new DisplayCoupler(firebase.database());
    displayCoupler.connect(this.displayKey, {
      onReady: function(displayData, next) {
        next()
      },
      onPixelChange: (y, x, hex, displayData) => {
        displayData = displayData || {};
        this.refreshPixelByCoordinates(y, x, hex, displayData);
      }
    });
    callback();
  }

  demo(macro, macroConfig, width, dimensions, callback) {
    var displayConfig = {
      macro: macro,
      macroConfig: macroConfig,
      width: dimensions.width,
      height: dimensions.height
    };
    
    this.render(width, dimensions);

    var displayCoupler = new DisplayCoupler();
    displayCoupler.demo(displayConfig, {
      onReady: function(displayData, next) {
        next()
      },
      onPixelChange: (y, x, hex, displayData) => {
        displayData = displayData || {};
        this.refreshPixelByCoordinates(y, x, hex, displayData);
      }
    });
    callback();
  }

  render(width, dimensions) {
    this.$el.html(`
      <div class="display">
        <div class="top"></div>
        <div class="right"></div>
        <div class="front"></div>
      </div>
    `);

    var adjustedBrightness = (50 + (100 / 2)) / 100,
        size = (width - 20) / dimensions.width;

    for(var y = 0; y < dimensions.height; y++) {
      var $row = $(`<div class="matrix-row" style="opacity: ${adjustedBrightness}; height: ${size}px; line-height: ${size}px;">`);
      for(var x = 0; x < dimensions.width; x++) {
        $row.append(`
          <span class="matrix-dot-wrapper" style="width: ${size}px; height: ${size}px;">
            <div class="matrix-dot" data-y="${y}" data-x="${x}" data-coordinates="${y}:${x}" style="background-color: #444">
          </span>
        `);
      }
      this.$el.find('.front').append($row);
    }
  }

  refreshPixelByCoordinates(y, x, hex, displayData) {
    var el = document.querySelectorAll(`[data-coordinates='${y}:${x}']`);
    if(el.length > 0) {
      el[0].style.background = (hex === '#000000' ? `#444` : hex);
    }
  }
}

function shadeHex(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

export { Display as default }
