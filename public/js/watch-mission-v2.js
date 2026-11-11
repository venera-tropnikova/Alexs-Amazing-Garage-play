/* Alex's Amazing Garage: mission link for the active vehicle. */
(function () {
  'use strict';
  var vehicleIds = ['fire-truck','airport-fire-truck','police-car','excavator','mobile-crane','tractor','dump-truck','mars-rover','ambulance'];
  var filenameToId = {
    'fire-truck-explore.html':'fire-truck','caterpillar.html':'excavator',
    'ford-f450.html':'ambulance','ford-police.html':'police-car','john-deere.html':'tractor',
    'liebherr.html':'mobile-crane','panther.html':'airport-fire-truck',
    'perseverance.html':'mars-rover','truck.html':'dump-truck','volvo-a40g.html':'dump-truck'
  };
  function valid(id) { return vehicleIds.indexOf(id) >= 0; }
  function vehicleId() {
    var fromQuery = new URLSearchParams(window.location.search).get('v');
    if (valid(fromQuery)) return fromQuery;
    var explore = document.getElementById('explore');
    if (explore) {
      try {
        var id = new URL(explore.href, document.baseURI).searchParams.get('v');
        if (valid(id)) return id;
      } catch (err) { /* keep default */ }
    }
    return filenameToId[location.pathname.split('/').pop().toLowerCase()] || 'fire-truck';
  }
  function update(button) {
    var id = vehicleId();
    button.href = new URL('vehicle-action/mission-videos/index.html?v=' + encodeURIComponent(id), document.baseURI).href;
    button.setAttribute('aria-label','Watch '+id.replace(/-/g,' ')+' mission video');
  }
  function mount() {
    if (document.getElementById('alex-watch-mission-v2')) return true;
    var garage = document.querySelector('.pick-stage');
    var nav = document.querySelector('.route-nav');
    if (!garage && !nav) return false;
    var link = document.createElement('a');
    link.id = 'alex-watch-mission-v2';
    link.href = '#';
    link.textContent = '▶ Watch Mission';
    link.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:44px;padding:10px 17px;border-radius:13px;background:#ffcc35;color:#10233e;border:2px solid #fff8ce;box-shadow:0 4px 12px rgba(0,0,0,.35);font:800 16px/1.1 system-ui,Arial,sans-serif;text-decoration:none;white-space:nowrap;cursor:pointer;z-index:200';
    if (garage) {
      // Explicitly visible on the garage floor, not hidden inside image hot spots.
      link.style.position = 'fixed';
      link.style.bottom = 'max(16px,env(safe-area-inset-bottom))';
      link.style.right = 'max(18px,env(safe-area-inset-right))';
      document.body.appendChild(link);
    } else {
      nav.appendChild(link);
    }
    update(link);
    var explore = document.getElementById('explore');
    if (explore && typeof MutationObserver !== 'undefined') {
      new MutationObserver(function () { update(link); }).observe(explore,{attributes:true,attributeFilter:['href']});
    }
    return true;
  }
  function start() {
    if (mount()) return;
    // Explore builds its navigation after initial page load.
    var observer = new MutationObserver(function () {
      if (mount()) observer.disconnect();
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
