// Obstacle Configuration File - Records all obstacle parameters

const OBSTACLE_CONFIG = {
   /**
* Large vehicles (Bus, Ambulance, Truck, Fire Engine)
* Characteristics: One-hit kill, relatively slow.
    */
   LARGE_CAR: {
      baseType: "LARGE_CAR",
      type: "HAZARD",
      name: "Large Car",
      description: "Instant kill obstacle",

      // Physical parameters
      speed: { min: 0.6, max: 0.8 },  // × player speed
      size: { width: 170, height: 420 },

      // Damage parameters
      damage: 100,
      instantKill: true,
      effect: "hitKill",
      failType: "HIT_BUS",

      allowedLanes: [2, 3],  // Only in the middle two lanes
      mutualExclusion: ["PROMOTER", "HOMELESS"],

      // Variants (same type, different sprites)
      variants: [
         { name: "Bus", sprite: "assets/obstacles/obstacle_bus.png", size: { width: 170, height: 420 } },
         { name: "Ambulance", sprite: "assets/obstacles/obstacle_ambulance.png", size: { width: 140, height: 260 } },
      ]
   },

   /**
    * Small vehicles (Police, Sedan, Tractor)
    * Characteristics: 3 hits to kill, speed similar to player
    */
   SMALL_CAR: {
      baseType: "SMALL_CAR",
      type: "HAZARD",
      name: "Small Car",
      description: "Damage obstacle - 3 hits to kill",

      // Physical parameters
      speed: { min: 0.9, max: 1.1 },  // Close to player speed
      size: { width: 110, height: 210 },

      // Damage parameters
      damage: 34,
      instantKill: false,
      hitsToKill: 3,
      effect: "damage",

      // Generation constraints
      allowedLanes: [2, 3],
      mutualExclusion: [],

      // Variants
      variants: [
         { name: "Car_red", sprite: "assets/obstacles/obstacle_car_red.png", hasSiren: true },
         { name: "Car_brown", sprite: "assets/obstacles/obstacle_car_brown.png" },

      ]
   },

   /**
    * Scooter Rider
    * Characteristics: 0.5s stun → 1s lane change delay → Camera shake (TODO)
    */
   SCOOTER_RIDER: {
      baseType: "SCOOTER_RIDER",
      type: "HAZARD",
      name: "Scooter Rider",
      description: "Stun 0.5s + Lane delay 1s + Camera shake",

      // Physical parameters
      speed: { min: 1.3, max: 1.4 },
      // Keep near original sprite aspect ratio (110:230) to avoid horizontal stretch.
      size: { width: 66, height: 138 },

      // Damage parameters
      damage: 0,
      instantKill: false,
      effect: "stun",

      // Effect sequence
      stunDuration: 0.5,              // Stage 1: Stun 0.5s
      laneDelayDuration: 1.0,         // Stage 2: Lane change delay 1s (starts after stun)
      // cameraShakeDuration: 1.0,    // TODO: Stage 3: Camera shake (to be implemented)

      // Lane-change behaviour on road (dynamic space pressure)
      laneChangeInterval: { min: 0.45, max: 0.95 },  // seconds between lane decisions
      laneChangeDuration: { min: 0.18, max: 0.28 },  // linear move duration per lane switch
      proximityLaneChangeRadius: 600,                // Trigger one lane change when player enters this radius
      //less is fast if switching from lane 

      // Generation constraints
      allowedLanes: [1, 2, 3, 4],  // Any lane
      mutualExclusion: [],

      // Variants
      variants: [
         { name: "Scooter Rider", sprite: "assets/obstacles/obstacle_scooter.png" }
      ]
   },

   /**
    * Homeless
    * Characteristics: Forced lane switch
    */
   HOMELESS: {
      baseType: "HOMELESS",
      type: "HAZARD",
      name: "Homeless",
      description: "Forced lane switch - Different dialogue per day",

      // Physical parameters
      speed: { min: 0, max: 0 },
      size: { width: 140, height: 140 },

      // Damage parameters
      damage: 10,
      instantKill: false,
      effect: "forcedLaneSwitch",

      // Dialogue test copy (fallback for all days until day-specific lines are authored)
      defaultDialogue: "I am HUNGRY!!!",
      dialoguesByDay: {
         1: "I am HUNGRY!!!",
         2: "Spare any change?",
         3: "You shouldn’t be here!",
         4: "Shit!",
         5: "Just a quid."
      },
      bubbleOffsetX: 0,      // Horizontal offset relative to homeless X (pixels)
      bubbleTextSize: 35,    // Speech bubble font size

      // Generation constraints
      allowedLanes: [1, 4], // Only on the edges of the sidewalk
      mutualExclusion: ["LARGE_CAR"],

      variants: [
         { id: "homeless_v1", name: "Homeless", sprite: "assets/obstacles/obstacle_homeless.png" }
      ]
   },

   /**
    * Promoter - Leaflet mechanism
    * Characteristics: Screen covered by leaflet upon collision, press SPACE 10x to clear leaflet,
    *      Leaflet clears the first obstacle in the current lane
    *      Side effect: LARGE_CAR won't spawn for 5 seconds
    */
   PROMOTER: {
      baseType: "PROMOTER",
      type: "INTERACTIVE",
      name: "Promoter",
      description: "Leaflet - Press SPACE 10x to throw paper ball and clear nearest obstacle",

      // Physical parameters
      speed: { min: 0, max: 0 },  // Stationary on the road
      // Keep near original sprite aspect ratio (120:220) to avoid horizontal stretch.
      size: { width: 87, height: 160 },

      // Damage parameters
      damage: 0,
      effect: "leaflet",

      // Leaflet interaction parameters
      leafletWidth: 810,
      leafletHeight: 970,
      spacePressRequired: 5,        // Press SPACE 10 times
      clearNearestObstacle: true,    // Clear the first obstacle in the current lane
      leafletSprites: [
         "assets/obstacles/obstacle_flyer3.png",
         "assets/obstacles/obstacle_flyer4.png"
      ],
      leafletSpritesByDay: {
         3: [
            "assets/obstacles/obstacle_flyer3.png",
            "assets/obstacles/obstacle_flyer4.png"
         ]
      },
      paperBallSprite: "assets/obstacles/obstacle_paperball.png",
      paperBallSize: { width: 48, height: 48 },

      // Cooldown mechanism: Cooldown time after hitting the promoter
      interactionCooldown: 5.0,      // 5 seconds cooldown after interaction
      cooldownAffectsObstacle: "LARGE_CAR",  // LARGE_CAR won't spawn during cooldown

      // Generation constraints
      allowedLanes: [1, 4],          // Only on the edges of the sidewalk
      mutualExclusion: ["LARGE_CAR"],

      // World sprite: promoter NPC on street. Flyer sprites are overlay assets.
      variants: [
         { id: "promoter_npc_1", name: "Promoter", sprite: "assets/obstacles/obstacle_promoter.png" }
      ]
   },

   /**
    * Small Business (Ice-cream cart / Kebab cart)
    * Characteristics: 10 damage + scolding SFX on hit
    * NOTE: Placeholder art uses black rectangle in obstacle renderer when sprite is unavailable.
    */
   SMALL_BUSINESS: {
      baseType: "SMALL_BUSINESS",
      type: "HAZARD",
      name: "Small Business",
      description: "Deals 10 damage and plays scolding SFX on hit",

      // Physical parameters (same footprint as HOMELESS)
      speed: { min: 0, max: 0 },
      size: { width: 140, height: 140 },

      // Damage parameters
      damage: 10,
      instantKill: false,
      effect: "damage",

      // Generation constraints
      allowedLanes: [1, 4],
      mutualExclusion: [],

      // Variants with side-specific sprites.
      variants: [
         {
            id: "small_business_icecream",
            name: "Ice Cream Cart",
            size: { width: 270, height: 311 },
            spriteBySide: {
               left: "assets/obstacles/obstacle_scoop_left.png",
               right: "assets/obstacles/obstacle_scoop_right.png"
            }
         },
         {
            id: "small_business_kebab",
            name: "Kebab Cart",
            size: { width: 320, height: 230 },
            spriteBySide: {
               left: "assets/obstacles/obstacle_kebab_left.png",
               right: "assets/obstacles/obstacle_kebab_right.png"
            }
         }
      ]
   },

   /**
    * Fantasy Coffee
    * Characteristics: Disguises as normal coffee; only reveals itself when the player is
    * in the same lane and close enough, then runs away toward a 45-degree south direction off-screen.
    */
   FANTASY_COFFEE: {
      baseType: "FANTASY_COFFEE",
      type: "HAZARD",
      name: "Fantasy Coffee",
      description: "Disguises as coffee, then runs away at 45-degree south when approached in the same lane",

      // Physical parameters
      speed: { min: 0, max: 0 },  // Stationary pickup-like hazard
      size: { width: 110, height: 120 },

      // Damage / effect parameters
      damage: 0,
      instantKill: false,
      effect: "illusionEscape",

      // Generation constraints
      allowedLanes: [1],           // Spawn only on lane1
      mutualExclusion: [],

      // Visual behavior:
      // 1) Spawn disguised as normal coffee
      // 2) Trigger when player enters the same lane and a radial range around coffee
      // 3) Play running sprite-sheet and escape diagonally (south 45°) off-screen
      disguiseSprite: "assets/power_up/powerup_coffee.png",
      runSpriteSheet: "assets/obstacles/obstacle_coffee_spritesheet.png",
      runSpriteFrames: 6,
      runAnimFps: 12,
      escapeTriggerRadius: 500,
      escapeStartupFrames: 10,
      escapeAngleDeg: 76,
      escapeSpeed: 4.8,
      sprite: "assets/power_up/powerup_coffee.png"
   },

   /**
    * Puddle
    * Characteristics: Environmental obstacle - Minor damage
    */
   PUDDLE: {
      baseType: "PUDDLE",
      type: "ENVIRONMENTAL",
      name: "Puddle",
      description: "Deals 20 damage, sticks to player and slows run until SPACE x3",

      // Physical parameters
      speed: { min: 0, max: 0 },  // Stationary
      size: { width: 170, height: 80 },

      // Damage parameters
      damage: 20,
      effect: "puddleTrap",
      escapePressRequired: 3,
      slowMultiplier: 0.72,

      // Generation constraints
      allowedLanes: [2, 3],  // Only on the road
      mutualExclusion: [],

      sprite: "assets/obstacles/obstacle_puddle.png"
   },

   // ===== BUFF Items =====

   /**
    * Coffee
    * Characteristics: Heal 33 HP - Overflow locks HP for 3s (invincible)
    */
   COFFEE: {
      baseType: "COFFEE",
      type: "BUFF",
      name: "Coffee",
      description: "Heal +33 HP - Overflow locks HP for 3s (invincible)",

      // Physical parameters
      speed: { min: 0, max: 0 },  // Stationary
      size: { width: 96, height: 96 },

      // Effect parameters
      damage: 0,
      effect: "heal",
      healAmount: 33,
      overflowEffect: "hpLock",
      hpLockDuration: 3.0,

      // Generation constraints
      allowedLanes: [1, 4],  // Only on the sidewalk
      mutualExclusion: [],

      // No variants
      sprite: "assets/power_up/powerup_coffee.png"
   },

   /**
    * Empty Scooter
    * Characteristics: 5s Speed Boost + 7s Invincible, ignore all obstacles
    */
   EMPTY_SCOOTER: {
      baseType: "EMPTY_SCOOTER",
      type: "BUFF",
      name: "Empty Scooter",
      description: "5s Speed Boost + 7s Invincible (ignore all obstacles)",

      // Physical parameters
      speed: { min: 0, max: 0 },  // Stationary
      size: { width: 140, height: 160 },

      // Effect parameters
      effect: "speedBoostAndInvincible",
      speedBoostDuration: 5.0,
      invincibleDuration: 7.0,
      speedMultiplier: 1.2,
      ignoreAllObstacles: true,
      helmetAutoPick: true,

      // Generation constraints
      allowedLanes: [1, 2, 3, 4],  // Anywhere
      mutualExclusion: [],

      // Variants
      variants: [
         { name: "Scooter", sprite: "assets/power_up/powerup_scooter.png", weight: 1 },
         { name: "Motorcycle", sprite: "assets/power_up/powerup_motorcycle.png", weight: 1 },
         // Keep this variant on an existing asset to avoid invisible pickups.
         { name: "Empty Scooter", sprite: "assets/power_up/powerup_scooter.png", weight: 1 }
      ]
   }
};
