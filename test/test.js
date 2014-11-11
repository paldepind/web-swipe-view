describe('SwipeView', function() {
  var container;
  var expect = chai.expect;

  var noop = function() { return; };

  beforeEach(function() {
    container = document.createElement('div');
  });

  it('initializes the container with a horizontal slider', function() {
    new SwipeView(container, { initializePage: noop });
    var first = container.firstElementChild;
    var last = container.lastElementChild;
    expect(first).to.equal(last);
    expect(first.id).to.equal('swipeview-slider');
  });

  it('wrapper position should not be relative if unspecified', function(){
    new SwipeView(container, { initializePage: noop });
    expect(container.style.position).to.equal('relative');
  });

  it('wrapper position should not be overriden if absolute', function(){
    container.style.position = 'absolute';
    new SwipeView(container, { initializePage: noop });
    expect(container.style.position).to.equal('absolute');
  });
});
