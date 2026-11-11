/* Alex's Amazing Garage — optional mission-navigation link. Does not change game controls. */
(function () {
  'use strict';
  var fleet = ['fire-truck', 'airport-fire-truck', 'police-car', 'excavator', 'mobile-crane', 'tractor', 'dump-truck', 'mars-rover', 'ambulance'];
  var fileMap = {
    'fire-truck-explore.html': 'fire-truck',
    'caterpillar.html': 'excavator',
    'ford-f450.html': 'ambulance',
    'ford-police.html': 'police-car',
    'john-deere.html': 'tractor',
    'liebherr.html': 'mobile-crane',
    'panther.html': 'airport-fire-truck',
    'perseverance.html': 'mars-rover',
    'truck.html': 'dump-truck',
    'volvo-a40g.html': 'dump-truck'
  };
  var base = document.baseURI;
  function idFromHref(href) {
    if (!href) return null;
    try {
      var u = new URL(href, location.href);
      var id = u.searchParams.get('v');
      return fleet.indexOf(id) >= 0 ? id : null;
    } catch (e) { return null; }
  }
  function selected() {
    var fromUrl = new URLSearchParams(location.search).get('v');
    if (fleet.indexOf(fromUrl) >= 0) return fromUrl;
    var garageExplore = document.getElementById('explore');
    var fromGarage = garageExplore && idFromHref(garageExplore.href);
    if (fromGarage) return fromGarage;
    var name = location.pathname.split('/').pop().toLowerCase();
    return fileMap[name] || 'fire-truck';
  }
  function update(link) {
    var id = selected();
    link.href = new URL('vehicle-action/mission-videos/index.html?v=' + encodeURIComponent(id), base).href;
    link.setAttribute('aria-label', 'Watch ' + id.replace(/-/g, ' ') + ' mission');
  }
  function mount() {
    if (document.getElementById('alex-watch-mission')) return true;
    var nav = document.querySelector('.route-nav');
    // On the garage selection screen, use a fixed, unobtrusive control;
    // do not modify the image hotspots or existing navigation.
    var link = document.createElement('a');
    link.id = 'alex-watch-mission';
    link.textContent = '▶ Watch Mission';
    link.setAttribute('data-alex-mission-nav', '1');
    link.style.cssText = [
      'display:inline-flex','align-items:center','justify-content:center',
      'box-sizing:border-box','min-height:42px','padding:9px 14px',
      'background:#ffd43b','color:#11253e','border:2px solid #fff8c6',
      'border-radius:10px','font:700 15px/1.2 system-ui,Arial,sans-serif',
      'text-decoration:none','white-space:nowrap','box-shadow:0 3px 12px #0005',
      'cursor:pointer','z-index:999'
    ].join(';');
    if (nav) {
      nav.appendChild(link);
    } else {
      link.style.position = 'fixed';
      link.style.right = 'max(12px,env(safe-area-inset-right))';
      link.style.bottom = 'max(14px,env(safe-area-inset-bottom))';
      document.body.appendChild(link);
    }
    update(link);
    // The garage dynamically changes its active vehicle. Follow that href.
    var explore = document.getElementById('explore');
    if (explore && typeof MutationObserver !== 'undefined') {
      new MutationObserver(function () { update(link); })
        .observe(explore, { attributes:true, attributeFilter:['href'] });
    }
    return true;
  }
  function start() {
    // Explore's navigation is constructed asynchronously by its renderer.
    if (document.querySelector('.route-nav')) { mount(); return; }
    if (location.pathname.endsWith('/explore.html') && typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function () {
        if (document.querySelector('.route-nav')) { observer.disconnect(); mount(); }
      });
      observer.observe(document.body, { childList:true, subtree:true });
      setTimeout(function () { observer.disconnect(); mount(); }, 2500);
    } else { mount(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
