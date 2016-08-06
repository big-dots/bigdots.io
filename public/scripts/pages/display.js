import Matrix from '../components/matrix';
import MatrixControls from '../components/matrix-controls';
import ConnectedHardware from '../components/connected-hardware';
import Resource from '../lib/resource';

class Display {
  constructor($el, config) {
    this.id = config.id;
    this.$el = $el;
  }

  render() {
    this.$el.html(`
      <div class="frame" style="display: none;">
        <div class="matrix-controls"></div>
        <div class='matrix'></div>
        <div class="display-meta">
          <div class="connected-hardware pull-right"></div>
          <h4 class="display-name text-left"></h4>
        </div>
      </div>
    `);

    var matrix = new Matrix(this.$el.find('.matrix'));

    var displayRef = new Resource().display(this.id);
    displayRef.on('value', (snapshot) => {
      var displayData = snapshot.val();

      var matrixControls = new MatrixControls(this.$el.find('.matrix-controls'), displayData);
      matrixControls.render();
      matrixControls.attach({
        onBrightnessChange: function(brightness) {
          displayRef.update({brightness: parseInt(brightness, 10)});
          matrix.refreshBrightness(brightness);
        },
        onColorChange: function(color) {
          matrix.updateEditColor(color);
        }
      });

      matrix.load(displayData, $('.frame').width(), () => {
        this.$el.find('.display-name').text(displayData.name);
        this.$el.find('.frame').fadeIn();
        matrix.attach();
      });


      var hardwareKeys = [];
      for(let key in displayData.connectedHardware) {
        hardwareKeys.push(key);
      }

      var connectedHardware = new ConnectedHardware(this.$el.find('.connected-hardware'), hardwareKeys);
      connectedHardware.render();
    });
  }
}

export { Display as default }
