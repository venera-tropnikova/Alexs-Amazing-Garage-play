/* V19: attempt autoplay with sound; fall back to a single unmistakable PLAY control. */
(function(){'use strict';
var player=document.getElementById('film');if(!player)return;
var frame=player.closest('.video-frame');if(!frame)return;
player.autoplay=true;player.muted=false;player.playsInline=true;
var button=document.createElement('button');button.type='button';button.className='alex19-play';button.textContent='▶ PLAY';button.setAttribute('aria-label','Play mission video');button.hidden=true;frame.appendChild(button);
function show(){button.hidden=false}
function hide(){button.hidden=true}
function start(){player.muted=false;try{var result=player.play();if(result&&typeof result.then==='function'){result.then(hide).catch(show)}else{hide()}}catch(e){show()}}
button.addEventListener('click',function(event){event.stopPropagation();start()});
player.addEventListener('playing',hide);
player.addEventListener('error',show);
// The existing page sets the source during its own script execution.
function ready(){if(player.currentSrc||player.getAttribute('src')||player.querySelector('source'))start();else show()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
window.addEventListener('pagehide',function(){player.pause()});
})();