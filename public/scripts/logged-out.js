import Display from './components/display';

firebase.initializeApp({
  apiKey: "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
  authDomain: "led-fiesta.firebaseapp.com",
  databaseURL: "https://led-fiesta.firebaseio.com",
  storageBucket: "led-fiesta.appspot.com"
});

var display = new Display($('#display'), '-KQBqz3I3aSMgWvPQKxz');

display.demo('twinkle', {seedColor: '#FFFFFF'}, $('.demo').width(), { width: 128, height: 32 }, () => {
  // Something...
});
