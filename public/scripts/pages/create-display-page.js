import Page from 'page';
import page from 'page';
import DisplayManager from '../managers/display-manager';
import Resource from '../lib/resource';

class CreateDisplayPage extends Page {
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
            <button type="submit" class="btn btn-success pull-right">Create Display</button>
          </form>
        </div>
      </div>
    `);

    this.$el.find('form').submit((ev) => {
      ev.preventDefault();

      let displayName = $('#display-name').val(),
          displayWidth = parseInt($('#display-width').val(), 10),
          displayHeight = parseInt($('#display-height').val(), 10);

      var matrixData = assembleMartix(displayWidth, displayHeight),
          uid = firebase.auth().currentUser.uid;

      new DisplayManager().create(matrixData, {
        brightness: 100,
        name: displayName,
        width: displayWidth,
        height: displayHeight
      }, uid, function(displayKey) {
        page(`/displays/${displayKey}`);
      });
    });
  }
}

function assembleMartix(width, height) {
  var matrix = {};
  for(var y = 0; y < height; y++) {
    for(var x = 0; x < width; x++) {
      matrix[`${y}:${x}`] = {
        hex: '#000000',
        updatedAt: Date.now()
      };
    }
  }

  return matrix;
}

export { CreateDisplayPage as default }
