import Resource from '../lib/resource';

class ConnectedHardware {
  constructor($el, ids) {
    this.$el = $el;
    this.ids = ids;
  }
  render() {
    this.$el.html(`
      <a href="#" class="btn btn-link" data-toggle="modal" data-target="#connected-hardware">
        Connected Hardware
        (${this.ids.length})
      </a>
      <div id="connected-hardware" class="modal fade">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 class="modal-title">Connected Hardware</h4>
            </div>
            <div class="modal-body">
              <ul class="hardware"></ul>
            </div>
          </div>
        </div>
      </div>
    `);

    this.ids.forEach((id) => {
      this.$el.find('.hardware-count').html(this.ids.count);
      var hardwareRef = new Resource().hardware(id);
      hardwareRef.on('value', (snapshot) => {
        var hardware = snapshot.val();

        this.$el.find('.hardware').append(`
          <li class="list-group-item">
            <span class="label label-default label-pill pull-right">
              ${hardware.rows}x${hardware.columns}
            </span>
            ${id}
          </li>
        `);
      });
    });
  }
}

export { ConnectedHardware as default }
