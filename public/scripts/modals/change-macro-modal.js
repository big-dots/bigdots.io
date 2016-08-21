import page from 'page';
import DisplayManager from '../managers/display-manager';
import MacroManager from '../managers/macro-manager';

var macroManager = new MacroManager();

class ChangeMacroModal {
  constructor($el, displayKey, displayData) {
    this.$el = $el;
    this.displayKey = displayKey;
    this.displayData = displayData;
  }

  render() {
    this.$el.html(`
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
                  <div class="col-xs-12">
                    <fieldset class="form-group">
                      <label for="macro">Select macro</label>
                      <select name="macro" class="form-control" id="macro"></select>
                    </fieldset>
                  </div>
                </div>
                <div class="programmable options row" style="display: none;">
                  <div class="col-xs-12">
                    <p class="programmable description"></p>
                    <p>Warning you need programming skills to use this display macro. Learn more about this option <a href="#">here.</a>
                  </div>
                </div>
                <div class="twinkle options row" style="display: none;">
                  <div class="col-xs-12">
                    <p class="twinkle description"></p>
                    <fieldset class="form-group">
                      <h5>Macro options</h5>
                      <label for="twinkle-base-color">Seed Color</label>
                      <div class="input-group colorpicker-component">
                        <input type="text" id="twinkle-seed-color" value="#006e91" class="form-control" />
                        <span class="input-group-addon"><i></i></span>
                      </div>
                      <small class="text-muted">The brightest hex value you want to display</small>
                    </fieldset>
                  </div>
                </div>
                <div class="solid-color options row" style="display: none;">
                  <div class="col-xs-12">
                    <p class="solid-color description"></p>
                    <fieldset class="form-group">
                      <h5>Macro options</h5>
                      <label for="solid-color">Color</label>
                      <div class="input-group colorpicker-component">
                        <input type="text" id="solid-color" value="#006e91" class="form-control" />
                        <span class="input-group-addon"><i></i></span>
                      </div>
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

    this.populateMacros();

    this.$el.find('#edit-display').on('show.bs.modal', () => {
      this.$el.find('select#macro').val(this.displayData.macro).change();
    });

    this.$el.find('#edit-display').on('shown.bs.modal', () => {
      $('select').select2();
    });

    this.$el.find('.colorpicker-component').colorpicker();

    var $twinkleOptions = this.$el.find('.options.twinkle'),
        $programmableOptions = this.$el.find('.options.programmable'),
        $solidColorOptions = this.$el.find('.options.solid-color');

    this.$el.find('select#macro').change(function(el) {
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

    this.$el.find('form').submit((ev) => {
      ev.preventDefault();

      var macro = $('select#macro').val();

      var newData = { macro: macro };
      if(macro === 'twinkle') {
        newData.macroConfig = {seedColor: this.$el.find('#twinkle-seed-color').val() };
      } else if(macro === 'solid-color') {
        newData.macroConfig = {color: this.$el.find('#solid-color').val() };
      }

      new DisplayManager().update(this.displayKey, newData, (displayKey) => {
        this.$el.find('#edit-display').modal('hide');

        // Why doesn't this happen automatically?!
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();

        page(`/displays/${this.displayKey}`);
      });
    });
  }

  populateMacros() {
    var $macrosSelect = this.$el.find('select#macro');
    macroManager.getInstalledMacros((macros) => {
      for(let key in macros) {
        $macrosSelect.append(`<option value=${key}>${macros[key].name}</option>`);
        this.$el.find(`.description.${key}`).text(macros[key].description);
      }
    });
  }
}

export { ChangeMacroModal as default }
