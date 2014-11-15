// Compile with: browserify script.js -o bundle.js

var Swipeview = require('../../src/swipeview.js').SwipeView;

document.addEventListener('DOMContentLoaded', function(event) {
  var generatePage = function(i, page) {
    var el = page.querySelector('h1');
    el.innerHTML = 'Page ' + (i + 1);
  };

  carousel = new Swipeview('#wrapper', {
    numberOfPages: 5,
    generatePage: generatePage,
  });
});
