import Display from '../components/display';
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

    var display = new Display(this.$('.matrix-container'), this.id);

    displayManager.getDisplay(this.id, (displayData) => {
      var dimensions = {
        width: displayData.width,
        height: displayData.height
      };

      display.load($('.frame').width(), dimensions, () => {
        this.$('.display-name').text(displayData.name);
        this.$('.display-macro').text(displayData.macro);
        this.$('.frame').fadeIn();
      });

      var $editDisplayModal = this.$('.edit-display-modal');
      new EditDisplayModal($editDisplayModal, this.id, displayData).render();

      var $apiUsageModal = this.$('.api-usage-modal');
      new ApiUsageModal($apiUsageModal, this.id, displayData).render();
    });
  }
}

export { DisplayPage as default }
