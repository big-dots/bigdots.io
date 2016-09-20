import DisplayCoupler from 'display-coupler';
import DotMatrix from 'dot-matrix';

firebase.initializeApp({
  apiKey: "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
  authDomain: "led-fiesta.firebaseapp.com",
  databaseURL: "https://led-fiesta.firebaseio.com",
  storageBucket: "led-fiesta.appspot.com"
});

var dotMatrix = new DotMatrix($('#display'));
dotMatrix.render(650, { width: 128, height: 32 });

var displayConfig = {
    macro: 'twinkle',
    macroConfig: {seedColor: '#FFFFFF'},
    width: 128,
    height: 32
  };
var displayCoupler = new DisplayCoupler();
displayCoupler.demo(displayConfig, {
  onReady: function(displayData, next) {
    next()
  },
  onPixelChange: (y, x, hex) => {
    dotMatrix.updateDot(y, x, hex);
  }
});
