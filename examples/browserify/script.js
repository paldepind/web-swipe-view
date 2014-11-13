// Compile with: browserify script.js -o bundle.js

var Swipeview = require('../../src/swipeview.js').SwipeView;

document.addEventListener('DOMContentLoaded', function(event) {
  var initializePage = function(i, page) {
    var el = document.createElement('h1');
    el.innerHTML = 'Page ' + i;
    page.appendChild(el);
  };

  console.log(Swipeview);

  carousel = new Swipeview('#wrapper', {
    numberOfPages: 5,
    initializePage: initializePage,
  });

  carousel.generatePage = function(i, page) {
    var el = page.querySelector('h1');
    el.innerHTML = 'Page ' + i;
  };
});
