class ColorPicker {
  constructor($el) {
    this.$el = $el
  }

  render() {
    var colors = ['#990000', '#CC4400', '#FFAA00', '#CCCC00', '#88CC00', '#00CC88', '#0066CC', '#CC00CC', '#000000'];
    this.$el.html(`
      <ul class="colors"></ul>
    `);

    var $colors = this.$el.find('ul');
    colors.forEach(function(color) {
      var displayColor = color;

      if(color === '#000000') {
          displayColor = '#444444';
      }

      $colors.append(`
        <li>
          <div class="color-selector" style="background-color: ${displayColor};" data-hex="${color}"></div>
        </li>
      `);
    });

    this.$el.find('ul li:first-child').addClass('selected');
  }

  attach(callback) {
    this.$el.find('ul.colors li').on("click", (ev) => {
      let $el = $(ev.currentTarget);
      this.$el.find("ul.colors .selected").removeClass('selected');
      $el.addClass('selected');
      callback($el.find('.color-selector').data('hex'));
    });
  }

  getSelectedColor() {
    return $('ul.colors .selected .color-selector').data('hex')
  }
}

export { ColorPicker as default }
