/* Trophy Room button — placed opposite the already approved Watch Mission button. */
(function(){
  'use strict';
  if(document.getElementById('alex-trophy-link'))return;
  var link=document.createElement('a');link.id='alex-trophy-link';link.href='awards.html';
  link.textContent='🏆 My Awards';
  link.setAttribute('aria-label','Open my garage awards');
  link.style.cssText='position:fixed;left:max(18px,env(safe-area-inset-left));bottom:max(16px,env(safe-area-inset-bottom));z-index:201;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:46px;padding:10px 17px;border-radius:13px;background:#ffcc35;color:#10233e;border:2px solid #fff8ce;box-shadow:0 4px 12px rgba(0,0,0,.35);font:800 16px/1.1 system-ui,Arial;text-decoration:none;white-space:nowrap';
  document.body.appendChild(link);
})();
