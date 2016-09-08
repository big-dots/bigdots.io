import page from 'page';
import Modal from './modal';
import DisplayManager from '../managers/display-manager';

class ApiUsageModal extends Modal {
  constructor($el, displayKey, displayData) {
    super($el);
    this.displayKey = displayKey;
    this.displayData = displayData;
  }

  $(selector) {
    return this.$el.find(selector);
  }

  render() {
    this.$el.html(`
      <div id="api-usage" class="modal fade">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 class="modal-title">Using the API</h4>
            </div>
            <div class="modal-body">
              <p class="alert alert-danger">
                Treat <strong>${this.displayData.matrix}</strong> like an <strong>API SECRET</strong>. Whoever possesses it can write to this LED board.
              </p>
              <h5>Updating one point</h5>
              <p>To update a specific point on your Display, replace <strong>Y</strong> and <strong>X</strong> with the coordinate to update</p>
              <pre>
https://led-fiesta.firebaseio.com/matrices/${this.displayData.matrix}/Y:X.json'</pre>
              </pre>
              <p>Then just perform a PATCH request to update the point and pass json with the <strong>hex</strong> color and the <strong>updatedAt</strong> timestamp. Here is a curl example that you can run from the commandline.</p>
              <pre>
curl -X PATCH -d '{
  "hex": "#FFFFFF",
  "updatedAt": ${new Date().getTime()}
}' \
  'https://led-fiesta.firebaseio.com/matrices/${this.displayData.matrix}/0:0.json'
              </pre>
              <h5>Updating multiple points</h5>
              <pre>
curl -X PATCH -d '{
  "0:0": {
    "hex": "#FFFFFF",
    "updatedAt": ${new Date().getTime()}
  },
  "0:1": {
    "hex": "#FFFFFF",
    "updatedAt": ${new Date().getTime()}
  },
  "0:2": {
    "hex": "#FFFFFF",
    "updatedAt": ${new Date().getTime()}
  }
}' \
  'https://led-fiesta.firebaseio.com/matrices/${this.displayData.matrix}.json'
              </pre>
            </div>
          </div>
        </div>
      </div>
    `);
  }
}

export { ApiUsageModal as default }
