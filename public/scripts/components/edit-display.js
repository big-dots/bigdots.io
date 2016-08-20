import page from 'page';
import DisplayManager from '../managers/display-manager';

class EditDisplay {
  constructor($el, displayKey, displayData) {
    this.$el = $el;
    this.displayKey = displayKey;
    this.displayData = displayData;
  }
  render() {
    this.$el.html(`
      <a href="#" class="btn btn-link" data-toggle="modal" data-target="#edit-display">
        <span class="display-mode">${this.displayData.mode}</span>
        <i class="fa fa-pencil"></i>
      </a>
      <div id="edit-display" class="modal fade">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 class="modal-title">Edit Display</h4>
            </div>
            <div class="modal-body">
              <form>
                <div class="row">
                  <div class="col-xs-12 col-sm-6">
                    <fieldset class="form-group">
                      <label for="display-mode">Select mode</label>
                      <select name="display-mode" class="form-control" id="display-mode">
                        <option value="programmable">Programmable</option>
                        <option value="twinkle">Twinkle</option>
                        <option value="solid-color">Solid color</option>
                      </select>
                    </fieldset>
                  </div>
                </div>
                <div class="programmable-options row" style="display: none;">
                  <div class="col-xs-12 col-sm-6">
                    <p>Warning you need programming skills to use this display mode. Learn more about this option <a href="#">here.</a>
                  </div>
                </div>
                <div class="twinkle-options row" style="display: none;">
                  <div class="col-xs-12 col-sm-6">
                    <fieldset class="form-group">
                      <h5>Twinkle Options</h5>
                      <label for="twinkle-base-color">Seed Color</label>
                      <input class="form-control" type="text" id="twinkle-seed-color" placeholder="#FFFFFF" />
                      <small class="text-muted">The brightest hex value you want to display</small>
                    </fieldset>
                  </div>
                </div>
                <div class="solid-color-options row" style="display: none;">
                  <div class="col-xs-12 col-sm-6">
                    <fieldset class="form-group">
                      <h5>Solid Color Options</h5>
                      <label for="solid-color">Color</label>
                      <input class="form-control" type="text" id="solid-color" placeholder="#6b005c" />
                    </fieldset>
                  </div>
                </div>
                <button type="submit" class="btn btn-success">Update</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `);

    this.$el.find('#edit-display').on('shown.bs.modal', function() {
      $('select').select2();
    });

    var $twinkleOptions = this.$el.find('.twinkle-options'),
        $programmableOptions = this.$el.find('.programmable-options'),
        $solidColorOptions = this.$el.find('.solid-color-options');

    this.$el.find('select#display-mode').change(function(el) {
      $twinkleOptions.hide();
      $programmableOptions.hide();
      $solidColorOptions.hide();

      if(this.value === 'twinkle') {
        $twinkleOptions.show();
      } else if(this.value == 'programmable') {
        $programmableOptions.show();
      } else if(this.value == 'solid-color') {
        $solidColorOptions.show();
      }
    });

    this.$el.find('select#display-mode').val(this.displayData.mode).change();

    this.$el.find('form').submit((ev) => {
      ev.preventDefault();
      debugger

      var mode = $('#display-mode').val();

      function saveDisplay() {
        var newData = { mode: mode };

        new DisplayManager(this.displayKey).update(newData, (displayKey) => {
          this.$el.find('#edit-display').modal('hide');

          // Why doesn't this happen automatically?!
          $('body').removeClass('modal-open');
          $('.modal-backdrop').remove();

          page(`/displays/${this.displayKey}`);
        });
      }

      var modeConfig = {};
      if(mode === 'twinkle') {
        modeConfig = {seedColor: this.$el.find('#twinkle-seed-color').val() };
      } else if(mode === 'solid-color') {
        modeConfig = {color: this.$el.find('#solid-color').val() };
      }

      new DisplayManager(this.displayKey).updateModeConfig(mode, modeConfig, () => {
        saveDisplay.apply(this);
      });
    });
  }
}

export { EditDisplay as default }
