import page from 'page';

import DisplayPage from './pages/display-page';
import CreateDisplayPage from './pages/create-display-page';
import HomePage from './pages/home-page';
import DashboardPage from './pages/dashboard-page';
import InstallMacrosPage from './pages/install-macros-page';
import HowToBuildADisplayPage from './pages/how-to-build-a-display-page';

import Header from './components/header';

firebase.initializeApp({
  apiKey: "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
  authDomain: "led-fiesta.firebaseapp.com",
  databaseURL: "https://led-fiesta.firebaseio.com",
  storageBucket: "led-fiesta.appspot.com"
});

page('/my/dashboard', function() {
  new DashboardPage().render();
});

page('/displays/new', function() {
  new CreateDisplayPage().render();
  $('select').select2();
});

page('/displays/:id', function(ctx) {
  new DisplayPage({
    id: ctx.params.id
  }).render();
});

page('/install-macros', function() {
  new InstallMacrosPage().render();
});

page('/how-to-build-a-display', function() {
  new HowToBuildADisplayPage().render();
});

firebase.auth().onAuthStateChanged(function(user) {
  if(user) {
    new Header($('.header')).render();
    page();
  }
});
