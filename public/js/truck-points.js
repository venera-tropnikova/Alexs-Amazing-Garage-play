"use strict";

/*
  Buttons and points for a vehicle image.
  One registry id supplies the name, the button, the point, and the action.
  Coordinates belong to one image id and one version. They are percentages of
  that image, so screen size and the margins around the image do not move them.
  Unconfirmed or unverified learner data produces no visible control.
*/

(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.TruckPoints = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function isSingleAction(action) {
    if (typeof action === "string") return action.trim() !== "";
    if (action && typeof action === "object" && !Array.isArray(action)) {
      return Object.keys(action).length === 1;
    }
    return false;
  }

  function coordinatesInside(placement) {
    return (
      placement &&
      typeof placement.x === "number" &&
      typeof placement.y === "number" &&
      placement.x >= 0 &&
      placement.x <= 100 &&
      placement.y >= 0 &&
      placement.y <= 100
    );
  }

  function validate(parts) {
    const errors = [];
    const counts = new Map();
    parts.forEach(function (part) {
      const id = part && part.id;
      counts.set(id, (counts.get(id) || 0) + 1);
    });
    counts.forEach(function (count, id) {
      if (!id || count > 1) errors.push({ code: "duplicate-id", id: id || null });
    });
    parts.forEach(function (part) {
      const placement = part && part.placement;
      if (placement && placement.confirmed === true && !coordinatesInside(placement)) {
        errors.push({ code: "coordinates-outside", id: part.id });
      }
    });
    return errors;
  }

  function canShow(part, image, blocked) {
    if (!part || blocked.has(part.id)) return false;
    const placement = part.placement;
    if (!placement || placement.confirmed !== true) return false;
    if (!image || placement.imageId !== image.id || placement.version !== image.version) return false;
    if (!coordinatesInside(placement)) return false;
    if (typeof part.name !== "string" || part.name.trim() === "") return false;
    if (!part.source || part.source.factStatus !== "VERIFIED") return false;
    if (!part.review || part.review.language !== "VERIFIED") return false;
    if (!isSingleAction(part.action)) return false;
    return true;
  }

  function areaInside(area) {
    if (!area) return false;
    const values = [area.x, area.y, area.w, area.h];
    if (values.some(function (value) { return typeof value !== "number"; })) return false;
    return area.x >= 0 && area.y >= 0 && area.w > 0 && area.h > 0 &&
      area.x + area.w <= 100 && area.y + area.h <= 100;
  }

  function canShowLocalTest(part, image, blocked) {
    if (!part || blocked.has(part.id)) return false;
    const placement = part.placement;
    if (!placement || placement.confirmed !== false) return false;
    if (!image || placement.imageId !== image.id || placement.version !== image.version) return false;
    if (!coordinatesInside(placement)) return false;
    if (typeof part.name !== "string" || part.name.trim() === "") return false;
    if (typeof part.explanation !== "string" || part.explanation.trim() === "") return false;
    if (!isSingleAction(part.action)) return false;
    if (part.audio != null && (typeof part.audio !== "string" || part.audio.trim() === "")) return false;
    return true;
  }

  function replaySource(part) {
    if (!part || typeof part.audio !== "string" || part.audio.trim() === "") return null;
    return part.audio;
  }

  function imageFrame(viewportWidth, viewportHeight, imageWidth, imageHeight) {
    const imageAspect = imageWidth / imageHeight;
    const viewAspect = viewportWidth / viewportHeight;
    if (viewAspect > imageAspect) {
      const height = viewportHeight;
      const width = height * imageAspect;
      return { left: (viewportWidth - width) / 2, top: 0, width: width, height: height };
    }
    const width = viewportWidth;
    const height = width / imageAspect;
    return { left: 0, top: (viewportHeight - height) / 2, width: width, height: height };
  }

  function pointOnImage(placement, frame) {
    return {
      x: frame.left + (placement.x / 100) * frame.width,
      y: frame.top + (placement.y / 100) * frame.height,
    };
  }

  function buildControls(registry, image, activate) {
    const parts = (registry && registry.parts) || [];
    const errors = validate(parts);
    const blocked = new Set(
      errors.filter(function (error) { return error.code === "duplicate-id"; }).map(function (error) { return error.id; })
    );
    const controls = [];
    parts.forEach(function (part) {
      if (!canShow(part, image, blocked)) return;
      function handler(event) {
        if (typeof activate === "function") activate(part.id, part.action, event);
      }
      controls.push({
        id: part.id,
        name: part.name,
        action: part.action,
        x: part.placement.x,
        y: part.placement.y,
        handler: handler,
        button: { id: part.id, name: part.name, action: part.action, handler: handler },
        point: {
          id: part.id,
          name: part.name,
          action: part.action,
          handler: handler,
          x: part.placement.x,
          y: part.placement.y,
        },
      });
    });
    return { errors: errors, controls: controls };
  }

  function buildLocalTest(registry, image, activate) {
    const parts = (registry && registry.parts) || [];
    const errors = validate(parts);
    const blocked = new Set(
      errors.filter(function (error) { return error.code === "duplicate-id"; }).map(function (error) { return error.id; })
    );
    const controls = [];
    parts.forEach(function (part) {
      if (!canShowLocalTest(part, image, blocked)) return;
      function handler(event) {
        if (typeof activate === "function") activate(part.id, part.action, event);
      }
      controls.push({
        id: part.id,
        name: part.name,
        action: part.action,
        explanation: part.explanation,
        audio: replaySource(part),
        x: part.placement.x,
        y: part.placement.y,
        area: areaInside(part.placement.area) ? part.placement.area : null,
        handler: handler,
        button: { id: part.id, name: part.name, action: part.action, handler: handler },
        point: {
          id: part.id,
          name: part.name,
          action: part.action,
          handler: handler,
          x: part.placement.x,
          y: part.placement.y,
        },
      });
    });
    return { errors: errors, controls: controls };
  }

  function render(container, registry, image, activate) {
    const built = buildControls(registry, image, activate);
    container.textContent = "";
    const stage = document.createElement("div");
    stage.className = "vehicle-stage";
    const menu = document.createElement("div");
    menu.className = "vehicle-menu";
    built.controls.forEach(function (item) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "vehicle-button";
      button.dataset.part = item.id;
      button.textContent = item.name;
      button.addEventListener("click", item.handler);
      menu.appendChild(button);

      const point = document.createElement("button");
      point.type = "button";
      point.className = "vehicle-point";
      point.dataset.part = item.id;
      point.setAttribute("aria-label", item.name);
      point.style.left = item.x + "%";
      point.style.top = item.y + "%";
      point.addEventListener("click", item.handler);
      stage.appendChild(point);
    });
    container.appendChild(stage);
    container.appendChild(menu);
    return built;
  }

  function buildSections(registry, activate) {
    const sections = (registry && registry.sections) || [];
    const known = new Set(((registry && registry.parts) || []).map(function (part) {
      return part && part.id;
    }));
    const errors = [];
    const counts = new Map();
    sections.forEach(function (section) {
      const id = section && section.id;
      counts.set(id, (counts.get(id) || 0) + 1);
    });
    const blocked = new Set();
    counts.forEach(function (count, id) {
      if (!id || count > 1) {
        errors.push({ code: "duplicate-id", id: id || null });
        blocked.add(id);
      }
    });
    const controls = [];
    sections.forEach(function (section) {
      if (!section || blocked.has(section.id)) return;
      if (typeof section.name !== "string" || section.name.trim() === "") {
        errors.push({ code: "section-name-missing", id: section.id });
        return;
      }
      (section.partIds || []).forEach(function (partId) {
        if (!known.has(partId)) errors.push({ code: "section-part-missing", id: section.id, partId: partId });
      });
      function handler(event) {
        if (typeof activate === "function") activate(section.id, event);
      }
      controls.push({ id: section.id, name: section.name, handler: handler });
    });
    return { errors: errors, sections: controls };
  }

  function renderScreen(container, registry, onSection, options) {
    const image = (registry && registry.screen && registry.screen.image) || {};
    const imageRef = { id: image.id, version: image.version };
    const localTest = !!(options && options.localTest);
    let openId = null;
    const points = localTest ? buildLocalTest(registry, imageRef) : buildControls(registry, imageRef);
    const sections = buildSections(registry, function (id, event) {
      const section = ((registry && registry.sections) || []).find(function (item) {
        return item && item.id === id;
      });
      const partId = section && (section.partIds || []).find(function (candidate) {
        return points.controls.some(function (control) { return control.id === candidate; });
      });
      if (partId) activate(partId);
      else closePart(id);
      if (typeof onSection === "function") onSection(id, event);
    });
    container.textContent = "";
    const title = document.createElement("h1");
    title.className = "screen-title";
    title.textContent = (registry && registry.screen && registry.screen.title) || "";
    const frame = document.createElement("div");
    frame.className = "truck-frame";
    const stage = document.createElement("div");
    stage.className = "truck-stage";
    const img = document.createElement("img");
    img.className = "truck-image";
    img.alt = "";
    if (image.width) img.width = image.width;
    if (image.height) img.height = image.height;
    if (image.src) img.src = image.src;
    stage.appendChild(img);
    const card = document.createElement("section");
    card.className = "part-card";
    card.hidden = true;
    const cardTitle = document.createElement("h2");
    cardTitle.className = "part-card-title";
    const cardText = document.createElement("p");
    cardText.className = "part-card-text";
    const actions = document.createElement("div");
    actions.className = "part-card-actions";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "part-card-close";
    close.textContent = "Close";
    actions.appendChild(close);
    card.appendChild(cardTitle);
    card.appendChild(cardText);
    card.appendChild(actions);
    points.controls.forEach(function (item) {
      if (item.area) {
        const spot = document.createElement("div");
        spot.className = "part-spot";
        spot.dataset.part = item.id;
        spot.hidden = true;
        spot.style.left = item.area.x + "%";
        spot.style.top = item.area.y + "%";
        spot.style.width = item.area.w + "%";
        spot.style.height = item.area.h + "%";
        stage.appendChild(spot);
      }
      const point = document.createElement("button");
      point.type = "button";
      point.className = "vehicle-point";
      point.dataset.part = item.id;
      point.setAttribute("aria-label", item.name);
      point.setAttribute("aria-pressed", "false");
      point.style.left = item.x + "%";
      point.style.top = item.y + "%";
      point.addEventListener("click", function () { activate(item.id); });
      stage.appendChild(point);
    });
    points.controls.filter(function (item) {
      return item.area;
    }).slice().sort(function (a, b) {
      return (b.area.w * b.area.h) - (a.area.w * a.area.h);
    }).forEach(function (item, index) {
      const hit = document.createElement("button");
      hit.type = "button";
      hit.className = "part-hit";
      hit.dataset.part = item.id;
      hit.setAttribute("aria-label", item.name);
      hit.style.left = item.area.x + "%";
      hit.style.top = item.area.y + "%";
      hit.style.width = item.area.w + "%";
      hit.style.height = item.area.h + "%";
      hit.style.zIndex = String(index + 1);
      hit.addEventListener("click", function () { activate(item.id); });
      stage.appendChild(hit);
    });
    frame.appendChild(stage);
    const menu = document.createElement("div");
    menu.className = "section-menu";
    sections.sections.forEach(function (section) {
      const source = ((registry && registry.sections) || []).find(function (item) {
        return item && item.id === section.id;
      });
      const button = document.createElement("button");
      button.type = "button";
      button.className = "section-button";
      button.dataset.section = section.id;
      button.setAttribute("aria-pressed", "false");
      if (source && typeof source.image === "string" && source.image.trim() !== "") {
        const icon = document.createElement("img");
        icon.className = "section-image";
        icon.alt = "";
        icon.src = source.image;
        button.appendChild(icon);
      }
      const label = document.createElement("span");
      label.className = "section-label";
      label.textContent = section.name;
      button.appendChild(label);
      button.addEventListener("click", section.handler);
      menu.appendChild(button);
    });
    container.appendChild(title);
    container.appendChild(frame);
    container.appendChild(card);
    container.appendChild(menu);

    function sectionFor(partId) {
      return ((registry && registry.sections) || []).find(function (section) {
        return section && (section.partIds || []).indexOf(partId) !== -1;
      });
    }

    function mark(partId) {
      const section = partId ? sectionFor(partId) : null;
      container.querySelectorAll(".section-button").forEach(function (button) {
        button.setAttribute("aria-pressed", section && button.dataset.section === section.id ? "true" : "false");
      });
      container.querySelectorAll(".vehicle-point, .part-spot").forEach(function (node) {
        const selected = node.dataset.part === partId;
        if (node.classList.contains("vehicle-point")) node.setAttribute("aria-pressed", selected ? "true" : "false");
        node.classList.toggle("is-selected", selected);
        if (node.classList.contains("part-spot")) node.hidden = !selected;
      });
    }

    function gameSpeech() {
      if (typeof window === "undefined" || !window.AlexBrowserSpeech) return null;
      return window.AlexBrowserSpeech.sharedController();
    }

    function unavailableText() {
      const speech = gameSpeech();
      if (speech && typeof speech.unavailableMessage === "function") {
        return speech.unavailableMessage();
      }
      if (window.AlexBrowserSpeech && window.AlexBrowserSpeech.messages) {
        return window.AlexBrowserSpeech.messages.noEnglish;
      }
      return "No English voices are available on this device.";
    }

    function speakLine(text) {
      const speech = gameSpeech();
      const line = String(text || "").trim();
      if (!speech || !speech.supported() || !line) {
        return Promise.resolve(false);
      }
      // speak() waits for async voices and refuses when no English voice exists.
      return speech.speak(line);
    }

    function setSpeechNote(message) {
      let note = actions.querySelector(".part-card-speech-note");
      if (!message) {
        if (note) note.remove();
        return;
      }
      if (!note) {
        note = document.createElement("p");
        note.className = "part-card-speech-note";
        note.setAttribute("role", "status");
        note.style.margin = "0";
        note.style.fontSize = "0.9rem";
        actions.appendChild(note);
      }
      note.textContent = message;
    }

    function playReserveAudio() {
      const audio = actions.querySelector("audio");
      if (!audio) return Promise.resolve(false);
      audio.currentTime = 0;
      const playing = audio.play();
      if (playing && typeof playing.then === "function") {
        return playing.then(function () { return true; }).catch(function () { return false; });
      }
      return Promise.resolve(true);
    }

    function stopCardAudio() {
      const speech = gameSpeech();
      if (speech) speech.stop();
      setSpeechNote("");
      const audio = actions.querySelector("audio");
      const replay = actions.querySelector(".part-card-replay");
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        audio.remove();
      }
      if (replay) replay.remove();
    }

    function closePart(sectionId) {
      openId = null;
      card.hidden = true;
      cardTitle.textContent = "";
      cardText.textContent = "";
      stopCardAudio();
      mark(null);
      if (sectionId) {
        container.querySelectorAll(".section-button").forEach(function (button) {
          button.setAttribute("aria-pressed", button.dataset.section === sectionId ? "true" : "false");
        });
      }
    }

    function showCard(item) {
      card.hidden = false;
      cardTitle.textContent = item.name;
      cardText.textContent = item.explanation;
      stopCardAudio();
      const line = (item.explanation && String(item.explanation).trim()) || "";
      setSpeechNote("");
      if (line || item.audio) {
        // Keep WAV element as local reserve when present; browser speech is primary.
        if (item.audio) {
          const audio = document.createElement("audio");
          audio.preload = "auto";
          audio.src = item.audio;
          actions.appendChild(audio);
        }
        const replay = document.createElement("button");
        replay.type = "button";
        replay.className = "part-card-replay";
        replay.textContent = "Replay";
        replay.addEventListener("click", function () {
          setSpeechNote("");
          if (!line) {
            playReserveAudio().then(function (ok) {
              if (!ok) setSpeechNote(unavailableText());
            });
            return;
          }
          speakLine(line).then(function (ok) {
            if (ok) return;
            playReserveAudio().then(function (played) {
              if (!played) setSpeechNote(unavailableText());
            });
          });
        });
        actions.appendChild(replay);
        if (line) {
          speakLine(line).then(function (ok) {
            if (ok) return;
            playReserveAudio().then(function (played) {
              if (!played) setSpeechNote(unavailableText());
            });
          });
        } else {
          playReserveAudio().then(function (played) {
            if (!played) setSpeechNote(unavailableText());
          });
        }
      }
    }

    function activate(partId) {
      const item = points.controls.find(function (control) { return control.id === partId; });
      if (!item) return;
      if (openId === partId) {
        closePart(null);
        return;
      }
      openId = partId;
      mark(partId);
      showCard(item);
    }

    close.addEventListener("click", function () { closePart(null); });
    return { sections: sections, points: points };
  }

  return {
    buildControls: buildControls,
    buildLocalTest: buildLocalTest,
    buildSections: buildSections,
    imageFrame: imageFrame,
    pointOnImage: pointOnImage,
    render: render,
    renderScreen: renderScreen,
    replaySource: replaySource,
  };
});

function fixturePart(overrides) {
  const part = {
    id: "fixture-panel",
    name: "Test panel",
    action: "open-part",
    source: { factStatus: "VERIFIED" },
    review: { language: "VERIFIED" },
    placement: { imageId: "fixture-image", version: "1", x: 25, y: 40, confirmed: true },
  };
  Object.keys(overrides || {}).forEach(function (key) {
    part[key] = overrides[key];
  });
  return part;
}

function runSelfTest() {
  const assert = require("assert");
  const fs = require("fs");
  const path = require("path");
  const api = require("./truck-points.js");
  const image = { id: "fixture-image", version: "1" };
  const failures = [];

  function check(name, fn) {
    try {
      fn();
      console.log("ok  " + name);
    } catch (error) {
      failures.push(name + ": " + error.message);
      console.log("FAIL  " + name);
    }
  }

  check("the live registry shows nothing", function () {
    const registry = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "..", "content", "parts.registry.json"), "utf8")
    );
    const built = api.buildControls(registry, { id: "future-image", version: "1" });
    assert.strictEqual(built.controls.length, 0);
    assert.deepStrictEqual(built.errors, []);
  });

  check("id, name, button, point, and action stay together", function () {
    const calls = [];
    const built = api.buildControls(
      { parts: [fixturePart()] },
      image,
      function (id, action) { calls.push([id, action]); }
    );
    assert.strictEqual(built.controls.length, 1);
    const item = built.controls[0];
    assert.strictEqual(item.button.id, item.point.id);
    assert.strictEqual(item.button.name, item.point.name);
    assert.strictEqual(item.button.name, "Test panel");
    assert.strictEqual(item.button.action, item.point.action);
    assert.strictEqual(item.button.handler, item.point.handler);
    item.button.handler();
    item.point.handler();
    assert.deepStrictEqual(calls, [["fixture-panel", "open-part"], ["fixture-panel", "open-part"]]);
  });

  check("a new image version hides an unconfirmed binding", function () {
    const built = api.buildControls(
      { parts: [fixturePart()] },
      { id: "fixture-image", version: "2" }
    );
    assert.strictEqual(built.controls.length, 0);
  });

  check("unverified learner data stays hidden", function () {
    const built = api.buildControls(
      { parts: [fixturePart({ source: { factStatus: "UNVERIFIED" }, review: { language: "UNVERIFIED" }, name: null })] },
      image
    );
    assert.strictEqual(built.controls.length, 0);
  });

  check("coordinates outside the image are rejected", function () {
    const built = api.buildControls(
      { parts: [fixturePart({ placement: { imageId: "fixture-image", version: "1", x: 120, y: 40, confirmed: true } })] },
      image
    );
    assert.strictEqual(built.controls.length, 0);
    assert.strictEqual(built.errors[0].code, "coordinates-outside");
  });

  check("duplicate ids are rejected", function () {
    const built = api.buildControls(
      { parts: [fixturePart(), fixturePart({ name: "Second" })] },
      image
    );
    assert.strictEqual(built.controls.length, 0);
    assert.strictEqual(built.errors[0].code, "duplicate-id");
  });

  check("section names come from the registry and points stay hidden", function () {
    const registry = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "..", "content", "parts.registry.json"), "utf8")
    );
    const names = registry.sections.map(function (section) { return section.name; });
    const source = fs.readFileSync(__filename, "utf8").split("function runSelfTest")[0];
    const page = fs.readFileSync(path.join(__dirname, "..", "..", "truck.html"), "utf8");
    const style = fs.readFileSync(path.join(__dirname, "..", "truck-screen.css"), "utf8");
    names.forEach(function (name) {
      assert.strictEqual(source.includes(name), false, name);
      assert.strictEqual(page.includes(name), false, name);
      assert.strictEqual(style.includes(name), false, name);
    });
    assert.strictEqual(page.includes(registry.screen.title), false);
    assert.strictEqual(source.includes(registry.screen.title), false);
    const built = api.buildSections(registry);
    assert.deepStrictEqual(built.sections.map(function (section) { return section.name; }), names);
    assert.strictEqual(built.errors.length, 0);
    const points = api.buildControls(registry, {
      id: registry.screen.image.id,
      version: registry.screen.image.version,
    });
    assert.strictEqual(points.controls.length, 0);
    const calls = [];
    api.buildSections(registry, function (id) { calls.push(id); }).sections[0].handler();
    assert.strictEqual(calls[0], registry.sections[0].id);
  });

  check("a section without a name stays hidden", function () {
    const built = api.buildSections({
      parts: [{ id: "cab" }],
      sections: [{ id: "section-cab", name: null, partIds: ["cab"] }],
    });
    assert.strictEqual(built.sections.length, 0);
    assert.strictEqual(built.errors[0].code, "section-name-missing");
  });

  check("duplicate section ids are rejected", function () {
    const built = api.buildSections({
      parts: [],
      sections: [
        { id: "section-cab", name: "One" },
        { id: "section-cab", name: "Two" },
      ],
    });
    assert.strictEqual(built.sections.length, 0);
    assert.strictEqual(built.errors[0].code, "duplicate-id");
  });

  check("local test shows the unconfirmed cab, pump panel, compartments, ladder, and wheels and keeps the normal screen empty", function () {
    const registry = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "..", "content", "parts.registry.json"), "utf8")
    );
    const imageRef = { id: registry.screen.image.id, version: registry.screen.image.version };
    assert.strictEqual(api.buildControls(registry, imageRef).controls.length, 0);
    const calls = [];
    const local = api.buildLocalTest(registry, imageRef, function (id, action) {
      calls.push(id + ":" + action);
    });
    const expectedIds = registry.sections[0].partIds.concat(registry.sections[1].partIds).concat([
      "compartment-left-front",
      "compartment-left-rear",
      "compartment-left-rear-lift",
    ]).concat(registry.sections[3].partIds).concat(registry.sections[4].partIds);
    assert.deepStrictEqual(local.controls.map(function (item) { return item.id; }), expectedIds);
    const seen = [];
    local.controls.forEach(function (control) {
      const part = registry.parts.find(function (item) { return item.id === control.id; });
      assert.strictEqual(part.placement.confirmed, false);
      assert.strictEqual(part.source.factStatus, "UNVERIFIED");
      assert.strictEqual(part.review.language, "UNVERIFIED");
      assert.strictEqual(typeof part.audio, "string");
      assert.ok(part.audio.trim() !== "");
      assert.strictEqual(control.name, part.name);
      assert.strictEqual(control.explanation, part.explanation);
      assert.strictEqual(control.audio, part.audio);
      assert.strictEqual(api.replaySource(part), part.audio);
      assert.ok(control.area);
      assert.strictEqual(control.button.handler, control.point.handler);
      control.button.handler();
      control.point.handler();
      seen.push(part.id + ":" + part.action, part.id + ":" + part.action);
    });
    assert.deepStrictEqual(calls, seen);
    assert.strictEqual(api.buildLocalTest(registry, { id: imageRef.id, version: "other" }).controls.length, 0);
    assert.strictEqual(api.buildLocalTest({
      parts: [fixturePart({ explanation: "A verified part stays on the normal path." })],
    }, image).controls.length, 0);
    assert.strictEqual(api.buildLocalTest({
      parts: [{
        id: "local-part",
        name: "Local part",
        explanation: "   ",
        action: "show-part",
        audio: null,
        placement: { imageId: "fixture-image", version: "1", x: 10, y: 10, confirmed: false },
      }],
    }, image).controls.length, 0);
    assert.strictEqual(api.replaySource({ audio: "voice/part.mp3" }), "voice/part.mp3");
  });

  check("local test shows the unconfirmed excavator and keeps it off the fire truck", function () {
    const registry = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "content", "caterpillar-320.registry.json"), "utf8"));
    const pierce = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "content", "parts.registry.json"), "utf8"));
    const imageRef = { id: registry.screen.image.id, version: registry.screen.image.version };
    assert.strictEqual(api.buildControls(registry, imageRef).controls.length, 0);
    const local = api.buildLocalTest(registry, imageRef, function () {});
    assert.deepStrictEqual(local.controls.map(function (item) { return item.id; }), registry.parts.map(function (part) { return part.id; }));
    local.controls.forEach(function (control) {
      const part = registry.parts.find(function (item) { return item.id === control.id; });
      assert.strictEqual(part.placement.confirmed, false);
      assert.strictEqual(part.source.factStatus, "UNVERIFIED");
      assert.strictEqual(typeof part.audio, "string");
      assert.ok(part.audio.trim() !== "");
      assert.strictEqual(control.audio, part.audio);
      assert.ok(control.area);
      assert.strictEqual(control.button.handler, control.point.handler);
    });
    assert.strictEqual(api.buildLocalTest(registry, { id: imageRef.id, version: "other" }).controls.length, 0);
    assert.strictEqual(api.buildLocalTest(registry, {
      id: pierce.screen.image.id,
      version: pierce.screen.image.version,
    }).controls.length, 0);
  });

  check("local test shows the unconfirmed crane and keeps it off the fire truck", function () {
    const registry = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "content", "liebherr-ltm-1090-4-2.registry.json"), "utf8"));
    const pierce = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "content", "parts.registry.json"), "utf8"));
    const imageRef = { id: registry.screen.image.id, version: registry.screen.image.version };
    assert.strictEqual(api.buildControls(registry, imageRef).controls.length, 0);
    const local = api.buildLocalTest(registry, imageRef, function () {});
    assert.deepStrictEqual(local.controls.map(function (item) { return item.id; }), registry.parts.map(function (part) { return part.id; }));
    local.controls.forEach(function (control) {
      const part = registry.parts.find(function (item) { return item.id === control.id; });
      assert.strictEqual(part.placement.confirmed, false);
      assert.strictEqual(part.source.factStatus, "UNVERIFIED");
      assert.strictEqual(typeof part.audio, "string");
      assert.ok(part.audio.trim() !== "");
      assert.strictEqual(control.audio, part.audio);
      assert.ok(control.area);
      assert.strictEqual(control.button.handler, control.point.handler);
    });
    assert.strictEqual(api.buildLocalTest(registry, { id: imageRef.id, version: "other" }).controls.length, 0);
    assert.strictEqual(api.buildLocalTest(registry, {
      id: pierce.screen.image.id,
      version: pierce.screen.image.version,
    }).controls.length, 0);
  });

  check("local test shows the unconfirmed rover and keeps it off the fire truck", function () {
    const registry = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "content", "perseverance.registry.json"), "utf8"));
    const pierce = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "content", "parts.registry.json"), "utf8"));
    const imageRef = { id: registry.screen.image.id, version: registry.screen.image.version };
    assert.strictEqual(api.buildControls(registry, imageRef).controls.length, 0);
    const local = api.buildLocalTest(registry, imageRef, function () {});
    assert.deepStrictEqual(local.controls.map(function (item) { return item.id; }), registry.parts.map(function (part) { return part.id; }));
    local.controls.forEach(function (control) {
      const part = registry.parts.find(function (item) { return item.id === control.id; });
      assert.strictEqual(part.placement.confirmed, false);
      assert.strictEqual(part.source.factStatus, "UNVERIFIED");
      assert.strictEqual(typeof part.audio, "string");
      assert.ok(part.audio.trim() !== "");
      assert.strictEqual(control.audio, part.audio);
      assert.ok(control.area);
      assert.strictEqual(control.button.handler, control.point.handler);
    });
    assert.strictEqual(api.buildLocalTest(registry, { id: imageRef.id, version: "other" }).controls.length, 0);
    assert.strictEqual(api.buildLocalTest(registry, {
      id: pierce.screen.image.id,
      version: pierce.screen.image.version,
    }).controls.length, 0);
  });

  check("local test shows the unconfirmed fleet and keeps it off the fire truck", function () {
    const files = [
      "ford-police.registry.json",
      "john-deere-8r-410.registry.json",
      "volvo-a40g.registry.json",
      "panther.registry.json",
      "ford-f450.registry.json",
    ];
    const pierce = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "content", "parts.registry.json"), "utf8"));
    files.forEach(function (file) {
      const registry = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "content", file), "utf8"));
      const imageRef = { id: registry.screen.image.id, version: registry.screen.image.version };
      assert.strictEqual(api.buildControls(registry, imageRef).controls.length, 0, file);
      const local = api.buildLocalTest(registry, imageRef, function () {});
      assert.deepStrictEqual(local.controls.map(function (item) { return item.id; }), registry.parts.map(function (part) { return part.id; }), file);
      local.controls.forEach(function (control) {
        const part = registry.parts.find(function (item) { return item.id === control.id; });
        assert.strictEqual(part.placement.confirmed, false);
        assert.strictEqual(part.source.factStatus, "UNVERIFIED");
        assert.strictEqual(typeof part.audio, "string");
        assert.ok(part.audio.trim() !== "");
        assert.strictEqual(control.audio, part.audio);
        assert.ok(control.area);
        assert.strictEqual(control.button.handler, control.point.handler);
      });
      assert.strictEqual(api.buildLocalTest(registry, { id: imageRef.id, version: "other" }).controls.length, 0);
      assert.strictEqual(api.buildLocalTest(registry, {
        id: pierce.screen.image.id,
        version: pierce.screen.image.version,
      }).controls.length, 0);
    });
  });

  check("points stay on the same image fraction at 320, 390, and 1280", function () {
    const sizes = [
      [320, 640],
      [390, 700],
      [1280, 800],
      [1280, 200],
    ];
    sizes.forEach(function (size) {
      const frame = api.imageFrame(size[0], size[1], 2610, 784);
      const point = api.pointOnImage({ x: 25, y: 40 }, frame);
      const fractionX = (point.x - frame.left) / frame.width;
      const fractionY = (point.y - frame.top) / frame.height;
      assert.ok(Math.abs(fractionX - 0.25) < 1e-9, String(size));
      assert.ok(Math.abs(fractionY - 0.4) < 1e-9, String(size));
      assert.ok(point.x >= frame.left && point.x <= frame.left + frame.width);
      assert.ok(point.y >= frame.top && point.y <= frame.top + frame.height);
    });
    const wide = api.imageFrame(1280, 200, 2610, 784);
    assert.ok(wide.left > 0);
    const tall = api.imageFrame(320, 640, 2610, 784);
    assert.ok(tall.top > 0);
  });

  if (failures.length) {
    console.log("points self-test: FAILED");
    failures.forEach(function (item) { console.log(item); });
    process.exit(1);
  }
  console.log("points self-test: passed");
}

if (typeof require === "function" && require.main === module && process.argv.indexOf("--self-test") !== -1) {
  runSelfTest();
}

if (typeof document !== "undefined") {
  function stopPageAudio() {
    if (window.AlexBrowserSpeech) {
      window.AlexBrowserSpeech.sharedController().stop();
    }
    document.querySelectorAll("audio").forEach(function (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    });
  }
  document.querySelectorAll(".screen-back").forEach(function (link) {
    link.addEventListener("click", stopPageAudio);
  });
  window.addEventListener("pagehide", stopPageAudio);
}
