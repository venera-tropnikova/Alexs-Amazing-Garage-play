/**
 * Explore shell (preview) — kids game UI.
 * Data/coords/TTS unchanged. Markers use exact hotspot % with optional visual offset.
 * No fake Open/Raise. visualPass stays false.
 */
(function (global) {
  "use strict";

  function params() {
    return new URLSearchParams(global.location.search);
  }

  function diagOn() {
    return params().get("diag") === "1";
  }

  function prefersReducedMotion() {
    return !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function resolveConfig() {
    var id = params().get("v") || params().get("vehicle") || "fire-truck";
    var fleet = global.VehicleExploreFleet;
    if (!fleet || !fleet.byId) throw new Error("VehicleExploreFleet missing");
    var config = fleet.byId(id);
    if (!config) throw new Error("Unknown vehicle id: " + id);
    return config;
  }

  function assetUrl(rel) {
    if (!rel) return "";
    try {
      return new URL(rel, document.baseURI).href;
    } catch (error) {
      return rel;
    }
  }

  function gameSpeech() {
    return global.AlexBrowserSpeech ? global.AlexBrowserSpeech.sharedController() : null;
  }

  function unavailableText() {
    var speech = gameSpeech();
    if (speech && typeof speech.unavailableMessage === "function") {
      return speech.unavailableMessage();
    }
    if (global.AlexBrowserSpeech && global.AlexBrowserSpeech.messages) {
      return global.AlexBrowserSpeech.messages.noEnglish;
    }
    return "No English voices are available on this device.";
  }

  function speakLine(text) {
    var speech = gameSpeech();
    var line = String(text || "").trim();
    if (!speech || !speech.supported() || !line) return Promise.resolve(false);
    return speech.speak(line);
  }

  function stopSpeech() {
    var speech = gameSpeech();
    if (speech) speech.stop();
  }

  function buildNav() {
    var nav = document.createElement("nav");
    nav.className = "route-nav";
    nav.setAttribute("aria-label", "Main navigation");
    // Game route: Home → index.html, Garage → approved garage.html.
    // Dev catalog vehicle-explore/index.html is not linked from play.
    nav.innerHTML =
      '<a class="route-home" href="index.html" aria-label="Home">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 4 3 12h3v8h5v-5h2v5h5v-8h3z"/></svg><span>Home</span></a>' +
      '<a class="route-garage" href="garage.html" aria-label="Garage">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3 10 12 3l9 7v11h-6v-6H9v6H3z"/></svg><span>Garage</span></a>';
    return nav;
  }

  function sceneViews(config) {
    var scene = config.scene || {};
    if (scene.views && scene.views.length) return scene.views;
    if (scene.layers && scene.layers.closed) {
      return [
        {
          id: "outside",
          label: "Outside",
          kind: scene.plateKind === "full-composite" ? "composite" : "cutout",
          src: scene.layers.closed,
          hotspots: scene.hotspotOverrides || null
        }
      ];
    }
    return [];
  }

  function canPlayStudy(config) {
    return sceneViews(config).length > 0;
  }

  function showDiag(config, extras) {
    if (!diagOn()) return;
    var scene = config.scene || {};
    var box = document.createElement("pre");
    box.className = "explore-diag";
    box.setAttribute("role", "status");
    var views = sceneViews(config);
    var lines = [
      "diag=1",
      "id=" + config.id,
      "visualStatus=" + (scene.visualStatus || "?"),
      "visualPass=" + !!scene.visualPass,
      "views=" + views.map(function (v) {
        return v.id;
      }).join(","),
      "mode=kids-game-ui"
    ];
    (scene.missingArt || []).forEach(function (m) {
      lines.push("missing: " + m);
    });
    if (extras) lines = lines.concat(extras);
    box.textContent = lines.join("\n");
    document.body.appendChild(box);
  }

  function namedParts(registry) {
    return ((registry && registry.parts) || []).filter(function (p) {
      return p && p.name && p.explanation;
    });
  }

  function viewStudyParts(view, registry) {
    if (view && view.parts && view.parts.length) {
      return view.parts.filter(function (p) {
        return p && p.id && p.name && p.explanation;
      });
    }
    return namedParts(registry);
  }

  /* Visual marker sits beside exact target so gear stays clear. */
  var PIN_OFFSETS = [{ dx: 0, dy: 0 }];
  function viewIconSvg(viewId) {
    var id = String(viewId || "").toLowerCase();
    if (id === "outside") {
      return (
        '<svg class="mode-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v1.2h-2V4a1 1 0 0 1 1-1zm7.1 2.2 1 1-1.5 1.5-1-1 1.5-1.5zM3.9 5.2l1.5 1.5-1 1L2.9 6.2l1-1zM19 11h2v2h-2v-2zM3 11h2v2H3v-2zm13.4 5.3 1 1-1.5 1.5-1-1 1.5-1.5zM5.1 16.3l1.5 1.5-1 1-1.5-1.5 1-1zM12 7a5 5 0 1 1 0 10A5 5 0 0 1 12 7zm0 2a3 3 0 1 0 .001 6.001A3 3 0 0 0 12 9z"/></svg>'
      );
    }
    if (id.indexOf("inside") !== -1 || id === "more") {
      return (
        '<svg class="mode-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path fill="currentColor" d="M4 4h16v4H4V4zm0 6h16v10H4V10zm3 2v6h3v-6H7zm5 0v6h3v-6h-3zm5 0v6h3v-6h-3z"/></svg>'
      );
    }
    if (id === "front") {
      return (
        '<svg class="mode-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path fill="currentColor" d="M6.5 7h11l1.8 4.5H20v7h-2.5v-2h-11v2H4v-7h.7L6.5 7zm1.5 2 .9 2.5h6.2L16 9H8zm-.8 6.8a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8zm9.6 0a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8z"/></svg>'
      );
    }
    if (id === "back") {
      return (
        '<svg class="mode-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path fill="currentColor" d="M5 7h14v11H5V7zm2.2 2.2v6.6h9.6V9.2H7.2zM8 18.5h3V20H8v-1.5zm5 0h3V20h-3v-1.5z"/></svg>'
      );
    }
    if (id === "trailer") {
      return (
        '<svg class="mode-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path fill="currentColor" d="M2.8 8.5h8.4v7.2H8.4a2.3 2.3 0 1 1-4.4 0H2.8V8.5zm10.4 2.2H21v5H19a2.3 2.3 0 1 1-4.4 0h-1.4v-5zM6.2 17a1.1 1.1 0 1 0 0-2.2A1.1 1.1 0 0 0 6.2 17zm10.6 0a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2z"/></svg>'
      );
    }
    return (
      '<svg class="mode-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<circle cx="12" cy="12" r="7" fill="currentColor"/></svg>'
    );
  }

  function buildLessonPanel() {
    var panel = document.createElement("section");
    panel.className = "lesson-panel";
    panel.hidden = true;
    panel.setAttribute("aria-live", "polite");

    var close = document.createElement("button");
    close.type = "button";
    close.className = "lesson-close";
    close.setAttribute("aria-label", "Close");
    close.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M6.4 6.4 12 12l5.6-5.6 1.4 1.4L13.4 13.4l5.6 5.6-1.4 1.4L12 14.8l-5.6 5.6-1.4-1.4 5.6-5.6-5.6-5.6z"/></svg>';

    var title = document.createElement("h2");
    title.className = "lesson-title";

    var text = document.createElement("p");
    text.className = "lesson-text";

    var hear = document.createElement("button");
    hear.type = "button";
    hear.className = "lesson-hear";
    hear.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a3.5 3.5 0 0 0-1.9-3.1v6.2A3.5 3.5 0 0 0 16.5 12zM14.2 5.1v1.8a5.8 5.8 0 0 1 0 10.2v1.8a7.5 7.5 0 0 0 0-13.8z"/></svg>' +
      "<span>Hear it</span>";
    hear.hidden = true;

    panel.appendChild(close);
    panel.appendChild(title);
    panel.appendChild(text);
    panel.appendChild(hear);
    return { panel: panel, title: title, text: text, close: close, hear: hear };
  }

  function pulseOnce(el, className) {
    if (!el || prefersReducedMotion()) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
    var done = function () {
      el.classList.remove(className);
      el.removeEventListener("animationend", done);
    };
    el.addEventListener("animationend", done);
  }

  function wireLesson(ui) {
    var current = null;

    function clearActivePins() {
      document.querySelectorAll(".scene-pin.is-active").forEach(function (pin) {
        pin.classList.remove("is-active", "is-pop");
        var hit = pin.querySelector(".scene-hit");
        if (hit) hit.setAttribute("aria-expanded", "false");
      });
    }

    function openPart(part) {
      current = part;
      ui.title.textContent = part.name;
      ui.text.textContent = part.explanation;
      ui.panel.hidden = false;
      ui.hear.hidden = !part.explanation;
      document.body.classList.add("lesson-open");
      clearActivePins();
      var pin = document.querySelector('.scene-pin[data-part="' + part.id + '"]');
      if (pin) {
        pin.classList.add("is-active");
        var activeHit = pin.querySelector(".scene-hit");
        if (activeHit) activeHit.setAttribute("aria-expanded", "true");
        pulseOnce(pin, "is-pop");
      }
      stopSpeech();
      speakLine(part.name + ". " + part.explanation).then(function (ok) {
        if (!ok) {
          var note = ui.panel.querySelector(".lesson-speech-note");
          if (!note) {
            note = document.createElement("p");
            note.className = "lesson-speech-note";
            note.setAttribute("role", "status");
            ui.panel.appendChild(note);
          }
          note.textContent = unavailableText();
        }
      });
    }

    function closeLesson() {
      ui.panel.hidden = true;
      current = null;
      document.body.classList.remove("lesson-open");
      clearActivePins();
      stopSpeech();
      var note = ui.panel.querySelector(".lesson-speech-note");
      if (note) note.remove();
    }

    ui.close.addEventListener("click", closeLesson);
    ui.hear.addEventListener("click", function () {
      if (current) speakLine(current.explanation);
    });

    return { openPart: openPart, closeLesson: closeLesson };
  }

  function buildPartsMenu(openPart) {
    var wrap = document.createElement("div");
    wrap.className = "parts-menu";

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "parts-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML =
      '<svg class="mode-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4 6h16v2.4H4V6zm0 4.8h16V14H4v-3.2zm0 4.8h16V19H4v-3.4z"/></svg>' +
      '<span class="parts-toggle-label">Parts</span>' +
      '<span class="parts-toggle-count">0</span>';

    var sheet = document.createElement("div");
    sheet.className = "parts-sheet";
    sheet.hidden = true;
    sheet.setAttribute("role", "menu");
    sheet.setAttribute("aria-label", "Parts");

    function setOpen(open) {
      sheet.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      wrap.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(sheet.hidden);
    });

    function fill(parts, hotspots) {
      sheet.textContent = "";
      var map = hotspots || {};
      var count = 0;
      (parts || []).forEach(function (part) {
        var place = map[part.id];
        if (!place || place.x == null || place.y == null) return;
        count += 1;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "parts-item";
        btn.setAttribute("role", "menuitem");
        btn.textContent = part.name;
        btn.addEventListener("click", function () {
          openPart(part);
          setOpen(false);
        });
        sheet.appendChild(btn);
      });
      wrap.hidden = count < 1;
      toggle.querySelector(".parts-toggle-count").textContent = String(count);
      setOpen(false);
    }

    wrap.appendChild(toggle);
    wrap.appendChild(sheet);
    wrap.fillForView = fill;
    wrap.closeSheet = function () {
      setOpen(false);
    };
    return wrap;
  }

  function buildHint() {
    var hint = document.createElement("p");
    hint.className = "explore-hint";
    hint.setAttribute("role", "status");
    hint.hidden = true;
    return {
      el: hint,
      set: function (text) {
        var line = String(text || "").trim();
        hint.textContent = line;
        hint.hidden = !line;
      }
    };
  }

  function buildModeBar(views, onSelect) {
    var bar = document.createElement("div");
    bar.className = "mode-bar";
    bar.setAttribute("role", "tablist");
    bar.setAttribute("aria-label", "Views");
    var buttons = [];
    var lookInsideBtn = null;

    views.forEach(function (view, index) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mode-btn";
      btn.dataset.view = view.id || "";
      btn.innerHTML = viewIconSvg(view.id) + '<span class="mode-label">' + (index === 0 ? "Back outside" : (view.label || view.id)) + "</span>";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", index === 0 ? "true" : "false");
      if (index === 0) btn.classList.add("is-active");
      if (String(view.id || "").indexOf("inside") !== -1 || view.id === "more") {
        lookInsideBtn = btn;
        btn.classList.add("mode-btn-inside");
      }
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
          // Only offer views that the child can switch TO, not the current view.
          b.hidden = (b === btn);
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        onSelect(view, btn);
      });
      buttons.push(btn);
      bar.appendChild(btn);
    });

    // Initial screen is Outside: there is no reason to show an Outside button.
    buttons.forEach(function (button, index) { button.hidden = index === 0; });
    if (views.length < 2) bar.hidden = true;

    return {
      el: bar,
      lookInsideBtn: lookInsideBtn,
      pulseLookInsideOnce: function () {
        if (!lookInsideBtn || prefersReducedMotion()) return;
        if (lookInsideBtn.dataset.pulsed === "1") return;
        lookInsideBtn.dataset.pulsed = "1";
        lookInsideBtn.classList.add("is-invite-pulse");
        var clear = function () {
          lookInsideBtn.classList.remove("is-invite-pulse");
          lookInsideBtn.removeEventListener("animationend", clear);
        };
        lookInsideBtn.addEventListener("animationend", clear);
      }
    };
  }

  function appendPins(hitHost, parts, openPart, hotspots) {
    var map = hotspots || {};
    var index = 0;
    (parts || []).forEach(function (part) {
      var place = map[part.id];
      if (!place || place.x == null || place.y == null) return;
      var offset = PIN_OFFSETS[index % PIN_OFFSETS.length];
      index += 1;

      var pin = document.createElement("div");
      pin.className = "scene-pin";
      pin.dataset.part = part.id;
      // The fire truck rear hatch must sit on the body, not in empty sky.
      var targetX = part.id === "compartment-left-rear-lift" ? 83 : place.x;
      var targetY = part.id === "compartment-left-rear-lift" ? 58 : place.y;
      pin.style.left = targetX + "%";
      pin.style.top = targetY + "%";

      var tip = document.createElement("span");
      tip.className = "scene-pin-tip";
      tip.setAttribute("aria-hidden", "true");

      var stem = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      stem.setAttribute("class", "scene-pin-stem");
      stem.setAttribute("aria-hidden", "true");
      var pad = 6;
      var minX = Math.min(0, offset.dx) - pad;
      var minY = Math.min(0, offset.dy) - pad;
      var maxX = Math.max(0, offset.dx) + pad;
      var maxY = Math.max(0, offset.dy) + pad;
      stem.setAttribute("viewBox", minX + " " + minY + " " + (maxX - minX) + " " + (maxY - minY));
      stem.style.width = maxX - minX + "px";
      stem.style.height = maxY - minY + "px";
      stem.style.left = minX + "px";
      stem.style.top = minY + "px";
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(offset.dx));
      line.setAttribute("y1", String(offset.dy));
      line.setAttribute("x2", "0");
      line.setAttribute("y2", "0");
      stem.appendChild(line);

      var hit = document.createElement("button");
      hit.type = "button";
      hit.className = "scene-hit";
      hit.style.transform =
        "translate(calc(-50% + " + offset.dx + "px), calc(-50% + " + offset.dy + "px))";
      hit.setAttribute("aria-label", part.name);
      hit.dataset.part = part.id;
      // Show the part name only for the active dot; never show all names at once.
      hit.setAttribute("aria-expanded", "false");
      var tag = document.createElement("span");
      tag.className = "scene-pin-name";
      tag.textContent = part.name;
      tag.setAttribute("aria-hidden", "true");
      hit.addEventListener("click", function () {
        if (pin.classList.contains("is-active")) {
          var close = document.querySelector(".lesson-close");
          if (close) close.click();
        } else {
          openPart(part);
        }
      });

      pin.appendChild(stem);
      pin.appendChild(tip);
      pin.appendChild(hit);
      pin.appendChild(tag);
      hitHost.appendChild(pin);
    });
  }

  function fitPlate(stage, plate, img) {
    var stageW = stage.clientWidth;
    var stageH = stage.clientHeight;
    var natW = img.naturalWidth || 1672;
    var natH = img.naturalHeight || 941;
    if (stageW < 40 || stageH < 40 || natW < 1 || natH < 1) return;
    // Keep the existing sizing for seven vehicles and for all exterior views.
    // The dump truck and Mars rover have smaller source assets and need only
    // a measured, modest boost inside; preserve the registered hotspot layout.
    var inside = document.body.classList.contains("scene-cutout-view");
    var vehicleId = document.body.dataset.vehicleId || "";
    var requested = 1;
    if (inside && vehicleId === "dump-truck") requested = 1.10;
    if (inside && vehicleId === "mars-rover") requested = 1.12;
    var scale = Math.min(requested, stageW / natW, stageH / natH);
    if (inside) {
      var widthFill = requested > 1 ? 0.84 : 0.78;
      var heightFill = requested > 1 ? 0.84 : 0.78;
      scale = Math.min(scale, (stageW * widthFill) / natW, (stageH * heightFill) / natH);
    }
    var w = Math.floor(natW * scale);
    var h = Math.floor(natH * scale);
    // Match the header to the original 16:9 photo frame, not the
    // smaller cutout image. Both Explore views keep one stable header.
    var panel = stage.closest(".game-panel");
    if (panel) {
      var photoWidth = Math.floor(Math.min(stageW, stageH * (1672 / 941), 1672));
      panel.style.setProperty("--photo-board-width", photoWidth + "px");
    }
    plate.style.width = w + "px";
    plate.style.height = h + "px";
    img.style.width = w + "px";
    img.style.height = h + "px";
  }

  // Visual tutorial: show the gesture immediately, without a start overlay or text.
  // It is anchored to a real hotspot and removed after the child's first tap.
  function buildDotGuide(stage) {
    var finished = false;
    var target = null;
    var host = null;
    var promptAttempted = false;

    function clearPointer() {
      if (target) target.classList.remove("dot-tutorial-target");
      target = null;
    }
    function dismiss() {
      finished = true;
      clearPointer();
    }
    function reveal(view, hitHost) {
      host = hitHost;
      clearPointer();
      if (finished || !host) return;
      var pins = Array.prototype.slice.call(host.querySelectorAll(".scene-pin"));
      if (!pins.length) return;
      // Prefer a clearly visible dot toward the middle of the scene so the
      // pointer itself never floats outside the frame or hides the title.
      var middle = pins.find(function (pin) {
        var x = parseFloat(pin.style.left);
        var y = parseFloat(pin.style.top);
        return x > 30 && x < 73 && y > 35 && y < 78;
      });
      target = middle || pins[0];
      target.classList.add("dot-tutorial-target");

      // Browser autoplay restrictions mean this is a best-effort enhancement.
      // Visual guidance remains useful and never depends on audible speech.
      if (!promptAttempted) {
        promptAttempted = true;
        global.setTimeout(function () {
          if (finished) return;
          try {
            if (!global.speechSynthesis || !global.SpeechSynthesisUtterance) return;
            var utterance = new global.SpeechSynthesisUtterance("Tap the blue dots!");
            utterance.lang = "en-US";
            utterance.rate = 0.88;
            utterance.volume = 1;
            global.speechSynthesis.speak(utterance);
          } catch (_error) { /* autoplay unsupported; gesture is enough */ }
        }, 400);
      }
    }
    stage.addEventListener("click", function (event) {
      if (event.target.closest && event.target.closest(".scene-hit")) dismiss();
    }, true);
    return { reveal: reveal, dismiss: dismiss };
  }

  function mountViewStage(stage, panel, registry, openPart) {
    // Background extension is visual only; the main vehicle image stays uncropped.
    var extendedPhoto = document.createElement("img");
    extendedPhoto.className = "scene-extended-photo";
    extendedPhoto.alt = "";
    extendedPhoto.setAttribute("aria-hidden", "true");
    extendedPhoto.hidden = true;
    stage.appendChild(extendedPhoto);
    var guide = buildDotGuide(stage);
    var wrap = document.createElement("div");
    wrap.className = "scene-composite";
    var plate = document.createElement("div");
    plate.className = "scene-composite-plate";
    var img = document.createElement("img");
    img.className = "scene-composite-img";
    img.alt = "";
    img.draggable = false;
    var hitHost = document.createElement("div");
    hitHost.className = "scene-hit-host";
    plate.appendChild(img);
    plate.appendChild(hitHost);
    wrap.appendChild(plate);
    stage.appendChild(wrap);

    window.addEventListener("resize", function () {
      fitPlate(stage, plate, img);
    });

    function showView(view) {
      if (!view || !view.src) return;
      var isComposite = view.kind === "composite";
      panel.classList.toggle("is-cutout-view", !isComposite);
      document.body.classList.toggle("scene-full-composite", isComposite);
      document.body.classList.toggle("scene-cutout-view", !isComposite);
      document.body.classList.toggle("scene-equipment-view", !isComposite);
      // Extend the scene photo into the side gutters without cropping the
      // actual interactive view or changing hotspot coordinates.
      extendedPhoto.hidden = !isComposite;
      if (isComposite) extendedPhoto.src = assetUrl(view.src);
      img.alt = view.hint || view.label || "";
      hitHost.textContent = "";
      var parts = viewStudyParts(view, registry);
      function afterLoad() {
        fitPlate(stage, plate, img);
        appendPins(hitHost, parts, openPart, view.hotspots || {});
        guide.reveal(view, hitHost);
      }
      img.onload = afterLoad;
      img.src = assetUrl(view.src);
      if (img.complete && img.naturalWidth) afterLoad();
    }

    return { showView: showView };
  }

  function mount(config) {
    document.body.classList.add("vehicle-explore-shell", "notranslate");
    document.body.setAttribute("translate", "no");
    document.body.dataset.vehicleId = config.id;
    var views = sceneViews(config);
    if (canPlayStudy(config)) document.body.classList.add("scene-playable");
    else document.body.classList.add("scene-awaiting-art");
    if (views[0] && views[0].kind === "composite") {
      document.body.classList.add("scene-full-composite");
    }

    // Navigation is mounted inside the game board, not floating outside.

    var screen = document.getElementById("screen");
    if (!screen) {
      screen = document.createElement("main");
      screen.id = "screen";
      screen.className = "screen";
      document.body.appendChild(screen);
    }
    screen.textContent = "";

    var panel = document.createElement("div");
    panel.className = "game-panel";
    screen.appendChild(panel);

    // One unified in-board header: navigation, title and view controls.
    var hud = document.createElement("header");
    hud.className = "game-hud";
    panel.appendChild(hud);
    hud.appendChild(buildNav());

    var title = document.createElement("h1");
    title.className = "vehicle-title";
    title.textContent = config.displayTitle || "Explore";
    document.title = title.textContent;
    hud.appendChild(title);
    var viewControls = document.createElement("div");
    viewControls.className = "hud-views";
    hud.appendChild(viewControls);

    var stage = document.createElement("div");
    stage.className = "scene-stage";
    panel.appendChild(stage);

    var chrome = document.createElement("div");
    chrome.className = "game-chrome";
    panel.appendChild(chrome);

    var lessonUi = buildLessonPanel();
    var lessonApi = wireLesson(lessonUi);

    fetch(config.registryUrl)
      .then(function (response) {
        if (!response.ok) throw new Error("Registry HTTP " + response.status);
        return response.json();
      })
      .then(function (registry) {
        if (!views.length) {
          stage.textContent = "Explore needs a CLOSED scene.";
          showDiag(config, ["mode=blocked"]);
          return;
        }

        var stageApi = mountViewStage(stage, panel, registry, lessonApi.openPart);
        var hint = buildHint();
        var modes = buildModeBar(views, function (view) {
          lessonApi.closeLesson();
          stageApi.showView(view);
          hint.set(view.hint || "");
        });

        viewControls.appendChild(modes.el);
        chrome.appendChild(lessonUi.panel);

        stageApi.showView(views[0]);

        document.addEventListener("keydown", function (event) {
          if (event.key !== "Escape") return;
          lessonApi.closeLesson();
        });

        global.setTimeout(function () {
          modes.pulseLookInsideOnce();
        }, 700);

        var extras = [
          "registryParts=" + namedParts(registry).length,
          "views=" + views.length,
          "mode=kids-game-ui"
        ];
        (config.scene.equipmentGaps || []).forEach(function (gap) {
          extras.push("gap: " + gap);
        });
        showDiag(config, extras);
      })
      .catch(function (error) {
        stage.textContent =
          "Explore failed: " + (error && error.message ? error.message : error);
      });
  }

  global.VehicleExploreShell = {
    mount: function () {
      mount(resolveConfig());
    },
    canPlayStudy: canPlayStudy
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      global.VehicleExploreShell.mount();
    });
  } else {
    global.VehicleExploreShell.mount();
  }
})(window);
