/* V17 enhancement: persisted per-round and lifetime-star progress.
   This script runs after alex-rewards.js and wraps the existing callbacks. */
(function(){'use strict';
var ui=window.AlexRewardUI;if(!ui||ui.__v17)return;ui.__v17=true;
var key='alex-round-stars-v17', lifetime='alex-earned-stars-v17';
function get(k){try{return Math.max(0,Math.min(9,parseInt(sessionStorage.getItem(k)||'0',10)||0));}catch(e){return 0}}
function put(k,n){try{sessionStorage.setItem(k,String(n))}catch(e){}}
function broadcast(){window.dispatchEvent(new Event('alex-stars-change'))}
var oldCorrect=ui.onCorrect;
ui.onCorrect=function(index){
  var before=ui.getRoundCount?ui.getRoundCount():0;
  oldCorrect.call(ui,index);
  var after=ui.getRoundCount?ui.getRoundCount():before;
  if(after>before){put(key,after);put(lifetime,Math.max(get(lifetime),after));broadcast()}
};
// Finishing starts the next round only when Alex chooses Play Again.
var again=document.querySelector('.alex7-actions [data-act="again"]');
if(again)again.addEventListener('click',function(){put(key,0);broadcast()},true);
var overlay=document.querySelector('.alex7-overlay');
if(overlay){
 var boy=overlay.querySelector('.alex7-boy');
 var cars=['fire-truck','airport-fire-truck','police-car','excavator','mobile-crane','tractor','dump-truck','mars-rover','ambulance'];
 var frame=document.createElement('div');frame.className='alex17-fleet';frame.setAttribute('aria-hidden','true');
 cars.forEach(function(id,i){var image=document.createElement('img');image.alt='';image.src='public/images/garage-review/'+id+'.png';image.className=i<5?'topcar':'bottomcar';frame.appendChild(image)});
 overlay.querySelector('.alex7-card').appendChild(frame);
 if(boy)boy.alt='Alex holding his trophy';
}
})();
