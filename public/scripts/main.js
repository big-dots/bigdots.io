import page from 'page';

import Display from './pages/display';
import DisplayForm from './pages/display-form';
import DisplayList from './pages/display-list';
import Home from './pages/home';

firebase.initializeApp({
  apiKey: "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
  authDomain: "led-fiesta.firebaseapp.com",
  databaseURL: "https://led-fiesta.firebaseio.com",
  storageBucket: "led-fiesta.appspot.com"
});

page('/', function(ctx) {
  new Home($('.page')).render();
});

page('/displays', function(ctx) {
  new DisplayList($('.page')).render();
});

page('/displays/new', function(ctx) {
  new DisplayForm($('.page')).render();
  $('select').select2();
});

page('/displays/:id', function(ctx) {
  new Display($('.page'), {
    id: ctx.params.id
  }).render();
});

page();
