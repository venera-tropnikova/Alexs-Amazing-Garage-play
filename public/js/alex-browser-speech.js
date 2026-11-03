/* Universal browser speech helper (from verified preview/browser-speech-game/speech.js).
   Does not read, rewrite, or delete project WAV files.
   Prefer en-US, then natural-sounding female English voices by soft scoring.
   Never require a specific voice name or OS.
   English availability waits for async voice lists before deciding. */
(function (global) {
  "use strict";

  var RATE = 0.9;
  var PITCH = 1;
  var VOLUME = 1;
  var SPEAK_DELAY_MS = 60;
  var VOICE_WAIT_MS = 1200;

  var MSG_API = "Speech is not available on this device.";
  var MSG_NO_ENGLISH = "No English voices are available on this device.";
  var MSG_LOADING = "Voices not loaded yet.";

  var FEMALE_HINTS = [
    "female", "woman", "girl",
    "zira", "samantha", "victoria", "karen", "moira", "fiona", "tessa",
    "allison", "ava", "susan", "hazel", "catherine", "serena", "joanna",
    "ivy", "emma", "amy", "olivia", "jenny", "aria", "natasha", "linda"
  ];
  var MALE_HINTS = [
    "male", "man", "boy", "david", "mark", "daniel", "fred", "alex",
    "james", "john", "tom", "ravi", "guy", "nathan", "matthew"
  ];

  function supported() {
    return typeof global.speechSynthesis !== "undefined" &&
      typeof global.SpeechSynthesisUtterance !== "undefined";
  }

  function norm(value) {
    return String(value || "").toLowerCase();
  }

  function isEnglish(voice) {
    var lang = norm(voice.lang);
    return lang === "en" || lang.indexOf("en-") === 0 || lang.indexOf("en_") === 0;
  }

  function isEnUs(voice) {
    var lang = norm(voice.lang).replace("_", "-");
    return lang === "en-us";
  }

  function scoreVoice(voice) {
    var score = 0;
    var name = norm(voice.name);
    var i;
    if (isEnUs(voice)) score += 100;
    else if (isEnglish(voice)) score += 40;
    else return -1000;
    if (voice.localService) score += 25;
    if (voice.default) score += 5;
    for (i = 0; i < FEMALE_HINTS.length; i++) {
      if (name.indexOf(FEMALE_HINTS[i]) !== -1) {
        score += 30;
        break;
      }
    }
    for (i = 0; i < MALE_HINTS.length; i++) {
      if (name.indexOf(MALE_HINTS[i]) !== -1) {
        score -= 20;
        break;
      }
    }
    if (name.indexOf("neural") !== -1 || name.indexOf("natural") !== -1 || name.indexOf("premium") !== -1) {
      score += 8;
    }
    return score;
  }

  function chooseVoice(voices) {
    var english = (voices || []).filter(isEnglish);
    if (!english.length) {
      return {
        voice: null,
        fallback: false,
        loading: false,
        canSpeak: false,
        notice: MSG_NO_ENGLISH
      };
    }
    english.sort(function (a, b) { return scoreVoice(b) - scoreVoice(a); });
    var best = english[0];
    var fallback = !isEnUs(best);
    return {
      voice: best,
      fallback: fallback,
      loading: false,
      canSpeak: true,
      notice: fallback
        ? ("en-US is unavailable. Using English fallback: " + best.name + " (" + best.lang + ").")
        : ("Using en-US voice: " + best.name + ".")
    };
  }

  function unavailableMessage(choice) {
    if (!supported()) return MSG_API;
    if (choice && choice.loading) return MSG_LOADING;
    // Never return a success/voice-selected notice from the unavailable helper.
    return MSG_NO_ENGLISH;
  }

  function createController(options) {
    options = options || {};
    var onStatus = typeof options.onStatus === "function" ? options.onStatus : function () {};
    var onDiag = typeof options.onDiag === "function" ? options.onDiag : function () {};
    var speakTimer = null;
    var token = 0;
    var voicesReady = false;
    var chosen = {
      voice: null,
      fallback: false,
      loading: true,
      canSpeak: false,
      notice: MSG_LOADING
    };
    var readyPromise = null;

    function emitDiag(extra) {
      var synth = supported() ? speechSynthesis : null;
      onDiag(Object.assign({
        supported: supported(),
        voicesReady: voicesReady,
        canSpeak: !!chosen.voice,
        loading: !!chosen.loading,
        voiceName: chosen.voice ? chosen.voice.name : null,
        voiceLang: chosen.voice ? chosen.voice.lang : null,
        voiceURI: chosen.voice ? chosen.voice.voiceURI : null,
        fallback: chosen.fallback,
        notice: chosen.notice,
        rate: RATE,
        pitch: PITCH,
        volume: VOLUME,
        speaking: synth ? synth.speaking : false,
        pending: synth ? synth.pending : false,
        paused: synth ? synth.paused : false
      }, extra || {}));
    }

    function refreshChoice(opts) {
      opts = opts || {};
      if (!supported()) {
        voicesReady = true;
        chosen = {
          voice: null,
          fallback: false,
          loading: false,
          canSpeak: false,
          notice: MSG_API
        };
        emitDiag({ event: "unsupported" });
        return chosen;
      }
      var voices = speechSynthesis.getVoices();
      // Do not declare "no English" while the browser still has an empty list and we are waiting.
      if (!voices.length && !opts.allowEmpty && !voicesReady) {
        chosen = {
          voice: null,
          fallback: false,
          loading: true,
          canSpeak: false,
          notice: MSG_LOADING
        };
        emitDiag({ event: "voices-loading" });
        return chosen;
      }
      chosen = chooseVoice(voices);
      if (opts.markReady || voices.length || opts.allowEmpty) {
        voicesReady = true;
      }
      emitDiag({ event: voicesReady ? "voices-ready" : "voices-loading" });
      if (voicesReady && !chosen.loading) onStatus(chosen.notice);
      return chosen;
    }

    function waitForVoices() {
      if (!supported()) {
        return Promise.resolve(refreshChoice({ allowEmpty: true, markReady: true }));
      }
      if (readyPromise) return readyPromise;
      readyPromise = new Promise(function (resolve) {
        var settled = false;
        function finish() {
          if (settled) return;
          settled = true;
          resolve(refreshChoice({ allowEmpty: true, markReady: true }));
        }
        refreshChoice();
        if (speechSynthesis.getVoices().length) {
          finish();
          return;
        }
        speechSynthesis.addEventListener("voiceschanged", finish, { once: true });
        global.setTimeout(finish, VOICE_WAIT_MS);
      });
      return readyPromise;
    }

    function stop() {
      token += 1;
      if (speakTimer) {
        global.clearTimeout(speakTimer);
        speakTimer = null;
      }
      if (!supported()) return;
      try { speechSynthesis.cancel(); } catch (error) {}
      emitDiag({ event: "stop" });
      onStatus("Stopped.");
    }

    function speak(text) {
      if (!supported()) {
        onStatus(MSG_API);
        emitDiag({ event: "unsupported", error: "missing-api" });
        return Promise.resolve(false);
      }
      var myToken = ++token;
      var line = String(text || "").trim();
      if (!line) {
        onStatus("Empty line.");
        return Promise.resolve(false);
      }

      return waitForVoices().then(function () {
        if (myToken !== token) return false;
        if (!chosen.voice) {
          onStatus(unavailableMessage(chosen));
          emitDiag({ event: "no-english-voice", error: "no-english" });
          return false;
        }

        if (speakTimer) {
          global.clearTimeout(speakTimer);
          speakTimer = null;
        }
        if (speechSynthesis.speaking || speechSynthesis.pending || speechSynthesis.paused) {
          try { speechSynthesis.cancel(); } catch (error) {}
        }
        if (speechSynthesis.paused) {
          try { speechSynthesis.resume(); } catch (error) {}
        }

        return new Promise(function (resolve) {
          speakTimer = global.setTimeout(function () {
            speakTimer = null;
            if (myToken !== token) {
              resolve(false);
              return;
            }
            refreshChoice({ allowEmpty: true, markReady: true });
            if (!chosen.voice) {
              onStatus(unavailableMessage(chosen));
              emitDiag({ event: "no-english-voice", error: "no-english" });
              resolve(false);
              return;
            }
            var utterance = new SpeechSynthesisUtterance(line);
            utterance.lang = chosen.voice.lang || "en-US";
            utterance.rate = RATE;
            utterance.pitch = PITCH;
            utterance.volume = VOLUME;
            utterance.voice = chosen.voice;

            utterance.onstart = function () {
              if (myToken !== token) return;
              emitDiag({ event: "start", error: "none", text: line });
              onStatus((chosen.fallback ? "Fallback voice. " : "") + "Speaking: “" + line + "”");
            };
            utterance.onend = function () {
              if (myToken !== token) return;
              emitDiag({ event: "end", error: "none", text: line });
              onStatus("Finished.");
              resolve(true);
            };
            utterance.onerror = function (event) {
              if (myToken !== token) return;
              var code = (event && event.error) || "unknown";
              if (code === "interrupted" || code === "canceled") {
                emitDiag({ event: "interrupted", error: code, text: line });
                resolve(false);
                return;
              }
              emitDiag({ event: "error", error: code, text: line });
              onStatus("Speech error: " + code);
              resolve(false);
            };

            try {
              if (speechSynthesis.paused) {
                try { speechSynthesis.resume(); } catch (error) {}
              }
              speechSynthesis.speak(utterance);
              emitDiag({ event: "queued", error: "none", text: line });
              onStatus("Requested: “" + line + "”");
            } catch (error) {
              emitDiag({ event: "exception", error: String(error && error.message ? error.message : error), text: line });
              onStatus("Speech exception.");
              resolve(false);
            }
          }, SPEAK_DELAY_MS);
        });
      });
    }

    function replay(text) {
      return speak(text);
    }

    function canSpeakEnglish() {
      return !!(supported() && voicesReady && chosen.voice);
    }

    function getAvailability() {
      var ready = canSpeakEnglish();
      return {
        api: supported(),
        voicesReady: voicesReady,
        loading: !!(supported() && !voicesReady),
        canSpeak: ready,
        notice: chosen.notice,
        message: ready ? chosen.notice : unavailableMessage(chosen)
      };
    }

    if (supported()) {
      speechSynthesis.addEventListener("voiceschanged", function () {
        refreshChoice({ allowEmpty: true, markReady: true });
      });
    }

    return {
      supported: supported,
      waitForVoices: waitForVoices,
      refreshChoice: refreshChoice,
      speak: speak,
      replay: replay,
      stop: stop,
      canSpeakEnglish: canSpeakEnglish,
      getAvailability: getAvailability,
      getChoice: function () { return chosen; },
      unavailableMessage: function () { return unavailableMessage(chosen); },
      constants: { RATE: RATE, PITCH: PITCH, VOLUME: VOLUME }
    };
  }

  var shared = null;

  function sharedController(options) {
    if (!shared) shared = createController(options || {});
    return shared;
  }

  global.AlexBrowserSpeech = {
    supported: supported,
    chooseVoice: chooseVoice,
    createController: createController,
    sharedController: sharedController,
    messages: {
      api: MSG_API,
      noEnglish: MSG_NO_ENGLISH,
      loading: MSG_LOADING
    }
  };
})(window);
