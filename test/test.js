describe('SwipeView', function() {
  var container;
  var expect = chai.expect;

  var noop = function() { return; };

  beforeEach(function() {
    container = document.createElement('div');
  });

  it('initializes the container with a horizontal slider', function() {
    new SwipeView(container, { generatePage: noop });
    var first = container.firstElementChild;
    var last = container.lastElementChild;
    expect(first).to.equal(last);
    expect(first.id).to.equal('swipeview-slider');
  });

  it('prefills the pages with the original container content', function(){
    var html = '<div><h1>Foobar</h1><p>Content</p></div>';
    container.innerHTML = html;
    new SwipeView(container, {
      generatePage: function(i, page) { expect(page.innerHTML).to.equal(html); }
    });
  });

  it('wrapper position should not be relative if unspecified', function(){
    new SwipeView(container, { generatePage: noop });
    expect(container.style.position).to.equal('relative');
  });

  it('wrapper position should not be overriden if absolute', function(){
    container.style.position = 'absolute';
    new SwipeView(container, { generatePage: noop });
    expect(container.style.position).to.equal('absolute');
  });
});
