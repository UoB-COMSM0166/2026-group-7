<div align="center">

# Week 1 Lab: List of Ideas

<br>

## Description

</div>

> The primary objective of Week 1 was **Collective Ideation and Feasibility Analysis**. Our team focused on exploring a wide spectrum of game genres to identify a project that balances creative novelty with technical viability within the p5.js framework.

<br>

<div align="center">

## Catalog

| Member | Proposed Game Concepts |
|:---:|:---|
| **Charlotte Yu** | [Game 1: Elemental Grove Defense](#game-1-elemental-grove-defense) <br> [Game 2: Park Street Survivor](#game-2-park-street-survivor) |
| **Lucca Zhou** | [Game 3: Balatro](#game-3-balatro) <br> [Game 4: Pico Park](#game-4-pico-park) |
| **Ray Wang** | [Game 5: Flappy Bird](#game-5-flappy-bird) <br> [Game 6: Super Mario Bros](#game-6-super-mario-bros) <br> [Game 7: Tableturf Battle](#game-7-tableturf-battle) |
| **Layla Pei** | [Game 8: Tower at the End](#game-8-tower-at-the-end) <br> [Game 9: The Strongest Support](#game-9-the-strongest-support) |
| **Yizhou Pan** | [Game 11: Craft & Life](#game-11-craft--life) |

<br>

---

<a name="game-1-elemental-grove-defense"></a>
## Game 1: Elemental Grove Defense
**Game Type:** Grid-based Strategy, Tower Defense, Synergy Simulation

</div>

**Game Prototype**
Carrot Fantasy, Genshin Impact

**Game Description**
Set in a "Cyber-Forest" invaded by a "Mechanical Virus." Players plant "Elemental Flora" (Towers) on a grid to stop mechanical bugs from reaching the "Life Tree." Focus is on Placement Strategy and Synergy.

**Added Ideas**
* Adjacency Synergy System: towers function as nodes in a graph with dynamic attack strategy changes.
* Interactive Terrain Modification: destroying "Old Tech Junk" grants currency and alters terrain properties.

<br>

<p align="center">
  <b>Carrot Fantasy (Grid Strategy & UI Inspiration)</b><br>
  <img src="assets/CY_Carrot_Fantasy.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

<p align="center">
  <b>Genshin Impact (Elemental Synergy & Visual Effects)</b><br>
  <img src="assets/CY_Genshin_Impact.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

**Possible Challenges**
1. Complexity of Interaction Rules - managing elemental combination rules.
2. Graph Traversal for Chain Reactions - implementing "Chain Lightning" with optimized recursive search.

---

<div align="center">

<a name="game-2-park-street-survivor"></a>
## Game 2: Park Street Survivor
**Game Type:** Vertical Scrolling Arcade, Survival Resource Management

</div>

**Game Prototype**
* Road Fighter: Vertical scrolling and obstacle avoidance.
* Crossy Road: Grid-based movement and voxel/pixel aesthetic.

**Game Description**
* A satirical survival game simulating the daily struggle of a UoB student trying to reach the Merchant Venturers Building before a 9 AM lecture. (Could be any building -> Multiple maps)
* The game features an infinitely scrolling map of Park Street (a steep hill). The player must navigate through traffic and pedestrians while managing three dynamic stats: Stamina, Mood, and Time.
* The Goal: Survive the climb and reach the top before running out of stats.
* The Struggle: The screen constantly scrolls downwards. If the player is too slow (stopped by obstacles or interactions) and falls off the bottom of the screen, they are "Late" (Game Over).
* The Obstacles: Players must dodge speeding First Buses, erratic Voi Scooters, and slow-walking tourists.
* The Choices: Players encounter random events like a homeless person asking for change or a Tesco offering a Meal Deal. They must decide: risk stopping to interact (restoring Mood/Stamina but losing time).

**Added Ideas**
1. Risk-Reward Interaction Mechanic: Unlike standard arcade games, interacting with shops (Tesco) or NPCs requires the player to stand still in a specific zone for 2 seconds while the screen continues to scroll.
2. Dynamic Weather Physics: The game implements a variable physics engine. When the weather changes to "Bristol Rain", the friction coefficient decreases, causing the player character to slide (inertia) after moving. In "Heavy Rain", visibility is reduced.
3. The "Bristol Item" System: Players can pick up items that change gameplay mechanics using the Strategy Pattern:
    * Voi Scooter: Increases speed by 200% but disables braking (high risk).
    * Broken Umbrella: Provides immunity to "Rain" physics but breaks after 3 hits.
    * Noise-Cancelling Headphones: Automatically ignores negative social events (Promoters/Homeless) but blocks positive audio cues (Car horns).

<br>

<p align="center">
  <b>Road Fighter (Vertical Scrolling & Obstacle Avoidance)</b><br>
  <img src="assets/CY_Road_Fighter.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

<p align="center">
  <b>Crossy Road (Voxel Aesthetic & Grid-based Movement)</b><br>
  <img src="assets/CY_Crossy_Road.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

**Possible Challenges**
1. Complex State Management: Balancing the player's three stats (Stamina/Mood/Time) alongside the "Hold-to-Interact" logic requires a sophisticated Finite State Machine (FSM).
2. UI/UX in Canvas Environment: Creating a responsive HUD for stats and floating interaction bars requires writing a custom UI Manager class from scratch.

**Links**
* [Road Fighter (Retro Games)](https://www.retrogames.cz/play_065-NES.php)
* [Crossy Road Official](https://crossy-road.io/cross-road)

---

<div align="center">

<a name="game-3-balatro"></a>
## Game 3: Balatro (Tarot Edition)
**Game Type:** Roguelike Card Game

</div>

**Game Prototype**
Balatro

**Game Description**
A roguelike game based on playing cards. 
* Main mechanics: Players play poker hands to earn points; clearing the stage once the target is reached.
* Progression: Three rounds make up a major stage.
* Economy: Use reward coins to buy buffs (Jester cards) at the end of each round.

**Additional Ideas**
* Re-skin using Tarot cards with elemental suits (Wands, Cups, Coins, Swords).
* Element effects: Pair of Cups + Coins doubles points; Wands + Cups halves them.
* Major Arcana cards replace Jester cards (e.g., The Tower grants double points for the next Earth card).
* Reduce rounds per run to 3–6.

<br>

<p align="center">
  <b>Game Start Interface</b><br>
  <img src="assets/LZ_Balatro_Start.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

<p align="center">
  <b>Gameplay Interface</b><br>
  <img src="assets/LZ_Balatro_Round_Start.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" /><br>
  <img src="assets/LZ_Balatro_In_Game.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

<p align="center">
  <b>Scoring Display</b><br>
  <img src="assets/LZ_Balatro_Score.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

<p align="center">
  <b>Shop Page</b><br>
  <img src="assets/LZ_Balatro_Shop.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

**Possible Challenges**
1. Hand score algorithm with element reactions.
2. Backend state tracking for deck and scoring.
3. Managing random shop and hand order.

**Links**
* [Balatro on Steam](https://store.steampowered.com/app/2379780/Balatro/)
* [Balatro Gameplay Video](https://youtu.be/2n9pkiuSZLU)

---

<div align="center">

<a name="game-4-pico-park"></a>
## Game 4: Pico Park
**Game Type:** Cooperative Puzzle-Platformer

</div>

**Game Prototype**
Pico Park

**Game Description**
A multiplayer cooperative jumping/platforming game with synchronization-based mechanisms.

**Additional Ideas**
* Unique character abilities: jumping farther, pushing blocks, creating temporary steps.

<br>

<p align="center">
  <b>Start Page (Multiplayer Lobby)</b><br>
  <img src="assets/LZ_Pico_Park_Start.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

<p align="center">
  <b>Gameplay Interface (Level Mechanisms)</b><br>
  <img src="assets/LZ_Pico_Park_In_Game_1.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" /><br>
  <img src="assets/LZ_Pico_Park_In_Game_2.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" /><br>
  <img src="assets/LZ_Pico_Park_In_Game_3.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

**Possible Challenges**
1. Input synchronization for multiple players and physics collisions.
2. Designing modular interactive level elements (switches, platforms).

**Links**
* [Pico Park Official](https://picoparkgame.com/pp1/)

---

<div align="center">

<a name="game-5-flappy-bird"></a>
## Game 5: Flappy Bird (360° Edition)
**Game Type:** Arcade

</div>

**Game Prototype**
Flappy Bird

**Game Description**
Standard bird navigation through horizontal gaps.

**Added Ideas**
* Introduces 360-degree freedom. Players control movement on both X and Y axes with sophisticated acceleration.

<br>

<p align="center">
  <b>Flappy Bird Screenshot (Core Loop Inspiration)</b><br>
  <img src="assets/RW_Flappy_Bird.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

**Possible Challenges**
1. Camera System and coordinate transformation.
2. Modularity in scoring.

---

<div align="center">

<a name="game-6-super-mario-bros"></a>
## Game 6: Super Mario Bros
**Game Type:** 2D Platformer

</div>

**Game Prototype**
Super Mario Bros

**Game Description**
Iconic platforming: leap, collect, stomp, and reach the finish.

<br>

<p align="center">
  <b>Super Mario Bros - Level Design</b><br>
  <img src="assets/RW_Super_Mario_Bros_1.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

<p align="center">
  <b>Super Mario Bros - Gameplay Mechanics</b><br>
  <img src="assets/RW_Super_Mario_Bros_2.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

---

<div align="center">

<a name="game-7-tableturf-battle"></a>
## Game 7: Tableturf Battle
**Game Type:** Turn-based Strategy, Puzzle, Deck-building

</div>

**Game Prototype**
Tableturf Battle (from Splatoon 3)

**Game Description**
Grid competition to fill areas with Tetris-shaped blocks connecting to existing color.

<br>

<p align="center">
  <b>Tableturf Battle Screenshot (Grid Strategy)</b><br>
  <img src="assets/RW_Tableturf_Battle.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

**Possible Challenges**
1. Intelligent AI Opponent.
2. Complex boundary decision graph algorithms.

**Links**
* [Tableturf Battle Gameplay](https://www.youtube.com/watch?v=a3UmoODEjis)

---

<div align="center">

<a name="game-8-tower-at-the-end"></a>
## Game 8: Tower at the End
**Game Type:** 2D Cooperative Puzzle Adventure

</div>

**Game Prototype**
Fireboy and Watergirl, FEZ

**Core Gameplay**
* Asymmetric Cooperation: paths or objects only accessible by one player.
* Mechanic-Based Level Design: Gravity inversion, visibility toggles, temporal switches.

**Added Ideas**
* Rule-Switching Tower: each level is a rule experiment.
* Emotional Storytelling: ruins, lighting, and sound narrative.

<br>

<p align="center">
  <b>Fireboy and Watergirl (Asymmetric Cooperation Reference)</b><br>
  <img src="assets/LP_Fireboy_and_Watergirl.jpg" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

<p align="center">
  <b>FEZ (World Perception & Mechanic Shift Reference)</b><br>
  <img src="assets/LP_FEZ.jpg" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

**Possible Challenges**
1. Rule State Management and clean transitions.
2. Logically consistent two-player synchronization.

**Links**
* [Fireboy and Watergirl](https://fireboyandwatergirl.run/)
* [FEZ Gameplay](https://www.youtube.com/watch?v=JkEKAi2jaaE)

---

<div align="center">

<a name="game-9-the-strongest-support"></a>
## Game 9: The Strongest Support
**Game Type:** 2D Strategy, Indirect Control

</div>

**Game Prototype**
Monolith, Lemmings

**Core Gameplay**
* Indirect Control: Player controls a support monster to protect an AI-driven hero NPC.
* Periodic Skill Activation: Fixed-cycle skills where positioning determines agency.
* AI hero moves autonomously; player protects from incoming threats.

**Added Ideas**
* Indirect-Control Strategy Loop for planning and spatial reasoning.
* Character-as-Mechanic: each monster is a living game mechanic.

<br>

<p align="center">
  <b>Monolith (Pixel-art Style Reference)</b><br>
  <img src="assets/LP_Monolith.jpg" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

<p align="center">
  <b>Lemmings (Indirect Control Reference)</b><br>
  <img src="assets/LP_Lemmings.jpg" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

**Possible Challenges**
1. AI Behaviour Coordination for hero and enemies.
2. Timed Skill state management.

**Links**
* [Monolith Demo](https://team-d-13.itch.io/monolithdemo)
* [Lemmings Gameplay](https://www.youtube.com/watch?v=OjUYW1WBWFI)

---

<div align="center">

<a name="game-11-craft--life"></a>
## Game 11: Craft & Life
**Game Type:** Sandbox / Life Simulation

</div>

**Game Prototype**
Minecraft, Stardew Valley

**Game Description**
Open-world voxel building with structured farming and social interaction.

**Added Ideas**
* World Memory System: persistent evolving history based on player actions.
* Behavior-Based Identity: NPC attitudes adapt to the player's lifestyle choice.

<br>

<p align="center">
  <b>Minecraft (Voxel Building Reference)</b><br>
  <img src="assets/YP_Minecraft.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

<p align="center">
  <b>Stardew Valley (Farming & Social Reference)</b><br>
  <img src="assets/YP_Stardew_Valley.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

**Possible Challenges**
1. Persistent world management and damage archive.
2. Voxel world performance under heavy modification.

**Links**
* [Minecraft Official](https://www.minecraft.net/)
* [Stardew Valley Official](https://www.stardewvalley.net/)

---

<div align="center">

[Back to Project Home](../../../README.md)

</div>
