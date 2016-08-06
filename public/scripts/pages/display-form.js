import page from 'page';
import Resource from '../lib/resource';

class DisplayForm {
  constructor($el) {
    this.$el = $el;
  }

  render() {
    this.$el.html(`
      <h1>
        Create a Display
      </h1>
      <hr />
      <div class="row">
        <div class="col-xs-12 col-sm-6">
          <form>
            <fieldset class="form-group">
              <label for="name">Display name</label>
              <input type="text" class="form-control" id="display-name" placeholder="My cool display" />
              <small class="text-muted">This will function as a label</small>
            </fieldset>
            <div class="row">
              <div class="col-xs-12 col-sm-6">
                <fieldset class="form-group">
                  <label for="display-width">Select width</label>
                  <select class="form-control" id="display-width" name="width">
                    <option value="16">16</option>
                    <option value="32">32</option>
                    <option value="64">64</option>
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
                  </select>
                </fieldset>
              </div>
              <div class="col-xs-12">
                <fieldset class="form-group">
                  <label for="connect-hardware">Connect Hardware</label>
                  <select class="form-control" id="connect-hardware" name="connect-hardware" multiple="multiple">
                  </select>
                </fieldset>
              </div>
            </div>
            <button type="submit" class="btn btn-success pull-right">Create Matrix</button>
          </form>
        </div>
      </div>
    `);

    this.populateHardwareOptions();

    this.$el.find('form').submit((ev) => {
      ev.preventDefault();

      let displayName = $('#display-name').val(),
          displayWidth = parseInt($('#display-width').val(), 10),
          displayHeight = parseInt($('#display-height').val(), 10);


      var matrixData = {};
      for(var y = 0; y < displayWidth; y++) {
        for(var x = 0; x < displayWidth; x++) {
          matrixData[`${y}:${x}`] = {
            hex: '#000000',
            updatedAt: Date.now()
          };
        }
      }

      var matrixKey = firebase.database().ref('matrices').push().key,
          displayKey = firebase.database().ref('displays').push().key;

      firebase.database().ref(`matrices/${matrixKey}`).set(matrixData);
      firebase.database().ref(`displays/${displayKey}`).set({
        matrix: matrixKey,
        brightness: 100,
        name: displayName,
        width: displayWidth,
        height: displayHeight
      });

      page(`/displays/${displayKey}`);
    });
  }

  populateHardwareOptions() {
    var $hardwareSelect = this.$el.find('select#connect-hardware');

    new Resource().hardwares().once('value').then((snapshot) => {
      var hardwares = snapshot.val();

      for(let key in hardwares) {
        var size = `${hardwares[key].rows}x${hardwares[key].columns * hardwares[key].chains}`
        $hardwareSelect.append(`<option value=${key}>${key} ${size}</option>`);
      }
    });
  }
}

export { DisplayForm as default }
