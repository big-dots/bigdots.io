import Display from '../components/display';
import ChangeMacroModal from '../modals/change-macro-modal';
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
        <div class="display-meta">
          <a href="#" class="btn btn-link pull-right change-macro" data-toggle="modal" data-target="#edit-display">
            <span class="display-macro"></span>
            <i class="fa fa-pencil"></i>
          </a>
          <h4 class="display-name text-left"></h4>
        </div>
        <div class='matrix'></div>
        <div class="change-macro-modal"></div>
      </div>
    `);

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

      var $modal = this.$el.find('.change-macro-modal');
      new ChangeMacroModal($modal, this.id, displayData).render();
    });
  }
}

export { DisplayPage as default }