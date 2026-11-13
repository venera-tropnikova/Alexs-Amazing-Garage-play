(function(){'use strict';
if(window.AlexRewardUI)return;
var base='assets/alex-rewards/';
var imgs=[base+'01_Alex_Celebrating.png',base+'02_Alex_Jumping.png',base+'03_Alex_Presenting.png',base+'04_Alex_Thinking.png',base+'05_Alex_Trophy.png'];
var texts=[['Great job, Alex!','You got it!',0],['Awesome, Alex!','That’s right!',2],['Way to go, Alex!','Another star!',1],['Fantastic, Alex!','You found it!',0],['Super job, Alex!','Keep it up!',2],['Amazing, Alex!','You did it!',1],['Brilliant, Alex!','Another one!',0],['Wow, Alex!','Almost there!',2],['Super Alex!','All nine stars!',1]];
var count=0,finished=false,timer=null;
var earnedOrder=[]; // Ordered by discovery, not the fixed catalogue slots.
var overlay=document.createElement('div');overlay.className='alex7-overlay';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('translate','no');overlay.innerHTML='<div class="alex7-card"><div class="alex7-rays"></div><img class="alex7-boy" alt="Alex celebrating"><div class="alex7-content"><h2 class="alex7-title"></h2><p class="alex7-line"></p><div class="alex7-award">★</div><div class="alex7-progress" aria-label="Earned stars"></div><p class="alex7-count"></p><button class="alex8-listen" type="button" aria-label="Hear the praise again">🔊 Listen Again</button><nav class="alex7-actions" hidden><button type="button" data-act="again">↻ Play Again</button><button type="button" data-act="stars">★ My Stars</button><button type="button" data-act="garage">⌂ Garage</button></nav></div><span class="alex7-spark one">✦</span><span class="alex7-spark two">✧</span><span class="alex7-spark three">✦</span></div>';document.body.appendChild(overlay);
var boy=overlay.querySelector('.alex7-boy'),title=overlay.querySelector('.alex7-title'),line=overlay.querySelector('.alex7-line'),award=overlay.querySelector('.alex7-award'),progress=overlay.querySelector('.alex7-progress'),counter=overlay.querySelector('.alex7-count'),actions=overlay.querySelector('.alex7-actions');
function render(mode){
 overlay.hidden=false;
 overlay.classList.toggle('wrong',mode==='wrong');
 overlay.classList.toggle('finished',mode==='finished'||mode==='stars');
 var item=texts[Math.max(count-1,0)];
 if(mode==='wrong'){title.textContent='LOOK AGAIN, ALEX!';line.textContent='Try again!';boy.src=imgs[3];award.textContent='?';}
 else if(mode==='finished'){title.textContent='SUPER GARAGE HERO!';line.textContent='You found all nine!';boy.src=imgs[4];award.textContent='';}
 else if(mode==='stars'){title.textContent='YOUR STARS, ALEX!';line.textContent='Great work!';boy.src=imgs[4];award.textContent='';}
 else{title.textContent=item[0];line.textContent=item[1];boy.src=imgs[item[2]];award.textContent='';}
 actions.hidden=!(mode==='finished'||mode==='stars');
 progress.replaceChildren();
 var gallery=document.createElement('div');gallery.className='alex-gallery';
 var upper=document.createElement('div');upper.className='alex-gallery-row';
 var lower=document.createElement('div');lower.className='alex-gallery-row';
 var starBar=document.createElement('div');starBar.className='alex-star-bar';
 for(var i=0;i<9;i++){
  // Each discovery fills the NEXT visible position. No holes or scattered stars.
  var id=earnedOrder[i],earned=typeof id==='number',fresh=earned&&i===earnedOrder.length-1&&mode==='correct';
  var car=document.createElement('div');car.className='alex-gallery-car'+(earned?' earned':'')+(fresh?' fresh':'');
  if(earned){
   var pic=document.createElement('img');
   pic.src='public/images/garage-review/'+collectionIds[id]+'.png';
   pic.alt=collectionNames[id];pic.decoding='async';car.appendChild(pic);
  }
  (i<5?upper:lower).appendChild(car);
  var star=document.createElement('span');star.className='alex-gallery-star'+(earned?' earned':'')+(fresh?' fresh':'');star.textContent='★';
  star.setAttribute('aria-label',earned?'Star '+(i+1)+': '+collectionNames[id]:'Star '+(i+1)+': not earned');starBar.appendChild(star);
 }
 gallery.appendChild(upper);gallery.appendChild(lower);
 progress.appendChild(gallery);progress.appendChild(starBar);
 progress.setAttribute('aria-label',count+' of nine vehicles found');
 counter.textContent=count+' / 9';
}
var collectionIds=['fire-truck','airport-fire-truck','police-car','excavator','mobile-crane','tractor','dump-truck','mars-rover','ambulance'];
var collectionNames=['Fire Truck','Airport Fire Truck','Police Car','Excavator','Mobile Crane','Tractor','Dump Truck','Mars Rover','Ambulance'];

// V9: approved prerecorded expressive Jessica speech, from the user's three MP3 files.
var rewardSounds={
 correct:null,
 wrong:null,
 finished:'assets/audio/rewards/03_Super_Garage_Hero.mp3'
};
var activeRewardAudio=null;
var currentVehicleIndex=0;
var vehiclePraiseFiles=['assets/audio/rewards/vehicles/01_fire-truck.mp3','assets/audio/rewards/vehicles/02_airport-fire-truck.mp3','assets/audio/rewards/vehicles/03_police-car.mp3','assets/audio/rewards/vehicles/04_excavator.mp3','assets/audio/rewards/vehicles/05_mobile-crane.mp3','assets/audio/rewards/vehicles/06_tractor.mp3','assets/audio/rewards/vehicles/07_dump-truck.mp3','assets/audio/rewards/vehicles/08_mars-rover.mp3','assets/audio/rewards/vehicles/09_ambulance.mp3'];

var currentMode='correct';
var finalPlaybackPromise=null;
function stopRewardAudio(){
 if(!activeRewardAudio)return;
 try{activeRewardAudio.pause();activeRewardAudio.removeAttribute('src');activeRewardAudio.load();}catch(e){}
 activeRewardAudio=null;
}
function playRewardAudio(mode){
 currentMode=mode;
 var file=(mode==='vehicle')?vehiclePraiseFiles[currentVehicleIndex]:rewardSounds[mode];
 stopRewardAudio();
 if(!file)return Promise.resolve(false);
 return new Promise(function(resolve){
  var audio=new Audio(file),done=false;
  activeRewardAudio=audio;
  function end(ok){if(done)return;done=true;if(activeRewardAudio===audio)activeRewardAudio=null;resolve(ok);}
  audio.addEventListener('ended',function(){end(true)},{once:true});
  audio.addEventListener('error',function(){end(false)},{once:true});
  try{var p=audio.play();if(p&&p.catch)p.catch(function(){end(false)});}catch(e){end(false)}
 });
}
function audioOrFallback(mode,words){
 return playRewardAudio(mode).then(function(ok){return ok?true:speak(words)});
}
var listening=overlay.querySelector('.alex8-listen');listening.hidden=true;listening.setAttribute('aria-hidden','true');listening.tabIndex=-1;
var activeLine='', utterance=null, speechBusy=false, serial=0;
// The existing game's English voice controller is the primary speech engine.
// Promise resolves when the utterance finishes; a native browser voice is a fallback.
function speakNative(text){return new Promise(function(resolve){
  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){resolve(false);return;}
  try{
    var u=new SpeechSynthesisUtterance(text);utterance=u;
    u.lang='en-US';u.rate=.91;u.pitch=1.08;
    var voices=window.speechSynthesis.getVoices();
    var american=voices.find(function(v){return /^en-US$/i.test(v.lang)})||voices.find(function(v){return /^en/i.test(v.lang)});
    if(american)u.voice=american;
    var complete=false;function finish(ok){if(complete)return;complete=true;resolve(ok);}
    u.onend=function(){finish(true)};u.onerror=function(){finish(false)};
    window.speechSynthesis.speak(u);
  }catch(e){resolve(false)}
});}
function speak(text){
  activeLine=text;
  if(!text)return Promise.resolve(false);
  try{
    var ctrl=window.AlexBrowserSpeech&&window.AlexBrowserSpeech.sharedController&&window.AlexBrowserSpeech.sharedController();
    if(ctrl&&ctrl.supported&&ctrl.supported()&&ctrl.speak){
      return Promise.resolve(ctrl.speak(text)).then(function(ok){return ok?true:speakNative(text)},function(){return speakNative(text)});
    }
  }catch(e){}
  return speakNative(text);
}
function praiseLine(mode){
  if(mode==='finished'||mode==='stars')return 'Amazing, Alex! You found all nine vehicles! You are a Super Garage Hero! Would you like to play again, see your stars, or explore the garage?';
  var t=texts[Math.max(0,count-1)];return t[0]+' '+t[1];
}
listening.addEventListener('click',function(){
  stopRewardAudio();try{var c=window.AlexBrowserSpeech&&window.AlexBrowserSpeech.sharedController&&window.AlexBrowserSpeech.sharedController();if(c&&c.stop)c.stop();else if(window.speechSynthesis)window.speechSynthesis.cancel()}catch(e){}
  audioOrFallback(currentMode,activeLine||praiseLine(finished?'finished':'correct'));
});
function stop(){if(timer!==null){clearTimeout(timer);timer=null;}stopRewardAudio();}
overlay.querySelector('[data-act="again"]').addEventListener('click',function(){location.assign('find-it.html?replay=1')});overlay.querySelector('[data-act="garage"]').addEventListener('click',function(){location.assign('garage.html')});overlay.querySelector('[data-act="stars"]').addEventListener('click',function(){render('stars')});
window.AlexRewardUI={
 onCorrect:function(vehicleIndex){if(finished)return;currentVehicleIndex=vehicleIndex;if(vehicleIndex<0||vehicleIndex>=9)return;if(earnedOrder.indexOf(vehicleIndex)!==-1)return;earnedOrder.push(vehicleIndex);stop();serial++;count=earnedOrder.length;finished=count===9;render(finished?'finished':'correct');if(finished){var task=document.getElementById('find-task');if(task)task.textContent='';/* Start sound synchronously in the ninth correct click, preserving browser user gesture. */finalPlaybackPromise=audioOrFallback('finished',praiseLine('finished'));}},
 onWrong:function(){
  if(finished||!overlay.hidden)return;
  stop();serial++;var at=serial;
  render('wrong');listening.hidden=true;
  Promise.race([audioOrFallback('wrong',"Hmm... That's okay, Alex! Let's look again. You can do it!"),new Promise(function(res){setTimeout(function(){res(false)},13000)})]).then(function(){
    if(at!==serial||finished)return;
    timer=setTimeout(function(){if(at===serial&&!finished){overlay.hidden=true;overlay.classList.remove('wrong')}},400);
  });
 },
 playWrongAudio:true,
 finishPraise:function(next){
   var at=++serial;
   var mode=finished?'finished':'correct';render(mode);listening.hidden=true;
   var words=praiseLine(mode);
   listening.disabled=true;
   // Do not ask a new question until the spoken praise has ended.
   Promise.race([(mode==='finished'&&finalPlaybackPromise)?finalPlaybackPromise:audioOrFallback(mode==='finished'?'finished':'vehicle',words),new Promise(function(resolve){setTimeout(function(){resolve(false)},16000)})]).then(function(){
     if(at!==serial)return;
     listening.disabled=false;
     if(finished){finalPlaybackPromise=null;return;}
     stop();timer=setTimeout(function(){if(at!==serial)return;overlay.hidden=true;if(typeof next==='function')next()},550);
   }).catch(function(){
     listening.disabled=false;
     if(finished)return;
     stop();timer=setTimeout(function(){if(at!==serial)return;overlay.hidden=true;if(typeof next==='function')next()},1600);
   });
 },
 isComplete:function(){return finished},getRoundCount:function(){return count}
};
})();
