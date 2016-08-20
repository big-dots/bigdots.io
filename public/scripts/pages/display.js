import SoftwareDisplay from '../components/software-display';
import ConnectedHardware from '../components/connected-hardware';
import EditDisplay from '../components/edit-display';
import Resource from '../lib/resource';

class Display {
  constructor($el, config) {
    this.id = config.id;
    this.$el = $el;
  }

  render() {
    this.$el.html(`
      <div class="frame" style="display: none;">
      <div class="display-meta">
        <div class="edit-display pull-right"></div>
        <h4 class="display-name text-left"></h4>
      </div>
        <div class='matrix'></div>
        <div class="display-meta">
          <div class="connected-hardware pull-right"></div>
        </div>
      </div>
    `);

    var softwareDisplay = new SoftwareDisplay(this.$el.find('.matrix'), this.id);

    var displayRef = new Resource().display(this.id);
    displayRef.on('value', (snapshot) => {
      var displayData = snapshot.val();

      var dimensions = {
        width: displayData.width,
        height: displayData.height
      };

      softwareDisplay.load($('.frame').width(), dimensions, () => {
        this.$el.find('.display-name').text(displayData.name);
        this.$el.find('.display-mode').text(displayData.mode);
        this.$el.find('.frame').fadeIn();
      });


      var hardwareKeys = [];
      for(let key in displayData.connectedHardware) {
        hardwareKeys.push(key);
      }

      var connectedHardware = new ConnectedHardware(this.$el.find('.connected-hardware'), hardwareKeys);
      connectedHardware.render();

      var editDisplay = new EditDisplay(this.$el.find('.edit-display'), this.id, displayData);
      editDisplay.render();
    });
  }
}

export { Display as default }
