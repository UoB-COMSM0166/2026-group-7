// Obstacle configuration — records all obstacle parameters.

const OBSTACLE_CONFIG = {
   /** Large vehicles (Bus, Ambulance, Truck, Fire Engine): one-hit kill, relatively slow. */
   LARGE_CAR: {
      baseType: "LARGE_CAR",
      type: "HAZARD",
      name: "Large Car",
      description: "Instant kill obstacle",

      speed: { min: 0.6, max: 0.8 },  // × player speed
      size: { width: 170, height: 420 },

      damage: 100,
      instantKill: true,
      effect: "hitKill",
      failType: "HIT_BUS",

      allowedLanes: [2, 3],  // Only in the middle two lanes
      mutualExclusion: ["PROMOTER", "HOMELESS"],

      variants: [
         { name: "Bus", sprite: "assets/obstacles/obstacle_bus.png", size: { width: 170, height: 420 } },
         { name: "Ambulance", sprite: "assets/obstacles/obstacle_ambulance.png", size: { width: 140, height: 260 } },
      ]
   },

   /** Small vehicles (Police, Sedan, Tractor): 3 hits to kill, speed similar to player. */
   SMALL_CAR: {
      baseType: "SMALL_CAR",
      type: "HAZARD",
      name: "Small Car",
      description: "Damage obstacle - 3 hits to kill",

      speed: { min: 0.9, max: 1.1 },  // Close to player speed
      size: { width: 110, height: 210 },

      damage: 34,
      instantKill: false,
      hitsToKill: 3,
      effect: "damage",

      allowedLanes: [2, 3],
      mutualExclusion: [],

      variants: [
         { name: "Car_red", sprite: "assets/obstacles/obstacle_car_red.png", hasSiren: true },
         { name: "Car_brown", sprite: "assets/obstacles/obstacle_car_brown.png" },
      ]
   },

   /** Scooter Rider: 0.5s stun then 1s lane-change delay. */
   SCOOTER_RIDER: {
      baseType: "SCOOTER_RIDER",
      type: "HAZARD",
      name: "Scooter Rider",
      description: "Stun 0.5s + Lane delay 1s",

      speed: { min: 1.3, max: 1.4 },
      // Keep near original sprite aspect ratio (110:230) to avoid horizontal stretch.
      size: { width: 66, height: 138 },

      damage: 0,
      instantKill: false,
      effect: "stun",

      stunDuration: 0.5,
      laneDelayDuration: 1.0,

      laneChangeInterval: { min: 0.45, max: 0.95 },  // seconds between lane decisions
      laneChangeDuration: { min: 0.18, max: 0.28 },  // linear move duration per lane switch
      proximityLaneChangeRadius: 600,

      allowedLanes: [1, 2, 3, 4],
      mutualExclusion: [],

      variants: [
         { name: "Scooter Rider", sprite: "assets/obstacles/obstacle_scooter.png" }
      ]
   },

   /** Homeless: forces a lane switch; dialogue varies by day. */
   HOMELESS: {
      baseType: "HOMELESS",
      type: "HAZARD",
      name: "Homeless",
      description: "Forced lane switch - Different dialogue per day",

      speed: { min: 0, max: 0 },
      size: { width: 140, height: 140 },

      damage: 10,
      instantKill: false,
      effect: "forcedLaneSwitch",

      defaultDialogue: "I am HUNGRY!!!",
      dialoguesByDay: {
         1: "I am HUNGRY!!!",
         2: "Spare any change?",
         3: "You shouldn't be here!",
         4: "Shit!",
         5: "Just a quid."
      },
      bubbleOffsetX: 0,
      bubbleTextSize: 35,

      allowedLanes: [1, 4],
      mutualExclusion: ["LARGE_CAR"],

      variants: [
         { id: "homeless_v1", name: "Homeless", sprite: "assets/obstacles/obstacle_homeless.png" }
      ]
   },

   /**
    * Promoter: covers screen with a leaflet; press SPACE 5x to throw a paper ball
    * that clears the nearest obstacle. LARGE_CAR is suppressed for 5s afterward.
    */
   PROMOTER: {
      baseType: "PROMOTER",
      type: "INTERACTIVE",
      name: "Promoter",
      description: "Leaflet - Press SPACE 5x to throw paper ball and clear nearest obstacle",

      speed: { min: 0, max: 0 },
      // Keep near original sprite aspect ratio (120:220) to avoid horizontal stretch.
      size: { width: 87, height: 160 },

      damage: 0,
      effect: "leaflet",

      leafletWidth: 810,
      leafletHeight: 970,
      spacePressRequired: 5,
      clearNearestObstacle: true,
      leafletSprites: [
         "assets/obstacles/obstacle_flyer3.webp",
         "assets/obstacles/obstacle_flyer4.webp"
      ],
      leafletSpritesByDay: {
         3: [
            "assets/obstacles/obstacle_flyer3.webp",
            "assets/obstacles/obstacle_flyer4.webp"
         ]
      },
      paperBallSprite: "assets/obstacles/obstacle_paperball.png",
      paperBallSize: { width: 48, height: 48 },

      interactionCooldown: 5.0,
      cooldownAffectsObstacle: "LARGE_CAR",

      allowedLanes: [1, 4],
      mutualExclusion: ["LARGE_CAR"],

      variants: [
         { id: "promoter_npc_1", name: "Promoter", sprite: "assets/obstacles/obstacle_promoter.png" }
      ]
   },

   /**
    * Small Business (Ice-cream cart / Kebab cart): deals 10 damage and plays a scolding SFX.
    * Placeholder art uses a black rectangle when the sprite is unavailable.
    */
   SMALL_BUSINESS: {
      baseType: "SMALL_BUSINESS",
      type: "HAZARD",
      name: "Small Business",
      description: "Deals 10 damage and plays scolding SFX on hit",

      speed: { min: 0, max: 0 },
      size: { width: 140, height: 140 },

      damage: 10,
      instantKill: false,
      effect: "damage",

      allowedLanes: [1, 4],
      mutualExclusion: [],

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
    * Fantasy Coffee: disguises as normal coffee; flees diagonally when the player
    * enters the same lane within escapeTriggerRadius.
    */
   FANTASY_COFFEE: {
      baseType: "FANTASY_COFFEE",
      type: "HAZARD",
      name: "Fantasy Coffee",
      description: "Disguises as coffee, then runs away at 45-degree south when approached in the same lane",

      speed: { min: 0, max: 0 },
      size: { width: 110, height: 120 },

      damage: 0,
      instantKill: false,
      effect: "illusionEscape",

      allowedLanes: [1],
      mutualExclusion: [],

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

   /** Puddle: deals 20 damage and slows the player until SPACE is pressed 3 times. */
   PUDDLE: {
      baseType: "PUDDLE",
      type: "ENVIRONMENTAL",
      name: "Puddle",
      description: "Deals 20 damage, sticks to player and slows run until SPACE x3",

      speed: { min: 0, max: 0 },
      size: { width: 170, height: 80 },

      damage: 20,
      effect: "puddleTrap",
      escapePressRequired: 3,
      slowMultiplier: 0.72,

      allowedLanes: [2, 3],  // Only on the road
      mutualExclusion: [],

      sprite: "assets/obstacles/obstacle_puddle.png"
   },

   /** Coffee: heals 33 HP; overflow locks HP for 3s (invincible). */
   COFFEE: {
      baseType: "COFFEE",
      type: "BUFF",
      name: "Coffee",
      description: "Heal +33 HP - Overflow locks HP for 3s (invincible)",

      speed: { min: 0, max: 0 },
      size: { width: 96, height: 96 },

      damage: 0,
      effect: "heal",
      healAmount: 33,
      overflowEffect: "hpLock",
      hpLockDuration: 3.0,

      allowedLanes: [1, 4],
      mutualExclusion: [],

      sprite: "assets/power_up/powerup_coffee.png"
   },

   /** Empty Scooter: 5s speed boost + 7s invincibility; ignores all obstacles. */
   EMPTY_SCOOTER: {
      baseType: "EMPTY_SCOOTER",
      type: "BUFF",
      name: "Empty Scooter",
      description: "5s Speed Boost + 7s Invincible (ignore all obstacles)",

      speed: { min: 0, max: 0 },
      size: { width: 140, height: 160 },

      effect: "speedBoostAndInvincible",
      speedBoostDuration: 5.0,
      invincibleDuration: 7.0,
      speedMultiplier: 1.2,
      ignoreAllObstacles: true,
      helmetAutoPick: true,

      allowedLanes: [1, 2, 3, 4],
      mutualExclusion: [],

      // Keep the third variant on an existing asset to avoid invisible pickups.
      variants: [
         { name: "Scooter", sprite: "assets/power_up/powerup_scooter.png", weight: 1 },
         { name: "Motorcycle", sprite: "assets/power_up/powerup_motorcycle.png", weight: 1 },
         { name: "Empty Scooter", sprite: "assets/power_up/powerup_scooter.png", weight: 1 }
      ]
   }
};
