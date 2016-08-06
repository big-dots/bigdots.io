class Matrix {
  constructor($el, displayData) {
    this.$el = $el;
    this.displayData = displayData;
  }

  render(matrixData) {
    this.matrixData = matrixData;

    var columns = this.displayData.chains * this.displayData.columns;

    var size = Math.floor($('.frame').width() / columns);
    for(var y = 0; y < this.displayData.rows; y++) {
      var $row = $(`<div class="display-row" style="opacity: ${(50 + (this.displayData.brightness / 2)) / 100}; height: ${size}px; line-height: ${size}px;">`);
      for(var x = 0; x < columns; x++) {
        var rgba = buildBackgroundColor(matrixData[`${y}:${x}`].hex);
        var $displayDotWrapper = $(`<span class="display-dot-wrapper" style="width: ${size}px; height: ${size}px;">`);
        $displayDotWrapper.append($(`<div class="display-dot" data-y="${y}" data-x="${x}" style="background-color: ${rgba}">`));
        $row.append($displayDotWrapper);
      }
      this.$el.append($row);
    }
  }

  updateDot($el, dragging=false) {
    $el = $el.find('.display-dot');
    var data = $el.data();

    if(dragging) {
      $el.addClass('on');
    } else {
      $el.toggleClass('on');
    }

    var hex = '#000000';

    if($el.hasClass('on')) {
      hex = this.colorPicker.getSelectedColor();
    }

    this.updatePixel(data.y, data.x, hex);
  }

  updatePixel(y, x, hex) {
    var $el = $(`[data-y=${y}][data-x=${x}]`);
    $el.css({ backgroundColor: buildBackgroundColor(hex) });
  }
}

function buildBackgroundColor(hex) {
  var color;

  if(hex === '#000000') {
    color = `#444`
  } else {
    color = hex;
  }

  return color;
}

export { Matrix as default }
