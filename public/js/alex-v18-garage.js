/* V18: normalise the V17 buttons instead of placing another copy at screen edges. */
(function(){'use strict';
var stage=document.querySelector('.pick-stage');if(!stage)return;
var footer=stage.querySelector('.alex17-garage-footer');if(!footer){footer=document.createElement('nav');footer.className='alex17-garage-footer';stage.appendChild(footer)}
var labels=['★ My Rewards','▶ Watch Mission'];
var urls=['awards.html','vehicle-action/mission-videos/index.html?v=fire-truck'];
function classify(a){
 var h=(a.getAttribute('href')||'').toLowerCase();
 var t=((a.textContent||'')+' '+(a.getAttribute('aria-label')||'')).toLowerCase();
 if(/awards\.html/.test(h)||/my rewards|my stars|my awards/.test(t))return 0;
 if(/mission-videos/.test(h)||/watch mission|my missions/.test(t))return 1;
 return -1;
}
function straighten(){
 var all=Array.from(document.querySelectorAll('a'));var found=[null,null];
 all.forEach(function(a){var i=classify(a);if(i<0)return;
  if(found[i]){if(a.parentNode)a.parentNode.removeChild(a)}else{found[i]=a}
 });
 [0,1].forEach(function(i){var a=found[i];if(!a){a=document.createElement('a');a.href=urls[i]}
  a.textContent=labels[i];a.className='alex17-footer-link';a.setAttribute('aria-label',labels[i]);
  if(a.parentNode!==footer)footer.appendChild(a);
 });
}
straighten();setTimeout(straighten,250);setTimeout(straighten,900);
})();
