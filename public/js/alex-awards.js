/* Alex's Amazing Garage — standalone local achievements v1 */
(function (w) {
  'use strict';
  var KEY = 'alex-amazing-garage-awards-v1';
  var fleet = [
    ['fire-truck','Fire Truck','🚒'],
    ['airport-fire-truck','Airport Fire Truck','🚨'],
    ['police-car','Police Car','🚓'],
    ['excavator','Excavator','🚜'],
    ['mobile-crane','Mobile Crane','🏗️'],
    ['tractor','Tractor','🚜'],
    ['dump-truck','Dump Truck','🚛'],
    ['mars-rover','Mars Rover','🚀'],
    ['ambulance','Ambulance','🚑']
  ];
  function read() {
    try {
      var x = JSON.parse(w.localStorage.getItem(KEY) || '{}');
      return x && typeof x === 'object' ? x : {};
    } catch (e) { return {}; }
  }
  function count() { var d=read(); return fleet.filter(function(x){return !!d[x[0]];}).length; }
  function unlock(id) {
    if (!fleet.some(function(x){return x[0]===id;})) return false;
    var d=read();
    if (d[id]) return false;
    d[id] = Date.now();
    try { w.localStorage.setItem(KEY,JSON.stringify(d)); } catch(e){ /* private mode: no persistence */ }
    w.dispatchEvent(new CustomEvent('alex-award-unlocked',{detail:{id:id,count:count()}}));
    return true;
  }
  w.AlexAwards = {fleet:fleet,read:read,count:count,unlock:unlock};
})(window);
