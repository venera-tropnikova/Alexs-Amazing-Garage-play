(function () {
  "use strict";

  var LINES = {
    look: "Look at the pumpkins.",
    load: "Load the pumpkins.",
    full: "The trailer is full.",
    drive: "Drive to the barn.",
    success: "You did it!"
  };

  var step = "field";
  var line = document.getElementById("line");
  var action = document.getElementById("action");
  var field = document.getElementById("field");
  var bed = document.getElementById("bed");
  var rig = document.getElementById("rig");
  var success = document.getElementById("success");
  var tractorImg = document.querySelector(".tractor");
  var replay = document.getElementById("replay");
  var speechNote = "";

  var speech = window.AlexBrowserSpeech.createController({
    onStatus: function (text) {
      speechNote = text;
    }
  });

  function say(text) {
    line.textContent = text;
    return speech.speak(text);
  }

  // Place five distinct pumpkins in two staggered rows inside the trailer.
  // Values are normalized against the open bed, not the green side panel.
  var POSE = [
    { x: 0.04, y: 0.25, scale: 0.88, rot: -7 },
    { x: 0.22, y: 0.15, scale: 0.94, rot: 6 },
    { x: 0.40, y: 0.26, scale: 0.85, rot: -4 },
    { x: 0.57, y: 0.16, scale: 0.93, rot: 8 },
    { x: 0.75, y: 0.26, scale: 0.83, rot: -5 }
  ];

  function metrics(index) {
    var pose = POSE[index];
    var size = Math.max(21, bed.clientWidth * 0.22 * pose.scale);
    return {
      pose: pose,
      size: size,
      localX: bed.clientWidth * pose.x,
      localY: bed.clientHeight * pose.y
    };
  }

  function slotBox(index) {
    var place = metrics(index);
    var box = bed.getBoundingClientRect();
    return {
      left: box.left + place.localX,
      top: box.top + place.localY,
      size: place.size
    };
  }

  function parkInTrailer(pumpkin, index) {
    var place = metrics(index);
    pumpkin.style.transition = "none";
    pumpkin.style.position = "absolute";
    pumpkin.style.left = place.localX + "px";
    pumpkin.style.top = place.localY + "px";
    pumpkin.style.width = place.size + "px";
    pumpkin.style.height = place.size + "px";
    pumpkin.style.transform = "rotate(" + place.pose.rot + "deg)";
    pumpkin.style.zIndex = "1";
    bed.appendChild(pumpkin);
  }

  function loadPumpkins() {
    var pumpkins = Array.prototype.slice.call(field.querySelectorAll(".pumpkin"));
    var pending = pumpkins.length;
    pumpkins.forEach(function (pumpkin, index) {
      var from = pumpkin.getBoundingClientRect();
      var slot = slotBox(index);
      pumpkin.style.position = "fixed";
      pumpkin.style.left = from.left + "px";
      pumpkin.style.top = from.top + "px";
      pumpkin.style.margin = "0";
      pumpkin.style.width = from.width + "px";
      pumpkin.style.height = from.height + "px";
      pumpkin.addEventListener("transitionend", function onEnd(event) {
        if (event.propertyName !== "left") return;
        pumpkin.removeEventListener("transitionend", onEnd);
        parkInTrailer(pumpkin, index);
        pending -= 1;
        if (pending === 0) finishLoad();
      });
      requestAnimationFrame(function () {
        pumpkin.style.left = slot.left + "px";
        pumpkin.style.top = slot.top + "px";
        pumpkin.style.width = slot.size + "px";
        pumpkin.style.height = slot.size + "px";
        pumpkin.style.transform = "rotate(" + POSE[index].rot + "deg)";
      });
    });
    window.setTimeout(function () {
      if (step !== "loading") return;
      field.querySelectorAll(".pumpkin").forEach(function (pumpkin, index) {
        parkInTrailer(pumpkin, index);
      });
      finishLoad();
    }, 1600);
  }

  function finishLoad() {
    if (step !== "loading") return;
    step = "loaded";
    action.textContent = "Drive to the Barn";
    action.disabled = false;
    say(LINES.full);
  }

  function driveDistance() {
    // The tractor draws away toward the barn: move slightly to the right
    // while shrinking toward the far end of the road. Never crop it.
    var scale = 0.84;
    var room = window.innerWidth - 34 - rig.offsetLeft - rig.offsetWidth * scale;
    var desired = Math.min(window.innerWidth * 0.23, 240);
    return Math.max(0, Math.min(room, desired));
  }

  function driveToBarn() {
    var distance = driveDistance();
    rig.style.transform = "translateX(" + distance + "px) scale(0.84)";
    var done = false;
    function arrive() {
      if (done) return;
      done = true;
      step = "success";
      success.hidden = false;
      action.hidden = true;
      replay.hidden = false;
      say(LINES.success);
      line.textContent = ""; // one visual celebration, not a duplicate in the sky
    }
    rig.addEventListener("transitionend", function onMove(event) {
      if (event.propertyName !== "transform") return;
      rig.removeEventListener("transitionend", onMove);
      arrive();
    });
    window.setTimeout(arrive, 3200);
  }

  replay.addEventListener("click", function () { window.location.href = window.location.pathname; });

  action.addEventListener("click", function () {
    if (action.disabled) return;
    if (step === "field") {
      step = "loading";
      action.disabled = true;
      say(LINES.load);
      loadPumpkins();
      return;
    }
    if (step === "loaded") {
      step = "driving";
      action.disabled = true;
      say(LINES.drive);
      driveToBarn();
    }
  });

  window.addEventListener("resize", function () {
    Array.prototype.forEach.call(bed.querySelectorAll(".pumpkin"), parkInTrailer);
  });

  window.__pumpkinMission = {
    step: function () { return step; },
    line: function () { return line.textContent; },
    speech: function () { return speech.getAvailability(); },
    speechNote: function () { return speechNote; },
    driveDistance: driveDistance
  };

  function showPreviewStep() {
    var previewStep = new URLSearchParams(window.location.search).get("step");
    if (previewStep !== "loaded" && previewStep !== "success") return;
    Array.prototype.forEach.call(field.querySelectorAll(".pumpkin"), parkInTrailer);
    step = "loaded";
    line.textContent = LINES.full;
    action.textContent = "Drive to the Barn";
    if (previewStep === "success") {
      rig.style.transition = "none";
      rig.style.transform = "translateX(" + driveDistance() + "px) scale(0.84)";
      step = "success";
      success.hidden = false;
      action.hidden = true;
      replay.hidden = false;
      line.textContent = "";
    }
  }

  function showPreviewStepAfterLayout() {
    requestAnimationFrame(function () {
      requestAnimationFrame(showPreviewStep);
    });
  }

  if (tractorImg.complete && tractorImg.naturalWidth) showPreviewStepAfterLayout();
  else tractorImg.addEventListener("load", showPreviewStepAfterLayout);
})();
