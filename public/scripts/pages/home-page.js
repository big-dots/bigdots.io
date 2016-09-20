import DisplayCoupler from 'display-coupler';
import DotMatrix from 'dot-matrix';

class HomePage {
  constructor() {
      this.$el = $('')
  }

  render() {
    this.$el.html(`
      <header class="navbar navbar-static-top navbar-dark logged-out" style="border-radius: 0;">
        <div class="pull-right">
          <a href="#" class="btn btn-secondary sign-in">Sign in</a>
        </div>
        <a class="navbar-brand" href="/">BIGDOTS</a>
        <div class="demo">
          <div class="matrix" style="width: 650px; margin: auto;"></div>
          <p style="font-size: 30px; margin: 30px 0;">A programmable LED display for... anything!</p>
        </div>
      </header>
    `);

    var dotMatrix = new DotMatrix(this.$('.matrix'));

    var key = '-KQBqz3I3aSMgWvPQKxz';
    displayManager.getDisplay(key, (displayData) => {
      dotMatrix.render(650, { width: 128, height: 32 });

      var displayCoupler = new DisplayCoupler(firebase.database());
      displayCoupler.connect(key, {
        onReady: function(displayData, next) {
          next()
        },
        onPixelChange: (y, x, hex) => {
          dotMatrix.updateDot(y, x, hex);
        }
      });
    });
  }
}

export { HomePage as default }
