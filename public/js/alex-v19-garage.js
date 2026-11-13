/* V19: single viewport controls; only the actual current-round score is shown. */
(function(){'use strict';
var stage=document.querySelector('.pick-stage');if(!stage)return;
var footer=stage.querySelector('.alex17-garage-footer');
if(!footer){footer=document.createElement('nav');footer.className='alex17-garage-footer';stage.appendChild(footer)}
footer.setAttribute('aria-label','Mission navigation');
function isRewards(a){return /awards\.html/i.test(a.getAttribute('href')||'')||/my\s*(rewards|awards|stars)/i.test((a.textContent||'')+' '+(a.getAttribute('aria-label')||''))}
function isMission(a){return /mission-videos/i.test(a.getAttribute('href')||'')||/watch\s*mission/i.test((a.textContent||'')+' '+(a.getAttribute('aria-label')||''))}
function fixLinks(){
 var found=null;
 Array.from(document.querySelectorAll('a')).forEach(function(a){
  if(isRewards(a)){a.remove();return}
  if(isMission(a)){if(found){a.remove()}else{found=a}}
 });
 if(!found){found=document.createElement('a');found.href='vehicle-action/mission-videos/index.html?v=fire-truck';found.textContent='▶ Watch Mission'}
 found.className='alex19-mission-link';found.setAttribute('aria-label','Watch Mission');
 if(found.parentNode!==footer)footer.appendChild(found);
}
fixLinks();
// Legacy scripts sometimes insert a second link asynchronously.
var pending=false;var watcher=new MutationObserver(function(){if(pending)return;pending=true;queueMicrotask(function(){pending=false;fixLinks()})});
watcher.observe(document.body,{childList:true,subtree:true});
var plaque=stage.querySelector('.alex17-star-plaque');
if(plaque){
 plaque.setAttribute('role','status');plaque.setAttribute('aria-live','polite');
 function update(){var n=0;try{n=Math.min(9,Math.max(0,Number(sessionStorage.getItem('alex-round-stars-v17'))||0))}catch(e){}
 plaque.textContent='';var star=document.createElement('span');star.className='alex19-star-icon';star.setAttribute('aria-hidden','true');star.textContent='★';
 var count=document.createElement('strong');count.textContent=n+' / 9';plaque.append(star,count);plaque.setAttribute('aria-label',n+' out of nine stars earned this round');
 }
 update();window.addEventListener('pageshow',update);window.addEventListener('storage',update);window.addEventListener('alex-stars-change',update);
}
})();