import ColorPicker from './color-picker';

class MatrixControls {
  constructor($el, displayData) {
    this.$el = $el;
    this.displayData = displayData
  }

  load() {
    this.render();
    this.attach();
  }

  render() {
    this.$el.html(`
      <div style="height: 50px;">
        <ul class="controls">
          <li class="color-picker"></li>
          <li>
            <input type="range" min="0" max="100" value="${this.displayData.brightness}" id="brightness">
          </li>
        </ul>
      </div>
    `);

    this.colorPicker = new ColorPicker($('.color-picker'));
    this.colorPicker.render();
  }

  attach(callbacks) {
    this.colorPicker.attach(function(hex) {
      callbacks.onColorChange(hex);
    })

    this.$el.find('#brightness').on('change', (ev) => {
      var brightness = $(ev.currentTarget).val();
      callbacks.onBrightnessChange(brightness);
    });
  }
}

export { MatrixControls as default }
