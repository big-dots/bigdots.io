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
                <p>The <a href="http://www.adafruit.com/products/420">16x32</a> or <a href="#">32x32</a> model will work just fine. I would recommend chaining at least 3 together.</p>
              </li>
              <li>
                <strong>Raspberry PI</strong>
                <p>Sure the previous generation of pi will work, but if you want to update the LEDs as fast as possible, get the <a href="#">latest PI</a>.</p>
              </li>
              <li>
                <strong>Female to Female wires</strong>
                <p>These <a href="http://www.adafruit.com/products/266">wires</a> are for connecting the first LED board to the GPIO pins on your raspberry PI.</p>
              </li>
              <li>
                <strong>Power supply</strong>
                <p>You'll need a <a href="http://www.adafruit.com/products/276">5v</a> or 10v (if you have a 3 or more chained) powersupply to run your board(s).</p>
              </li>
              <li>
                <strong>2.1mm to Screw Jack Adapter</strong>
                <p>This <a href="http://www.adafruit.com/products/368">adapter</a> will connect your powersupply to your LED boards.</p>
              </li>
            </ul>
            <h4 style="margin-top: 100px;">Wiring the first LED board to your raspberry PI</h4>
            <p>Just following the wiring diagram below...</p>
            <img src="http://placehold.it/350x150" style="width: 100%;">

            <h4 style="margin-top: 100px;">Chaining your boards (if required)</h4>
            <p>All the boards come with a ribbon cable and a power cable to be used for chaining. Follow the outline below to chain your boards.</p>
            <img src="http://placehold.it/350x150" style="width: 100%;">

            <h4 style="margin-top: 100px;">Connecting the power adapter to the LED board power cabled</h4>
            <p>Just following the picture below...</p>
            <img src="http://placehold.it/350x150" style="width: 100%;">

            <h4 style="margin-top: 100px;">Installing BIGDOTS on your PI</h4>
            <ol>
              <li>
                SSH into your raspberry PI
              </li>
              <li>
                Clone the hardware client into your home directory
<pre>
$ cd
$ git clone git@github.com:bigdots-io/hardware-client.git
</pre>
              </li>
              <li>
                Run the install script from the cloned directory
<pre>
cd hardware-client
sudo ./install.sh
</pre>
              </li>
              <li>
                Using an editor, add a <strong>display-config.json</strong> file.
              <pre>
{
  "display": "YOUR DISPLAY ID",
  "rows": 32,
  "chains": 3,
  "parallel": 1
}
              </pre>
              </li>
              <li>
                To start the client run..
                <pre>
sudo start hardware-client
                </pre>
                ...or simple restart the raspberry PI.
              </li>
            </ol>
          </div>
        </div>
      </div>
    `);
  }
}

export { HowToBuildADisplayPage as default }
