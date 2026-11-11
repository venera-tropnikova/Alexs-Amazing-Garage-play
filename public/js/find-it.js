(function () {
  var data = window.GARAGE_FLEET_DATA;
  var fleet = data.fleet;
  var bays = document.getElementById("bays");
  var task = document.getElementById("find-task");
  var feedback = document.getElementById("find-feedback");
  var replay = document.getElementById("find-replay");
  var back = document.getElementById("find-garage");
  var svg = document.querySelector(".bay-glow");
  var clip = null;
  var endTimer = 0;
  var locked = false;
  var queue = [];
  var target = 0;
  var lastIndex = -1;
  var slots = [];
  var vehicleIds = ["fire-truck", "airport-fire-truck", "police-car", "excavator", "mobile-crane", "tractor", "dump-truck", "mars-rover", "ambulance"];
  var activeId = new URLSearchParams(window.location.search).get("v");
  var guidedIndex = vehicleIds.indexOf(activeId);
  var guided = guidedIndex >= 0;
  var successHold = 2800;
  var praisePause = 600;
  var speechNoticeShown = false;
  var speechReady = false;

  function gameSpeech() {
    if (!window.AlexBrowserSpeech) return null;
    return window.AlexBrowserSpeech.sharedController();
  }

  function unavailableText() {
    var speech = gameSpeech();
    if (speech && typeof speech.unavailableMessage === "function") {
      return speech.unavailableMessage();
    }
    if (window.AlexBrowserSpeech && window.AlexBrowserSpeech.messages) {
      return window.AlexBrowserSpeech.messages.noEnglish;
    }
    return "No English voices are available on this device.";
  }

  function showSpeechUnavailable() {
    if (speechNoticeShown) return;
    speechNoticeShown = true;
    if (!feedback.textContent) {
      feedback.textContent = unavailableText();
    }
  }

  function stopClip() {
    window.clearTimeout(endTimer);
    var speech = gameSpeech();
    if (speech) speech.stop();
    if (!clip) return;
    clip.pause();
    clip.removeAttribute("src");
    clip.load();
    if (clip.parentNode) clip.parentNode.removeChild(clip);
    clip = null;
  }

  function playRecorded(src, onEnded) {
    stopClip();
    var settled = false;
    var playing = false;
    function arm(delay) {
      if (settled || !onEnded) return;
      settled = true;
      endTimer = window.setTimeout(onEnded, delay);
    }
    var heard = false;
    clip = new Audio(src);
    document.body.appendChild(clip);
    clip.addEventListener("ended", function () {
      heard = true;
      if (playing) arm(praisePause);
    });
    var started = clip.play();
    if (started && started.then) {
      started.then(function () {
        playing = true;
        if (heard) arm(praisePause);
      }).catch(function () { arm(successHold); });
    }
  }

  function playLine(line, onEnded) {
    if (!line) {
      if (onEnded) holdSuccess(Date.now(), onEnded);
      return;
    }
    stopClip();
    var speech = gameSpeech();
    if (speech && speech.supported() && line.text) {
      // waitForVoices happens inside speak(); do not show errors while loading.
      speech.speak(line.text).then(function (ok) {
        if (ok) {
          if (onEnded) endTimer = window.setTimeout(onEnded, praisePause);
          return;
        }
        if (line.recorded && line.src) {
          playRecorded(line.src, onEnded);
          return;
        }
        showSpeechUnavailable();
        if (onEnded) holdSuccess(Date.now(), onEnded);
      });
      return;
    }
    if (line.recorded && line.src) {
      playRecorded(line.src, onEnded);
      return;
    }
    showSpeechUnavailable();
    if (onEnded) holdSuccess(Date.now(), onEnded);
  }

  function clearSelection() {
    slots.forEach(function (slot) {
      slot.classList.remove("is-selected");
      slot.setAttribute("aria-pressed", "false");
    });
  }

  function lineFor(list, index) {
    return list[index];
  }

  function showPrompt() {
    stopClip();
    var prompt = lineFor(data.sound.prompts, target);
    task.textContent = prompt.text;
    feedback.textContent = "";
    clearSelection();
    playLine(prompt);
  }

  function holdSuccess(started, done) {
    var remain = successHold - (Date.now() - started);
    if (remain > 0) {
      endTimer = window.setTimeout(done, remain);
      return;
    }
    done();
  }

  function takeQueue() {
    var order = fleet.map(function (_item, index) { return index; });
    for (var i = order.length - 1; i > 0; i -= 1) {
      var swap = Math.floor(Math.random() * (i + 1));
      var held = order[i];
      order[i] = order[swap];
      order[swap] = held;
    }
    if (order.length > 1 && order[0] === lastIndex) {
      order.push(order.shift());
    }
    return order;
  }

  function nextTarget() {
    if (guided) { target = guidedIndex; showPrompt(); locked = false; return; }
    if (!queue.length) queue = takeQueue();
    target = queue.shift();
    showPrompt();
    locked = false;
  }

  function soundLines() {
    return data.sound.prompts.concat(data.sound.praise, [data.sound.hint]);
  }

  function beginWithWavProbe() {
    var lines = soundLines();
    var local = data.sound.distribution === "excluded" && lines.every(function (line) {
      return line.recorded && line.src;
    });
    if (!local) {
      showSpeechUnavailable();
      nextTarget();
      return;
    }
    var settled = false;
    var probe = new Audio(data.sound.hint.src);
    function finish(found) {
      if (settled) return;
      settled = true;
      probe.removeAttribute("src");
      probe.load();
      if (!found) {
        lines.forEach(function (line) { line.recorded = false; });
        showSpeechUnavailable();
      }
      nextTarget();
    }
    probe.addEventListener("loadedmetadata", function () { finish(true); });
    probe.addEventListener("error", function () { finish(false); });
    probe.load();
  }

  function begin() {
    var speech = gameSpeech();
    if (speech && speech.supported()) {
      speech.waitForVoices().then(function (choice) {
        speechReady = !!(choice && choice.voice);
        if (speechReady) {
          nextTarget();
          return;
        }
        beginWithWavProbe();
      });
      return;
    }
    beginWithWavProbe();
  }

  function choose(index) {
    if (locked) return;
    if (index !== target) {
      locked = true;
      feedback.textContent = data.sound.hint.text;
      playLine(data.sound.hint);
      window.setTimeout(function () { locked = false; }, 450);
      return;
    }
    locked = true;
    lastIndex = target;
    slots[index].classList.add("is-selected");
    slots[index].setAttribute("aria-pressed", "true");
    var praise = lineFor(data.sound.praise, index);
    feedback.textContent = praise.text;
    if (guided) {
      var finish = document.getElementById("find-next");
      if (finish) {
        finish.hidden = false;
        finish.focus();
      }
      playLine(praise);
    } else {
      playLine(praise, nextTarget);
    }
  }

  function replayTask() {
    if (locked) return;
    var prompt = data.sound.prompts[target];
    if (!prompt) return;
    playLine(prompt);
  }

  data.frames.forEach(function (points, index) {
    var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "g" + (index + 1));
    ["edge", "core"].forEach(function (kind) {
      var line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      line.setAttribute("class", kind);
      line.setAttribute("points", points);
      group.appendChild(line);
    });
    svg.appendChild(group);
  });

  fleet.forEach(function (item, index) {
    var button = document.createElement("button");
    var art = document.createElement("span");
    var picture = document.createElement("img");
    var label = document.createElement("span");
    var config = data.display[item[0]];
    button.type = "button";
    button.className = "bay-slot bay-" + (index + 1);
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", item[0]);
    art.className = "slot-art";
    picture.alt = "";
    picture.src = item[3];
    picture.style.setProperty("--vehicle-scale", String(config.scale));
    picture.style.setProperty("--vehicle-bottom", config.bottom);
    picture.style.setProperty("--vehicle-max-width", config.maxWidth);
    picture.style.setProperty("--vehicle-inset", config.inset);
    picture.style.setProperty("--vehicle-shift-x", config.shiftX);
    picture.classList.add("floor-contact");
    picture.style.setProperty("--anchor-x", config.anchorX);
    picture.style.setProperty("--anchor-y", config.anchorY);
    picture.style.setProperty("--contact-top", config.contactTop);
    picture.style.setProperty("--contact-x", config.contactX);
    if (config.groundRotate) picture.style.setProperty("--ground-rotate", config.groundRotate);
    if (config.shadows) config.shadows.forEach(function (shadow) {
      var mark = document.createElement("span");
      mark.className = "contact-shadow";
      mark.style.left = shadow.x;
      mark.style.top = shadow.y;
      mark.style.width = shadow.w;
      art.appendChild(mark);
    });
    label.className = "slot-name";
    label.textContent = item[0];
    art.appendChild(picture);
    button.appendChild(art);
    button.appendChild(label);
    button.addEventListener("click", function () { choose(index); });
    bays.appendChild(button);
    slots.push(button);
  });

  if (guided) {
    back.textContent = "← Back to Explore";
    back.href = "preview/vehicle-explore/explore.html?v=" + encodeURIComponent(activeId);
    var next = document.getElementById("find-next");
    if (next) {
      if (activeId === "tractor") {
        next.href = "preview/vehicle-action/tractor-pumpkin-harvest/";
        next.textContent = "Next: Pumpkin Harvest →";
      } else {
        next.href = "preview/vehicle-action/coming-soon.html?v=" + encodeURIComponent(activeId);
        next.textContent = "Next: Machine in Action →";
      }
    }
  }
  replay.addEventListener("click", replayTask);
  back.addEventListener("click", stopClip);
  window.addEventListener("pagehide", stopClip);
  begin();
}());
