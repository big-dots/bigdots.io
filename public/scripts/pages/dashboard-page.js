import DisplayManager from '../managers/display-manager';
import Page from './page';

var displayManager = new DisplayManager();

class DashboardPage extends Page {
  render() {
    this.$el.html(`
      <div class="displays"></div>
    `);

    var uid = firebase.auth().currentUser.uid;
    displayManager.getUserDisplays(uid, (displayKeys, displays) => {
      var $displays = this.$el.find('.displays');
      displays.forEach((display, i) => {
        $displays.append(`
          <a href="/displays/${displayKeys[i]}">${display.name}</a>
        `);
      });
    });
  }
}

export { DashboardPage as default }
