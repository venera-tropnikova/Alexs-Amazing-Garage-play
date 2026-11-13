/**
 * Unified Explore fleet (preview only).
 * Outside = closed-composite + registry parts.
 * Extra views = equipment study on existing open/detail plates (not fake OPEN animation).
 * Equipment names/explanations are view-local; do not copy Outside hotspots onto alt plates.
 * visualPass stays false.
 */
(function () {
  "use strict";

  function composite(id) {
    return "preview/vehicle-explore/scene-art/" + id + "/closed-composite.png";
  }

  function scenePlayable(opts) {
    var views = opts.views || [];
    var main = views[0];
    return {
      visualStatus: "closed-etalon",
      visualPass: false,
      plateKind: "full-composite",
      guideBackground: opts.bg || null,
      compositionReference: main ? main.src : null,
      referenceCutout: opts.referenceCutout || null,
      openReference: opts.openReference || null,
      raiseBedPlayable: false,
      views: views,
      placement: null,
      hotspotOverrides: (main && main.hotspots) || {},
      layers: {
        closed: main ? main.src : null,
        open: null,
        contactShadow: null,
        mechanisms: []
      },
      secondState: opts.secondState || null,
      openTriggers: opts.openTriggers || [],
      openItems: opts.openItems || [],
      missingArt: opts.missingArt || [],
      equipmentGaps: opts.equipmentGaps || []
    };
  }

  window.VehicleExploreFleet = [
    {
      id: "fire-truck",
      displayTitle: "Fire Truck",
      registryUrl: "content/parts.registry.json",
      backgroundSrc: null,
      thumbSrc: composite("fire-truck"),
      scene: scenePlayable({
        bg: "public/images/backgrounds/fire-truck-bg.png",
        referenceCutout: "public/images/truck-36822-art/fire-truck-transparent.png",
        openReference: "public/images/truck-36822-art/fire-truck-pierce-open.png",
        secondState: "compartments-open",
        openTriggers: [
          "compartment-left-front",
          "compartment-left-rear",
          "compartment-left-rear-lift"
        ],
        openItems: [
          { id: "fire-hose", name: "Fire hose", text: "This hose carries water to the fire." },
          { id: "air-tanks", name: "Air tanks", text: "These tanks give firefighters clean air to breathe." },
          { id: "tools", name: "Tools", text: "Firefighters use these tools to help people." },
          { id: "pump", name: "Pump", text: "The pump controls the water flow." }
        ],
        views: [
          {
            id: "outside",
            label: "Outside",
            hint: "Tap a part of the fire truck.",
            kind: "composite",
            src: composite("fire-truck"),
            hotspots: {
              cab: { x: 32, y: 52 },
              "door-cab-front-left": { x: 36, y: 58 },
              "door-cab-rear-left": { x: 45, y: 58 },
              pump: { x: 55, y: 68 },
              "compartment-left-front": { x: 60, y: 58 },
              "compartment-left-rear": { x: 75, y: 58 },
              "compartment-left-rear-lift": { x: 86, y: 52 },
              ladder: { x: 58, y: 36 },
              "wheel-front": { x: 43, y: 73 },
              "wheel-rear-forward": { x: 72, y: 72 },
              "wheel-rear-aft": { x: 78, y: 72 }
            }
          },
          {
            id: "look-inside",
            label: "Look inside",
            hint: "Look inside the compartments. Tap the tools and gear.",
            kind: "cutout",
            src: "public/images/truck-36822-art/fire-truck-pierce-open.png",
            parts: [
              {
                id: "eq-hose",
                name: "Fire hose",
                explanation: "This hose carries water to the fire."
              },
              {
                id: "eq-air-tanks",
                name: "Air tanks",
                explanation: "These tanks give firefighters clean air to breathe."
              },
              {
                id: "eq-first-aid",
                name: "First aid kit",
                explanation: "This kit holds first-aid supplies."
              },
              {
                id: "eq-tools",
                name: "Tools",
                explanation: "Firefighters use these tools to help people."
              },
              {
                id: "eq-pump",
                name: "Pump panel",
                explanation: "The pump panel controls the water flow."
              }
            ],
            hotspots: {
              "eq-hose": { x: 55, y: 52 },
              "eq-air-tanks": { x: 68, y: 52 },
              "eq-first-aid": { x: 80, y: 60 },
              "eq-tools": { x: 92, y: 55 },
              "eq-pump": { x: 55, y: 72 }
            }
          }
        ],
        missingArt: [
          "Same-camera OPEN layers for true compartment animation",
          "Look inside uses pierce-open as a separate detail plate (not OPEN animation)"
        ]
      })
    },
    {
      id: "airport-fire-truck",
      displayTitle: "Airport Fire Truck",
      registryUrl: "content/panther.registry.json",
      backgroundSrc: null,
      thumbSrc: composite("airport-fire-truck"),
      scene: scenePlayable({
        bg: "public/images/backgrounds/airport-fire-truck-bg.png",
        referenceCutout: "preview/vehicle-explore/assets/panther-clear.png",
        openReference: "Backup/airport_fire_truck_Panther_open.png",
        secondState: "bays-open",
        views: [
          {
            id: "outside",
            label: "Outside",
            hint: "Tap a part of the airport fire truck.",
            kind: "composite",
            src: composite("airport-fire-truck"),
            hotspots: {
              "pan-cab": { x: 28, y: 48 },
              "pan-door": { x: 38, y: 50 },
              "pan-compartment": { x: 55, y: 58 },
              "pan-roof-turret": { x: 22, y: 30 },
              "pan-bumper-turret": { x: 22, y: 57 },
              "pan-wheel-front": { x: 44, y: 68 },
              "pan-wheel-middle": { x: 65, y: 68 },
              "pan-wheel-rear": { x: 74, y: 68 }
            }
          },
          {
            id: "look-inside",
            label: "Look inside",
            hint: "Look inside the rescue bays. Tap the gear.",
            kind: "cutout",
            src: "Backup/airport_fire_truck_Panther_open.png",
            parts: [
              {
                id: "eq-roof-turret",
                name: "Roof turret",
                explanation: "This turret shoots water onto a fire."
              },
              {
                id: "eq-hose-reel",
                name: "Hose reel",
                explanation: "This reel holds the fire hose."
              },
              {
                id: "eq-air-tanks",
                name: "Air tanks",
                explanation: "These tanks hold clean air to breathe."
              },
              {
                id: "eq-first-aid",
                name: "First aid kit",
                explanation: "This kit holds first-aid supplies."
              },
              {
                id: "eq-fan",
                name: "Ventilation fan",
                explanation: "This fan moves air and smoke."
              },
              {
                id: "eq-extinguisher",
                name: "Fire extinguisher",
                explanation: "This extinguisher puts out small fires."
              }
            ],
            hotspots: {
              "eq-roof-turret": { x: 12, y: 5 },
              "eq-hose-reel": { x: 43, y: 50 },
              "eq-air-tanks": { x: 59, y: 44 },
              "eq-first-aid": { x: 53, y: 62 },
              "eq-fan": { x: 70, y: 68 },
              "eq-extinguisher": { x: 65, y: 68 }
            }
          }
        ],
        equipmentGaps: [
          "Look inside: bumper turret not clearly separable on open profile plate"
        ],
        missingArt: ["Same-camera bay door layers for true OPEN"]
      })
    },
    {
      id: "police-car",
      displayTitle: "Police Car",
      registryUrl: "content/ford-police.registry.json",
      backgroundSrc: null,
      thumbSrc: composite("police-car"),
      scene: scenePlayable({
        bg: "public/images/backgrounds/police-car-bg.png",
        referenceCutout: "public/images/truck-36822-art/Ford Police Interceptor Utility.png",
        openReference: "Backup/police_front_transparent.png",
        secondState: "door-open",
        views: [
          {
            id: "outside",
            label: "Outside",
            hint: "Tap a part of the police car.",
            kind: "composite",
            src: composite("police-car"),
            hotspots: {
              "ford-cab": { x: 47, y: 48 },
              "ford-door-front": { x: 60, y: 62 },
              "ford-door-rear": { x: 74, y: 62 },
              "ford-light-bar": { x: 55, y: 41 },
              "ford-push-bumper": { x: 28, y: 70 },
              "ford-wheel-front": { x: 49, y: 81 },
              "ford-wheel-rear": { x: 75, y: 79 }
            }
          },
          {
            id: "front",
            label: "Front",
            hint: "Look at the front. Tap the lights and bumper.",
            kind: "cutout",
            src: "Backup/police_front_transparent.png",
            parts: [
              {
                id: "eq-light-bar",
                name: "Light bar",
                explanation: "These lights warn people that police are coming."
              },
              {
                id: "eq-push-bumper",
                name: "Push bumper",
                explanation: "This strong bumper can push cars."
              },
              {
                id: "eq-spotlight",
                name: "Spotlight",
                explanation: "This spotlight lights up dark places."
              }
            ],
            hotspots: {
              "eq-light-bar": { x: 55, y: 3 },
              "eq-push-bumper": { x: 32, y: 80 },
              "eq-spotlight": { x: 76, y: 26 }
            }
          },
          {
            id: "look-inside",
            label: "Look inside",
            hint: "Look in the trunk. Tap the police gear.",
            kind: "cutout",
            src: "Backup/police_back_transparent.png",
            parts: [
              {
                id: "eq-case",
                name: "Police case",
                explanation: "This case holds police gear."
              },
              {
                id: "eq-vest",
                name: "Safety vest",
                explanation: "This bright vest helps people see the officer."
              },
              {
                id: "eq-first-aid",
                name: "First aid kit",
                explanation: "This kit holds first-aid supplies."
              },
              {
                id: "eq-radios",
                name: "Radios",
                explanation: "Officers use these radios to talk to each other."
              },
              {
                id: "eq-megaphone",
                name: "Megaphone",
                explanation: "This megaphone makes a voice sound louder."
              },
              {
                id: "eq-flashlight",
                name: "Flashlight",
                explanation: "This flashlight lights up dark places."
              },
              {
                id: "eq-cones",
                name: "Traffic cones",
                explanation: "These cones warn people to stay back."
              }
            ],
            hotspots: {
              "eq-case": { x: 38, y: 48 },
              "eq-vest": { x: 65, y: 47 },
              "eq-first-aid": { x: 30, y: 65 },
              "eq-radios": { x: 46, y: 65 },
              "eq-megaphone": { x: 59, y: 65 },
              "eq-flashlight": { x: 72, y: 65 },
              "eq-cones": { x: 80, y: 65 }
            }
          }
        ],
        equipmentGaps: [
          "Front plate shows crew close-up, not open equipment lockers"
        ],
        missingArt: ["Same-camera door-open layer"]
      })
    },
    {
      id: "excavator",
      displayTitle: "Excavator",
      registryUrl: "content/caterpillar-320.registry.json",
      backgroundSrc: null,
      thumbSrc: composite("excavator"),
      scene: scenePlayable({
        bg: "public/images/backgrounds/excavator-bg.png",
        referenceCutout: "public/images/truck-36822-art/caterpillar-320.png",
        openReference: "Backup/excavator_CAT320_cartoon_operator.png",
        secondState: "boom-pose",
        views: [
          {
            id: "outside",
            label: "Outside",
            hint: "Tap a part of the excavator.",
            kind: "composite",
            src: composite("excavator"),
            hotspots: {
              "cat-cab": { x: 60, y: 50 },
              "cat-cab-door": { x: 63, y: 55 },
              "cat-boom": { x: 40, y: 30 },
              "cat-stick": { x: 20, y: 58 },
              "cat-bucket": { x: 24, y: 78 },
              "cat-track": { x: 62, y: 80 }
            }
          },
          {
            id: "look-inside",
            label: "Look inside",
            hint: "Look at the open engine and digging arm. Tap to learn.",
            kind: "cutout",
            src: "Backup/excavator_CAT320_cartoon_operator.png",
            parts: [
              {
                id: "eq-engine",
                name: "Engine",
                explanation: "The engine makes the excavator move and dig."
              },
              {
                id: "eq-filters",
                name: "Oil filters",
                explanation: "These filters help keep the engine oil clean."
              },
              {
                id: "eq-boom",
                name: "Boom",
                explanation: "The boom is the long arm that lifts."
              },
              {
                id: "eq-stick",
                name: "Stick",
                explanation: "The stick reaches out to the bucket."
              },
              {
                id: "eq-bucket",
                name: "Bucket",
                explanation: "The bucket digs and scoops dirt."
              }
            ],
            hotspots: {
              "eq-engine": { x: 78, y: 45 },
              "eq-filters": { x: 77, y: 56 },
              "eq-boom": { x: 25, y: 18 },
              "eq-stick": { x: 8, y: 40 },
              "eq-bucket": { x: 10, y: 88 }
            }
          }
        ],
        missingArt: ["boom/stick/bucket mechanism layers same camera"]
      })
    },
    {
      id: "mobile-crane",
      displayTitle: "Mobile Crane",
      registryUrl: "content/liebherr-ltm-1090-4-2.registry.json",
      backgroundSrc: null,
      thumbSrc: composite("mobile-crane"),
      scene: scenePlayable({
        bg: "public/images/backgrounds/mobile-crane-bg.png",
        referenceCutout: "public/images/truck-36822-art/liebherr-ltm-1090-4-2.png",
        openReference: "Backup/mobile_crane_Liebherr_open.png",
        secondState: "outriggers-or-lockers",
        views: [
          {
            id: "outside",
            label: "Outside",
            hint: "Tap a part of the crane.",
            kind: "composite",
            src: composite("mobile-crane"),
            hotspots: {
              "ltm-driver-cab": { x: 26, y: 52 },
              "ltm-driver-door": { x: 32, y: 58 },
              "ltm-crane-cab": { x: 63, y: 45 },
              "ltm-crane-door": { x: 66, y: 48 },
              "ltm-boom": { x: 35, y: 32 },
              "ltm-hook": { x: 16, y: 60 },
              "ltm-wheel-1": { x: 31, y: 80 },
              "ltm-wheel-2": { x: 46, y: 76 },
              "ltm-wheel-3": { x: 58, y: 75 },
              "ltm-wheel-5": { x: 73, y: 74 }
            }
          },
          {
            id: "look-inside",
            label: "Look inside",
            hint: "Look in the open lockers. Tap the lifting gear.",
            kind: "cutout",
            src: "Backup/mobile_crane_Liebherr_open.png",
            parts: [
              {
                id: "eq-boom",
                name: "Boom",
                explanation: "The boom reaches high to lift loads."
              },
              {
                id: "eq-hook",
                name: "Hook",
                explanation: "The hook holds the load."
              },
              {
                id: "eq-cable",
                name: "Winch cable",
                explanation: "This cable winds in and out to lift."
              },
              {
                id: "eq-straps",
                name: "Lifting straps",
                explanation: "These straps help hold a load."
              },
              {
                id: "eq-shackles",
                name: "Shackles",
                explanation: "These strong rings connect the load."
              },
              {
                id: "eq-extinguisher",
                name: "Fire extinguisher",
                explanation: "This extinguisher puts out small fires."
              },
              {
                id: "eq-cone",
                name: "Traffic cone",
                explanation: "This cone warns people to stay back."
              }
            ],
            hotspots: {
              "eq-boom": { x: 40, y: 18 },
              "eq-hook": { x: 5, y: 55 },
              "eq-cable": { x: 45, y: 48 },
              "eq-straps": { x: 58, y: 52 },
              "eq-shackles": { x: 65, y: 50 },
              "eq-extinguisher": { x: 84, y: 52 },
              "eq-cone": { x: 79, y: 54 }
            }
          }
        ],
        missingArt: ["outriggers/locker layers same camera"]
      })
    },
    {
      id: "tractor",
      displayTitle: "Tractor",
      registryUrl: "content/john-deere-8r-410.registry.json",
      backgroundSrc: null,
      thumbSrc: composite("tractor"),
      scene: scenePlayable({
        bg: "public/images/backgrounds/tractor-bg.png",
        referenceCutout: "public/images/truck-36822-art/John Deere 8R 410.png",
        openReference: "public/images/truck-36822-art/tractor-with-empty-trailer.png",
        secondState: "hitch-optional",
        views: [
          {
            id: "outside",
            label: "Outside",
            hint: "Tap a part of the tractor.",
            kind: "composite",
            src: composite("tractor"),
            hotspots: {
              "jd-cab": { x: 65, y: 45 },
              "jd-door": { x: 68, y: 52 },
              "jd-ladder": { x: 67, y: 68 },
              "jd-hitch": { x: 34, y: 70 },
              "jd-wheel-front": { x: 39, y: 74 },
              "jd-wheel-rear": { x: 82, y: 69 }
            }
          },
          {
            id: "trailer",
            label: "Trailer",
            hint: "Explore the tractor and its empty farm trailer. Tap to learn.",
            kind: "cutout",
            src: "public/images/truck-36822-art/tractor-with-empty-trailer.png",
            parts: [
              {
                id: "eq-engine",
                name: "Engine",
                explanation: "The engine makes the tractor move."
              },
              {
                id: "eq-weights",
                name: "Front weights",
                explanation: "These weights help the tractor stay steady."
              },
              {
                id: "eq-trailer",
                name: "Farm trailer",
                explanation: "This trailer carries pumpkins from the field."
              },
              {
                id: "eq-cab",
                name: "Cab",
                explanation: "The driver sits in the cab."
              }
            ],
            hotspots: {
              "eq-engine": { x: 20, y: 48 },
              "eq-weights": { x: 6, y: 65 },
              "eq-trailer": { x: 78, y: 53 },
              "eq-cab": { x: 35, y: 27 }
            }
          }
        ],
        missingArt: ["optional hitch layer same camera as Outside"]
      })
    },
    {
      id: "dump-truck",
      displayTitle: "Dump Truck",
      registryUrl: "content/volvo-a40g.registry.json",
      backgroundSrc: null,
      thumbSrc: composite("dump-truck"),
      scene: scenePlayable({
        bg: "public/images/backgrounds/dump-truck-bg.png",
        referenceCutout: "public/images/truck-36822-art/Volvo A40G.png",
        openReference: "Backup/dump-truck-open.png",
        secondState: "dump-body-up",
        openTriggers: ["vol-body"],
        views: [
          {
            id: "outside",
            label: "Outside",
            hint: "Tap a part of the dump truck.",
            kind: "composite",
            src: composite("dump-truck"),
            hotspots: {
              "vol-cab": { x: 30, y: 42 },
              "vol-door": { x: 35, y: 48 },
              "vol-body": { x: 65, y: 50 },
              "vol-wheel-front": { x: 43, y: 72 },
              "vol-wheel-middle": { x: 63, y: 72 },
              "vol-wheel-rear": { x: 70, y: 71 }
            }
          },
          {
            id: "look-inside",
            label: "Look inside",
            hint: "Look at the open engine and dump body. Tap to learn.",
            kind: "cutout",
            src: "Backup/dump-truck-open.png",
            parts: [
              {
                id: "eq-engine",
                name: "Engine",
                explanation: "The engine makes the dump truck move."
              },
              {
                id: "eq-body",
                name: "Dump body",
                explanation: "This big bed carries rocks and dirt."
              },
              {
                id: "eq-cab",
                name: "Cab",
                explanation: "The driver sits in the cab."
              }
            ],
            hotspots: {
              "eq-engine": { x: 25, y: 45 },
              "eq-body": { x: 75, y: 28 },
              "eq-cab": { x: 36, y: 28 }
            }
          }
        ],
        equipmentGaps: [
          "Look inside plate shows engine open, not a raised dump bed (Raise Bed needs separate layers)"
        ],
        missingArt: [
          "chassis-cab + dump-body layers for Raise Bed",
          "See preview/vehicle-explore/dump-truck/LAYER_ANALYSIS.md"
        ]
      })
    },
    {
      id: "mars-rover",
      displayTitle: "Mars Rover",
      registryUrl: "content/perseverance.registry.json",
      backgroundSrc: null,
      thumbSrc: composite("mars-rover"),
      scene: scenePlayable({
        bg: "public/images/backgrounds/mars-rover-bg.png",
        referenceCutout: "public/images/truck-36822-art/perseverance-polished.png",
        openReference: "Backup/mars-rover-open.png",
        secondState: "bay-or-arm",
        views: [
          {
            id: "outside",
            label: "Outside",
            hint: "Tap a part of the Mars rover.",
            kind: "composite",
            src: composite("mars-rover"),
            hotspots: {
              "pers-body": { x: 55, y: 55 },
              "pers-mast": { x: 53, y: 34 },
              "pers-arm": { x: 42, y: 58 },
              "pers-turret": { x: 36, y: 62 },
              "pers-rocker-bogie": { x: 48, y: 70 },
              "pers-wheel-front": { x: 35, y: 75 },
              "pers-wheel-middle": { x: 56, y: 79 },
              "pers-wheel-rear": { x: 77, y: 74 }
            }
          },
          {
            id: "look-inside",
            label: "Look inside",
            hint: "Look at the open panel and science tools. Tap to learn.",
            kind: "cutout",
            src: "Backup/mars-rover-open.png",
            parts: [
              {
                id: "eq-computers",
                name: "Computers",
                explanation: "These computers help the rover explore Mars."
              },
              {
                id: "eq-mast",
                name: "Mast camera",
                explanation: "This tall mast holds the cameras."
              },
              {
                id: "eq-arm",
                name: "Robot arm",
                explanation: "This arm reaches out to study rocks."
              },
              {
                id: "eq-tools",
                name: "Science tools",
                explanation: "These tools study rocks and soil."
              }
            ],
            hotspots: {
              "eq-computers": { x: 50, y: 52 },
              "eq-mast": { x: 55, y: 8 },
              "eq-arm": { x: 28, y: 52 },
              "eq-tools": { x: 6, y: 50 }
            }
          }
        ],
        missingArt: ["arm/bay layers same camera"]
      })
    },
    {
      id: "ambulance",
      displayTitle: "Ambulance",
      registryUrl: "content/ford-f450.registry.json",
      backgroundSrc: null,
      thumbSrc: composite("ambulance"),
      scene: scenePlayable({
        bg: "public/images/backgrounds/ambulance-bg.png",
        referenceCutout: "public/images/truck-36822-art/ford-f450-ambulance.png",
        openReference: "Backup/ambulance_front_transparent.png",
        secondState: "module-door-open",
        views: [
          {
            id: "outside",
            label: "Outside",
            hint: "Tap a part of the ambulance.",
            kind: "composite",
            src: composite("ambulance"),
            hotspots: {
              "amb-cab": { x: 42, y: 58 },
              "amb-door": { x: 50, y: 68 },
              "amb-compartment": { x: 71, y: 53 },
              "amb-compartment-door": { x: 62, y: 65 },
              "amb-lights": { x: 52, y: 40 },
              "amb-wheel-front": { x: 44, y: 86 },
              "amb-wheel-rear": { x: 73, y: 83 }
            }
          },
          {
            id: "front",
            label: "Front",
            hint: "Look at the front. Tap the lights and medical symbol.",
            kind: "cutout",
            src: "Backup/ambulance_front_transparent.png",
            parts: [
              {
                id: "eq-lights",
                name: "Warning lights",
                explanation: "These lights warn other drivers."
              },
              {
                id: "eq-star",
                name: "Star of Life",
                explanation: "This symbol means medical help."
              }
            ],
            hotspots: {
              "eq-lights": { x: 50, y: 5 },
              "eq-star": { x: 89, y: 60 }
            }
          },
          {
            id: "look-inside",
            label: "Look inside",
            hint: "Look inside the ambulance. Tap the medical gear.",
            kind: "cutout",
            src: "Backup/ambulance_back_transparent.png",
            parts: [
              {
                id: "eq-stretcher",
                name: "Stretcher",
                explanation: "This stretcher carries a patient."
              },
              {
                id: "eq-monitor",
                name: "Heart monitor",
                explanation: "This screen shows the patient's heartbeat."
              },
              {
                id: "eq-oxygen",
                name: "Oxygen tanks",
                explanation: "These tanks give patients oxygen to breathe."
              },
              {
                id: "eq-bag",
                name: "Medical bag",
                explanation: "This bag holds medical tools."
              },
              {
                id: "eq-spine-board",
                name: "Spine board",
                explanation: "This board keeps a person's back safe."
              }
            ],
            hotspots: {
              "eq-stretcher": { x: 48, y: 52 },
              "eq-monitor": { x: 42, y: 30 },
              "eq-oxygen": { x: 60, y: 32 },
              "eq-bag": { x: 28, y: 42 },
              "eq-spine-board": { x: 88, y: 40 }
            }
          }
        ],
        equipmentGaps: [
          "Front plate is a crew close-up; open patient bay is on Look inside"
        ],
        missingArt: ["module door layer same camera"]
      })
    }
  ];

  window.VehicleExploreFleet.byId = function (id) {
    return (window.VehicleExploreFleet || []).find(function (item) {
      return item && item.id === id;
    }) || null;
  };
})();
