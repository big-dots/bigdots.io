import Resource from '../lib/resource';
import SoftwareDisplay from '../components/software-display';

class DisplayList {
  constructor($el) {
    this.$el = $el;
  }

  render() {
    this.$el.html(`
      <h1>
        <a href="/displays/new" class="btn btn-primary pull-right">Add Display</a>
        Displays
      </h1>
      <hr />
      <div class="row list-group"></div>
    `);

    var displaysRef = new Resource().displays();
    displaysRef.once('value').then((snapshot) => {
      var displays = snapshot.val();

      for(let key in displays) {
        let display = displays[key],
            mode = display.mode,
            name = display.name,
            modeConfig = encodeURIComponent(JSON.stringify(displays[key].modes[mode])),
            connectedCount = Object.keys(displays[key].connectedHardware).length;

        this.$el.find('.list-group').append(`
          <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
            <div class="card">
              <div class="card-img-top">
                <div data-key="${key}" data-mode="${mode}" data-height="${display.height}" data-width="${display.width}" data-config="${modeConfig}"></div>
              </div>
              <div class="card-block">
                <h4 class="card-title">${name}</h4>
                <p class="card-text">${connectedCount} connected hardware</p>
                <a href="/displays/${key}" class="btn btn-link">View / Edit</a>
              </div>
            </div>
          </div>
        `);
      }

      for(let key in displays) {
        var $el = this.$el.find(`[data-key="${key}"]`),
            data = $el.data(),
            dimensions = {
              width: data.width,
              height: data.height
            };

        var width = $el.parent().width();
        new SoftwareDisplay($el, data.mode, data.config).load(width, dimensions, function() {

        });
      }
    });
  }
}

export { DisplayList as default }
