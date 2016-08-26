import Display from '../components/display';
import ChangeMacroModal from '../modals/change-macro-modal';
import ApiUsageModal from '../modals/api-usage-modal';
import DisplayManager from '../managers/display-manager';

var displayManager = new DisplayManager();

class DisplayPage {
  constructor($el, config) {
    this.id = config.id;
    this.$el = $el;
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
        <div class='matrix'></div>
        <div class="display-meta" style="display: none;">
          <a href="#" class="btn btn-link pull-right api-usage" data-toggle="modal" data-target="#api-usage">
            Using the API...
          </a>
        </div>
        <div class="change-macro-modal"></div>
        <div class="api-usage-modal"></div>
      </div>
    `);

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.$el.find('.display-meta').show();
      } else {
        this.$el.find('.display-meta').hide();
      }
    });

    var display = new Display(this.$el.find('.matrix'), this.id);

    displayManager.getDisplay(this.id, (displayData) => {
      var dimensions = {
        width: displayData.width,
        height: displayData.height
      };

      display.load($('.frame').width(), dimensions, () => {
        this.$el.find('.display-name').text(displayData.name);
        this.$el.find('.display-macro').text(displayData.macro);
        this.$el.find('.frame').fadeIn();
      });

      var $changeMacroModal = this.$el.find('.change-macro-modal');
      new ChangeMacroModal($changeMacroModal, this.id, displayData).render();

      var $apiUsageModal = this.$el.find('.api-usage-modal');
      new ApiUsageModal($apiUsageModal, this.id, displayData).render();
    });
  }
}

export { DisplayPage as default }
