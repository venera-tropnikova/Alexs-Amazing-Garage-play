/* Alex's Amazing Garage: the completed 9/9 search earns a photo-led celebration. */
(function(w){
'use strict';
var awards=w.AlexAwards,ids=awards?awards.fleet.map(function(x){return x[0];}):[],round=Object.create(null),stopped=false,announced=false;
function celebrate(){
  if(announced)return;announced=true;stopped=true;
  var overlay=document.createElement('div');overlay.id='alex-awards-finale';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','All nine awards collected');
  var photos=ids.map(function(id){return '<img src="public/images/awards/'+id+'.webp" alt="" loading="eager">';}).join('');
  overlay.innerHTML='<div class="af-panel"><div class="af-kicker">MISSION COMPLETED</div><h2>Amazing, Alex!</h2><p class="af-sub">You found all 9 vehicles!</p><div class="af-photos" aria-hidden="true">'+photos+'</div><div class="af-trophy">🏆 <span>SUPER GARAGE HERO!</span></div><p class="af-detail">Every vehicle. Every badge. All yours!</p><div class="af-actions"><a href="find-it.html?replay=1">Play Again</a><a href="awards.html">My Awards</a><a class="af-quiet" href="garage.html">Garage</a></div></div>';
  document.body.appendChild(overlay);var first=overlay.querySelector('a');if(first)first.focus();
}
var css=document.createElement('style');css.textContent=`
#alex-awards-finale{position:fixed;z-index:100100;inset:0;overflow-y:auto;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 20%,#315d90,#08172d 66%);font-family:Trebuchet MS,Segoe UI,Arial,sans-serif;color:white;padding:15px}
#alex-awards-finale .af-panel{width:min(1000px,100%);max-height:100%;border:3px solid #dfb657;border-radius:28px;background:linear-gradient(145deg,#23436a,#0b1d35);box-shadow:0 20px 80px #000b,inset 0 0 65px #f5cd5d19;padding:clamp(14px,2.2vw,26px);text-align:center;overflow-y:auto}
#alex-awards-finale .af-kicker{color:#ffe0a0;letter-spacing:.2em;font-weight:900;font-size:13px}
#alex-awards-finale h2{font-size:clamp(37px,6vw,66px);margin:4px 0 1px;line-height:1.04}
#alex-awards-finale .af-sub{font-size:clamp(19px,3vw,30px);font-weight:900;color:#dce9ff;margin:5px 0 10px}
#alex-awards-finale .af-photos{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin:8px auto 15px}
#alex-awards-finale .af-photos img{width:100%;height:clamp(58px,9vw,112px);object-fit:contain;filter:drop-shadow(0 7px 4px #0009);background:radial-gradient(ellipse at 50% 75%,#53769c44,transparent 70%);border:1px solid #ffffff1c;border-radius:12px}
#alex-awards-finale .af-trophy{color:#ffe4a1;font-weight:1000;font-size:clamp(20px,3vw,30px)}
#alex-awards-finale .af-detail{font-size:clamp(14px,1.9vw,19px);font-weight:750;color:#d2e2f7;margin:8px 0 15px}
#alex-awards-finale .af-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
#alex-awards-finale .af-actions a{display:inline-flex;align-items:center;justify-content:center;padding:12px 23px;min-height:56px;background:linear-gradient(#38a3ff,#237bda);border:2px solid #5dbaff;border-radius:14px;font-size:clamp(17px,2.1vw,23px);font-weight:900;text-decoration:none;color:white}
#alex-awards-finale .af-actions .af-quiet{background:#122d4b;border-color:#4c7ba7}
@media(max-width:520px){#alex-awards-finale .af-photos{grid-template-columns:repeat(3,minmax(0,1fr))}#alex-awards-finale .af-panel{max-height:calc(100svh - 20px)}#alex-awards-finale .af-actions a{min-height:48px}}
`;document.head.appendChild(css);
function onCorrect(id){if(!awards||ids.indexOf(id)<0)return false;if(stopped)return true;round[id]=true;
 // The approved AlexRewardUI celebration is the single finale for a full round.
 // A lifetime-unlock count must never end a new round early.
 if(w.AlexRewardUI)return false;
 if(Object.keys(round).length===ids.length){celebrate();return true;}
 return false;
}
w.AlexAwardsFlow={onCorrect:onCorrect,isPaused:function(){return stopped;}};
})(window);
