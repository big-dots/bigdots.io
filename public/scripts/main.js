import page from 'page';

import DisplayPage from './pages/display-page';
import CreateDisplayPage from './pages/create-display-page';
import HomePage from './pages/home-page';
import InstallMacrosPage from './pages/install-macros-page';
import HowToBuildADisplayPage from './pages/how-to-build-a-display-page';

import Header from './components/header';

firebase.initializeApp({
  apiKey: "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
  authDomain: "led-fiesta.firebaseapp.com",
  databaseURL: "https://led-fiesta.firebaseio.com",
  storageBucket: "led-fiesta.appspot.com"
});

new Header($('.header')).render();

page('/', function(ctx) {
  new HomePage($('.page')).render();
});

page('/displays/new', function(ctx) {
  new CreateDisplayPage($('.page')).render();
  $('select').select2();
});

page('/displays/:id', function(ctx) {
  new DisplayPage($('.page'), {
    id: ctx.params.id
  }).render();
});

page('/install-macros', function(ctx) {
  new InstallMacrosPage($('.page')).render();
});

page('/how-to-build-a-display', function(ctx) {
  new HowToBuildADisplayPage($('.page')).render();
});

page();
