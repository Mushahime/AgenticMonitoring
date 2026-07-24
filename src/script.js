(function(){
  var pages = document.querySelectorAll('.page');
  var links = document.querySelectorAll('nav.pages a');
  var valid = Array.prototype.map.call(pages, function(p){ return p.getAttribute('data-page'); });
  var moreTrigger = document.querySelector('.nav-more-trigger');
  var morePages = ['perplexity','fact','atlas','archive'];

  function show(name){
    if (valid.indexOf(name) === -1) name = 'home';
    pages.forEach(function(p){
      p.classList.toggle('active', p.getAttribute('data-page') === name);
    });
    links.forEach(function(l){
      l.classList.toggle('active', l.getAttribute('data-page') === name);
    });
    if (moreTrigger) moreTrigger.classList.toggle('active', morePages.indexOf(name) !== -1);
    window.scrollTo(0, 0);
  }

  function current(){
    return (window.location.hash || '#home').replace('#','');
  }

  window.addEventListener('hashchange', function(){ show(current()); });
  show(current());
})();

(function(){
  var navMore = document.querySelector('.nav-more');
  if (!navMore) return;
  var trigger = navMore.querySelector('.nav-more-trigger');
  function close(){
    navMore.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }
  function toggle(){
    var isOpen = navMore.classList.toggle('open');
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
  trigger.addEventListener('click', function(e){ e.stopPropagation(); toggle(); });
  navMore.querySelectorAll('.nav-more-menu a').forEach(function(a){
    a.addEventListener('click', close);
  });
  document.addEventListener('click', function(e){
    if (!navMore.contains(e.target)) close();
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') close();
  });
})();

(function(){
  var cards = document.querySelectorAll('.tl-card');
  cards.forEach(function(card){
    function toggle(){
      var wasOpen = card.classList.contains('tl-open');
      cards.forEach(function(c){ c.classList.remove('tl-open'); });
      if (!wasOpen) card.classList.add('tl-open');
    }
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); }
    });
  });

  var filters = document.querySelectorAll('.tl-filter');
  var nodes = document.querySelectorAll('.tl-node');
  filters.forEach(function(btn){
    btn.addEventListener('click', function(){
      filters.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var cat = btn.getAttribute('data-filter');
      nodes.forEach(function(n){
        var show = (cat === 'all' || n.getAttribute('data-cat') === cat);
        n.classList.toggle('tl-hidden', !show);
      });
      cards.forEach(function(c){ c.classList.remove('tl-open'); });
    });
  });
})();
