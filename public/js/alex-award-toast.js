/* Premium earned-award overlay using the actual vehicle artwork. */
(function(){
'use strict';
window.addEventListener('alex-award-unlocked',function(event){
  if(!window.AlexAwards || window.AlexAwards.count()===9)return;
  var award=window.AlexAwards.fleet.find(function(x){return x[0]===event.detail.id;});if(!award)return;
  var old=document.getElementById('alex-award-toast');if(old)old.remove();
  var cover=document.createElement('div');cover.id='alex-award-toast';cover.setAttribute('role','dialog');cover.setAttribute('aria-label','New vehicle award');
  cover.style.cssText='position:fixed;z-index:99999;inset:0;display:flex;justify-content:center;align-items:center;background:rgba(3,9,24,.7);padding:15px;font-family:Trebuchet MS,Segoe UI,Arial,sans-serif';
  var panel=document.createElement('div');panel.style.cssText='width:min(540px,100%);position:relative;padding:22px 20px 24px;background:radial-gradient(ellipse at 50% 30%,#3a6290,#132a49 62%,#081831);border:3px solid #dbb25d;border-radius:26px;box-shadow:0 20px 80px #000b,inset 0 0 40px #ffde6316;text-align:center;color:#fff';
  var kicker=document.createElement('div');kicker.textContent='NEW VEHICLE UNLOCKED';kicker.style.cssText='letter-spacing:.17em;color:#f5d384;font-size:13px;font-weight:900';
  var title=document.createElement('div');title.textContent='Great job, Alex!';title.style.cssText='font-size:clamp(29px,5vw,42px);font-weight:1000;margin:8px 0 2px';
  var photo=document.createElement('img');photo.src='public/images/awards/'+award[0]+'.webp';photo.alt=award[1];photo.style.cssText='display:block;width:100%;height:min(32vh,215px);object-fit:contain;filter:drop-shadow(0 15px 10px #000b);margin:6px auto';
  var name=document.createElement('div');name.textContent=award[1]+' badge earned!';name.style.cssText='font-size:clamp(19px,3vw,25px);font-weight:900;color:#ffe1a0';
  var progress=document.createElement('div');progress.textContent=window.AlexAwards.count()+' of 9 awards collected';progress.style.cssText='margin:7px 0 15px;color:#ccddf5;font-weight:800';
  var link=document.createElement('a');link.href='awards.html';link.textContent='My Awards';link.style.cssText='display:inline-flex;align-items:center;justify-content:center;background:#288ff0;color:#fff;border:2px solid #7ac4ff;text-decoration:none;border-radius:13px;min-height:50px;padding:10px 25px;font-size:18px;font-weight:900';
  var close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Close reward');close.style.cssText='position:absolute;top:6px;right:12px;color:white;border:0;background:transparent;font-size:34px;cursor:pointer';close.onclick=function(){cover.remove();};
  panel.append(kicker,title,photo,name,progress,link,close);cover.appendChild(panel);document.body.appendChild(cover);
  var t=window.setTimeout(function(){if(cover.isConnected)cover.remove();},4500);
  cover.addEventListener('click',function(e){if(e.target===cover){window.clearTimeout(t);cover.remove();}});
});
})();
