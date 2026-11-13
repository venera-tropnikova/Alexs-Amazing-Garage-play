(function(){'use strict';
var stage=document.querySelector('.pick-stage');if(!stage)return;
// Replace the unused Say It position, without adding another separate button.
var plaque=document.createElement('div');plaque.className='alex17-star-plaque';plaque.setAttribute('aria-label','Earned stars');plaque.setAttribute('translate','no');
plaque.innerHTML='<span class="alex17-star-label">STARS</span><span class="alex17-mini-stars" aria-hidden="true"></span><strong class="alex17-stars-count">0 / 9</strong>';
stage.appendChild(plaque);
function count(){try{return Math.max(0,Math.min(9,Number(sessionStorage.getItem('alex-round-stars-v17'))||0))}catch(e){return 0}}
function update(){var n=count(),stars=plaque.querySelector('.alex17-mini-stars');stars.replaceChildren();for(var i=0;i<9;i++){var s=document.createElement('span');s.textContent='★';if(i<n)s.className='lit';stars.appendChild(s)}plaque.querySelector('.alex17-stars-count').textContent=n+' / 9';plaque.setAttribute('aria-label',n+' of 9 stars earned')}
update();window.addEventListener('pageshow',update);window.addEventListener('storage',update);window.addEventListener('alex-stars-change',update);
// Keep all floating navigation links inside the same 4:3 game stage.
var footer=document.createElement('nav');footer.className='alex17-garage-footer';footer.setAttribute('aria-label','Additional game activities');stage.appendChild(footer);
function reorganize(){
 var links=Array.from(document.querySelectorAll('a'));
 var rewards=links.find(function(a){return /my rewards|my awards|my stars/i.test((a.textContent||'')+' '+(a.getAttribute('aria-label')||''))});
 var mission=links.find(function(a){return /watch mission|my missions/i.test((a.textContent||'')+' '+(a.getAttribute('aria-label')||''))});
 [rewards,mission].forEach(function(a){if(a&&a.parentNode!==footer){footer.appendChild(a);a.classList.add('alex17-footer-link')}});
 // Do not put a second Rewards link when the original link exists in another form.
 if(!rewards&&!footer.querySelector('[data-alex17-rewards]')){
  var b=document.createElement('a');b.href='awards.html';b.textContent='★ My Rewards';b.dataset.alex17Rewards='yes';b.className='alex17-footer-link';footer.appendChild(b);
 }
 if(!mission&&!footer.querySelector('[data-alex17-missions]')){
  var v=document.createElement('a');v.href='vehicle-action/mission-videos/index.html?v=fire-truck';v.textContent='▶ Watch Mission';v.dataset.alex17Missions='yes';v.className='alex17-footer-link';footer.appendChild(v);
 }
}
reorganize();setTimeout(reorganize,200);
})();
