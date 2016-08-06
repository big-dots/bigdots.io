import Resource from '../lib/resource';
import Matrix from '../components/matrix';

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
      var connectedCount = Object.keys(displays['-KJYAuwg3nvgTdSaGUU9'].connectedHardware);
      for(let key in displays) {
        this.$el.find('.list-group').append(`
          <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
            <div class="card">
              <div class="card-img-top">
                <div data-matrix="${displays[key].matrix}"></div>
              </div>
              <div class="card-block">
                <h4 class="card-title">${displays[key].name}</h4>
                <p class="card-text">${connectedCount.length} connected hardware</p>
                <a href="/displays/${key}" class="btn btn-link">View / Edit</a>
              </div>
            </div>
          </div>
        `);
      }

      for(let key in displays) {
        var $el = this.$el.find(`[data-matrix="${displays[key].matrix}"]`),
            width = $el.parent().width();

        new Matrix($el).load(displays[key], width, function() {
          // Something?
        });
      }
    });
  }
}

export { DisplayList as default }
