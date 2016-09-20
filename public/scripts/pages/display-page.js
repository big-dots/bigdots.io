import DisplayCoupler from 'display-coupler';
import DotMatrix from 'dot-matrix';
import Page from './page';
import EditDisplayModal from '../modals/edit-display-modal';
import ApiUsageModal from '../modals/api-usage-modal';
import DisplayManager from '../managers/display-manager';

var displayManager = new DisplayManager();

class DisplayPage extends Page {
  constructor(config) {
    super();
    this.id = config.id;
  }

  render() {
    this.$el.html(`
      <div class="frame" style="display: none;">
        <div class="display-meta" style="display: none;">
          <a href="#" class="btn btn-link pull-right change-macro" data-toggle="modal" data-target="#edit-display">
            <span class="display-macro"></span>
            <i class="fa fa-pencil"></i>
          </a>
          <span class="display-name text-left"></span>
        </div>
        <div class='matrix-container'></div>
        <div class="display-meta" style="display: none;">
          <a href="#" class="btn btn-link pull-right api-usage" data-toggle="modal" data-target="#api-usage">
            Using the API...
          </a>
        </div>
        <div class="edit-display-modal"></div>
        <div class="api-usage-modal"></div>
      </div>
    `);

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.$('.display-meta').show();
      } else {
        this.$('.display-meta').hide();
      }
    });

    var dotMatrix = new DotMatrix(this.$('.matrix-container'));

    displayManager.getDisplay(this.id, (displayData) => {
      dotMatrix.render($('.frame').width(), {
        width: displayData.width,
        height: displayData.height
      });

      var displayCoupler = new DisplayCoupler(firebase.database());
      displayCoupler.connect(this.id, {
        onReady: function(displayData, next) {
          next()
        },
        onPixelChange: (y, x, hex) => {
          dotMatrix.updateDot(y, x, hex);
        }
      });

      this.$('.display-name').text(displayData.name);
      this.$('.display-macro').text(displayData.macro);
      this.$('.frame').fadeIn();

      var $editDisplayModal = this.$('.edit-display-modal');
      new EditDisplayModal($editDisplayModal, this.id, displayData).render();

      var $apiUsageModal = this.$('.api-usage-modal');
      new ApiUsageModal($apiUsageModal, this.id, displayData).render();
    });
  }
}

export { DisplayPage as default }
