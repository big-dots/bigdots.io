import page from 'page';

import DisplayPage from './pages/display-page';
import DisplayDemoPage from './pages/display-demo';
import CreateDisplayPage from './pages/create-display-page';
import HomePage from './pages/home-page';
import DashboardPage from './pages/dashboard-page';
import Instructions from './pages/instructions';

import Header from './components/header';

firebase.initializeApp({
  apiKey: "AIzaSyC8C93oYUP3Pt_0GlXZ85EO5aozVGpsngA",
  authDomain: "bigdots-b46cc.firebaseapp.com",
  databaseURL: "https://bigdots-b46cc.firebaseio.com"
});

// page('/my/dashboard', function() {
//   new DashboardPage().render();
// });
//
// page('/displays/new', function() {
//   new CreateDisplayPage().render();
// });



page('/displays/:id', function(ctx) {
  new DisplayPage({
    id: ctx.params.id
  }).render();
});

page('/displays/:id/demo', function(ctx) {
  new DisplayDemoPage({
    id: ctx.params.id
  }).render();
});

page('/instructions', function() {
  new Instructions().render();
});

new Header($('.header')).render();
page();

// firebase.auth().onAuthStateChanged(function(user) {
//   // debugger
//   // if(user) {
//
//   // }
// });
