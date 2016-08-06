import Color from '../lib/color';
import Resource from '../lib/resource';

class Matrix {
  constructor($el) {
    this.$el = $el;
  }

  load(displayData, width, callback) {
    this.matrixKey = displayData.matrix;

    var matrixRef = new Resource().matrix(this.matrixKey);

    matrixRef.once('value').then((snapshot) => {
      this.render(snapshot.val(), width, displayData);
      callback();
    });

    matrixRef.on('child_changed', (snapshot) => {
      var hex = snapshot.val().hex,
          [y, x] = snapshot.key.split(':');

      this.refreshPixelByCoordinates(y, x, hex);
    });
  }

  render(matrixData, width, displayData) {
    this.$el.html('');

    var adjustedBrightness = (50 + (displayData.brightness / 2)) / 100,
        size = (width - 20) / displayData.width;

    for(var y = 0; y < displayData.height; y++) {
      var $row = $(`<div class="matrix-row" style="opacity: ${adjustedBrightness}; height: ${size}px; line-height: ${size}px;">`);
      for(var x = 0; x < displayData.width; x++) {
        $row.append(`
          <span class="matrix-dot-wrapper" style="width: ${size}px; height: ${size}px;">
            <div class="matrix-dot"
                        data-y="${y}"
                        data-x="${x}"
                        style="background-color: ${parseBackgroundColor(matrixData[`${y}:${x}`].hex)}">
          </span>
        `);
      }
      this.$el.append($row);
    }
  }

  attach(callbacks) {
    var dragging = false;
    this.$el.find('.matrix-dot').on("mousedown", (ev) => {
      dragging = true;

      this.updatePixelByElement($(ev.currentTarget), this.editColor)

      this.$el.find('.matrix-dot-wrapper').on("mouseenter", (ev) => {
          this.updatePixelByElement($(ev.currentTarget).find('.matrix-dot'), this.editColor)
      });
      this.$el.on('mouseup', (evt) => {
        dragging = false;
        $('.matrix-dot-wrapper').off("mouseenter");
      });
    });
  }

  refreshPixelByCoordinates(y, x, hex) {
    var $el = $(`[data-y=${y}][data-x=${x}]`);
    updatePixelColor($el, hex)
  }

  refreshBrightness(brightness) {
    var adjustedBrightness = (50 + (brightness / 2)) / 100;
    this.$el.find('.display-row').css({opacity: adjustedBrightness});
  }

  updatePixelByElement($el, hex) {
    var {y, x} = $el.data();

    new Resource().matrixPixel(this.matrixKey, y, x).set({
      hex: hex,
      updatedAt: Date.now()
    });

    updatePixelColor($el, hex)
  }

  updateEditColor(hex) {
    this.editColor = hex;
  }
}

function updatePixelColor($el, hex) {
  $el.css({ backgroundColor: parseBackgroundColor(hex) });
}

function parseBackgroundColor(hex) {
  return (hex === '#000000' ? `#444` : hex);
}

export { Matrix as default }
