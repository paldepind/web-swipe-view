describe('SwipeView', function() {
  var expect = chai.expect;
  var assert = chai.assert;

  var noop = function() { return; };
  var container = document.getElementById('fixture');

  beforeEach(function() {
    container.innerHTML = '';
  });

  it('initializes the container with a horizontal slider', function() {
    new SwipeView(container, { generatePage: noop });
    expect(container.childElementCount).to.equal(1);
    var child = container.firstElementChild;
    expect(child.id).to.equal('swipeview-slider');
  });

  it('initializes three pages on creation', function() {
    var spy = sinon.spy();
    new SwipeView(container, { numberOfPages: 5, generatePage: spy });
    expect(spy.callCount).to.equal(3);
    assert(spy.calledWith(0));
    assert(spy.calledWith(1));
    assert(spy.calledWith(4));
  });

  it('changes the initial page', function() {
    var spy = sinon.spy();
    new SwipeView(container, { initialPage: 3, numberOfPages: 5, generatePage: spy });
    assert(spy.calledWith(2));
    assert(spy.calledWith(3));
    assert(spy.calledWith(4));
  });

  it('turns to correct page after initial', function(done) {
    var spy = sinon.spy();
    var swipeview = new SwipeView(container, {
      initialPage: 3, numberOfPages: 6, generatePage: spy, pageTurnSpeed: 2,
    });
    swipeview.next();
    assert(spy.calledWith(2));
    assert(spy.calledWith(3));
    assert(spy.calledWith(4));
    setTimeout(function() { assert(spy.calledWith(5)); done(); }, 3);
  });

  it('tears down pages', function(done) {
    var spy = sinon.spy();
    var swipeview = new SwipeView(container, {
      initialPage: 3, numberOfPages: 6, generatePage: noop, teardownPage: spy, pageTurnSpeed: 2,
    });
    swipeview.next();
    setTimeout(function() { assert(spy.calledWith(2)); done(); }, 4);
  });

  it('prefills the pages with the original container content', function(){
    var html = '<div><h1>Foobar</h1><p>Content</p></div>';
    container.innerHTML = html;
    new SwipeView(container, {
      generatePage: function(i, page) { expect(page.innerHTML).to.equal(html); }
    });
  });

  it('wrapper position should be relative if unspecified', function(){
    new SwipeView(container, { generatePage: noop });
    expect(container.style.position).to.equal('relative');
  });

  it('wrapper position should not be overriden if absolute', function(){
    container.style.position = 'absolute';
    new SwipeView(container, { generatePage: noop });
    expect(container.style.position).to.equal('absolute');
  });
  describe('Events', function(){
    it('triggers flip on page turn', function() {
      var spy = sinon.spy();
      var swipeview = new SwipeView(container, {
        numberOfPages: 6, generatePage: spy, pageTurnSpeed: 2,
      });
      swipeview.onFlip(spy);
      swipeview.next();
      setTimeout(function() { assert(spy.calledOnce); done(); }, 3);
    });
  });
});
