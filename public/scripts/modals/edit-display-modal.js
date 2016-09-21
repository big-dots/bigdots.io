import page from 'page';
import Modal from './modal';
import DisplayManager from '../managers/display-manager';
import MacroManager from '../managers/macro-manager';
import Typewriter from 'typewriter';
import MacroLibrary from 'macro-library';
import MacroForm from 'macro-form';

var macroLibrary = new MacroLibrary();

var macroManager = new MacroManager(),
    displayManager = new DisplayManager();

class EditDisplayModal extends Modal {
  constructor($el, displayKey, displayData) {
    super($el);
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
              <ul class="nav nav-tabs">
                <li class="nav-item">
                  <a class="nav-link active" data-toggle="tab" href="#edit-general">General</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" data-toggle="tab" href="#edit-owners">Owners</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" data-toggle="tab" href="#edit-macro">Macro</a>
                </li>
              </ul>
              <div class="tab-content">
                <br />
                <div id="edit-general" class="tab-pane active">
                  <div class="row">
                    <div class="col-xs-12">
                      <fieldset class="form-group">
                        <label for="display-name">Display name</label>
                        <input type="name" name="display-name" class="form-control" id="display-name" />
                      </fieldset>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-xs-12 col-sm-6">
                      <fieldset class="form-group">
                        <label for="display-width">Select width</label>
                        <select class="form-control" id="display-width" name="width">
                          <option value="16">16</option>
                          <option value="32">32</option>
                          <option value="64">64</option>
                          <option value="96">96</option>
                          <option value="128">128</option>
                        </select>
                      </fieldset>
                    </div>
                    <div class="col-xs-12 col-sm-6">
                      <fieldset class="form-group">
                        <label for="display-height">Select height</label>
                        <select class="form-control" id="display-height" name="height">
                          <option value="16">16</option>
                          <option value="32">32</option>
                          <option value="64">64</option>
                          <option value="96">96</option>
                          <option value="128">128</option>
                        </select>
                      </fieldset>
                    </div>
                  </div>
                </div>
                <div id="edit-owners" class="tab-pane">
                  <ul id="display-owners" class="list-group"></ul>
                </div>
                <div id="edit-macro" class="tab-pane">
                  <form id="macro">
                    <div class="row">
                      <div class="col-xs-12">
                        <fieldset class="form-group">
                          <label for="macro">Select macro</label>
                          <select name="macro" class="form-control" id="macro"></select>
                        </fieldset>
                      </div>
                    </div>
                    <div id="macro-form"></div>
                    <button type="submit" class="btn btn-success">Update</button>
                  </form>
                </div>
              </div>
              <br /><br />
            </div>
          </div>
        </div>
      </div>
    `);

    this.populateMacros();
    this.populateOwners();

    this.$('#edit-display').on('show.bs.modal', () => {
      this.$('select#macro').val(this.displayData.macro).change();
      this.$('select#display-width').val(this.displayData.width).change();
      this.$('select#display-height').val(this.displayData.height).change();
    });
    this.$('#display-name').val(this.displayData.name)


    var macroForm;

    this.$('select#macro').change((el) => {
      var selectedMacro = $(el.currentTarget).find(':selected').val();
      var config = macroLibrary.macroConfig(selectedMacro);
      macroForm = new MacroForm($('#macro-form'), selectedMacro, config);
      macroForm.render();
      this.$('.colorpicker-component').colorpicker();
    });

    this.$('form#macro').submit((ev) => {
      ev.preventDefault();
      var newData = {
        macroConfig: macroForm.serialData(),
        macro: macroForm.macro
      }
      displayManager.update(this.displayKey, newData, (displayKey) => {
        this.$('#edit-display').modal('hide');

        // Why doesn't this happen automatically?!
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();

        page(`/displays/${this.displayKey}`);
      });
    });
  }

  populateMacros() {
    var $macrosSelect = this.$('select#macro');
    macroManager.getInstalledMacros((macros) => {
      for(let key in macros) {
        $macrosSelect.append(`<option value=${key}>${macros[key].name}</option>`);
        this.$(`.description.${key}`).text(macros[key].description);
      }
    });
  }

  populateOwners() {
    displayManager.getOwners(this.displayKey, (userskeys, users) => {
      var $displayOwners = this.$('#display-owners');
      users.forEach(function(user) {
        $displayOwners.append(`
          <li class="list-group-item">
            <img src="${user.profileImageUrl}" style="width: 40px; height: 40px; border-radius: 20px;" />
            ${user.name}
          </li>
        `);
      });
    });
  }
}

export { EditDisplayModal as default }
