import Page from './page';

class HowToBuildADisplayPage extends Page {
  render() {
    this.$el.html(`
      <div class="container-fluid">
        <div class="row">
          <div class="col-lg-6 offset-lg-3" style="margin-top: 100px;">
            <h1>How To Build An LED Display</h1>
            <p>Taking it to the next level is easy, let's get going..</p>
            <hr style="margin-bottom: 40px;" />
            <h4 style="margin: 20px 0;">You will need...</h4>
            <ul>
              <li>
                <strong>At least one RBG LED board</strong>
                <p>The <a href="http://www.adafruit.com/products/420">16x32</a> or <a href="#">32x32</a> model will work just fine. I would recommend chaining at most 3 together.</p>
                <p>Want to keep it simply? One <a href="https://www.adafruit.com/products/2278">64x32</a> LED board will be work just fine and is a nice size.</p>
              </li>
              <li>
                <strong>Raspberry PI</strong>
                <p>Sure the previous generation of pi will work, but if you want to update the LEDs as fast as possible, get the <a href="#">latest PI</a>.</p>
              </li>
              <li>
                <strong>SD Card for your PI</strong>
                <p>You know... for a <a href="https://www.adafruit.com/products/1294">harddrive</a>!</p>
              <li>
                <strong>Female to Female wires</strong>
                <p>These <a href="http://www.adafruit.com/products/266">wires</a> are for connecting the first LED board to the GPIO pins on your raspberry PI.</p>
              </li>
              <li>
                <strong>Power supply</strong>
                <p>You'll need a <a href="http://www.adafruit.com/products/276">5v</a> powersupply to run your board(s).</p>
              </li>
              <li>
                <strong>2.1mm to Screw Jack Adapter</strong>
                <p>This <a href="http://www.adafruit.com/products/368">adapter</a> will connect your powersupply to your LED boards.</p>
              </li>
              <li>
                <strong>Raspberry Leaf (recommended, but not required!)</strong>
                <p>A <a href="https://www.adafruit.com/product/2196">raspberry leaf</a> will make wiring your board much easier, highly recommended!</p>
              </li>
            </ul>
            <p class="alert alert-info">Need help? <a href="mailto:roy.kolak@gmail.com">email Roy!</a></p>
            <h4 style="margin-top: 100px;">Wiring the LED board to your raspberry PI</h4>
            <p>Refer to this <a href="https://github.com/hzeller/rpi-rgb-led-matrix/blob/master/wiring.md">excellent diagram</a> from hzeller! His library is powering the underlining display logic for the Bigdots service and client.</p>
            <p>You will only have 1 chain of boards, so follow the wiring diagram for the 😄 emoji. (You'll understand...)</p>

            <h4 style="margin-top: 100px;">Chaining your boards (if required)</h4>
            <p>All the boards come with a ribbon cable and a power cable to be used for chaining. Follow the outline below to chain your boards.</p>
            <img src="http://placehold.it/350x150" style="width: 100%;">

            <h4 style="margin-top: 100px;">Connecting the power adapter to the LED board power cabled</h4>
            <p>Just following the picture below...</p>
            <img src="http://placehold.it/350x150" style="width: 100%;">

            <h4 style="margin-top: 100px;">Get your PI ready</h4>
            <p>Follow the instructions <a href="https://www.raspberrypi.org/documentation/installation/installing-images/">here</a> to install Raspbian.</p>

            <h4 style="margin-top: 100px;">Installing BIGDOTS on your PI</h4>
            <p>First, <a href="mailto:roy.kolak@gmail.com">email Roy</a> (hi i'm roy) and ask him to generate a bigdots key for you. Sorry this task is not automated... yet.</p>
            <p>Then head over to the github repo for the <a href="https://github.com/bigdots-io/hardware-client">Hardware Client</a> and follow the README instructions</p>
            <p class="alert alert-info">Need help? <a href="mailto:roy.kolak@gmail.com">email Roy!</a></p>
          </div>
        </div>
      </div>
    `);
  }
}

export { HowToBuildADisplayPage as default }
