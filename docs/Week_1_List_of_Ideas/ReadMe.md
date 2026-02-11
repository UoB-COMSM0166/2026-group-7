## Catalog
- [Game 1: Balatro](#game-1-balatro)
- [Game 2: Craft & Life](#game-2-craft--life)
- [Game 3: Elemental Grove Defense](#game-3-elemental-grove-defense)
- [Game 4: Flappy Bird](#game-4-flappy-bird)
- [Game 5: Park Street Survivor](#game-5-park-street-survivor)
- [Game 6: Pico Park](#game-6-pico-park)
- [Game 7: Plants vs. Zombies](#game-7-plants-vs-zombies)
- [Game 8: Super Mario Bros](#game-8-super-mario-bros)
- [Game 9: Tableturf Battle](#game-9-tableturf-battle)
- [Game 10: The Strongest Support](#game-10-the-strongest-support)
- [Game 11: Tower at the End](#game-11-tower-at-the-end)

# Game 1: Balatro
## Game Type
Roguelike Card Game
## Game Prototype
Balatro
## **Game Description**
A roguelike game based on playing cards.

Main mechanics:

- Players play different card combinations based on poker hands (pair, high card, flush, straight, etc.) to earn points; when points reach the required amount, the stage is cleared.
- Three rounds make up a major stage. At the end of a major stage there is an extra reward.
- At the end of each round, use the round reward coins to buy buffs (i.e., jester cards). For example: increase the points earned by a specific hand type, or increase points when even-numbered cards a[...]
  
## **Additional Ideas**
- Re-skin the game and reduce the number of cards by replacing the standard deck with tarot cards.
- Use the Minor Arcana for regular hands; replace the four suits with four elements: Wands, Cups, Coins (Pentacles), and Swords.
  - Element effects: when Cups and Coins both form a pair, points are doubled; when Wands and Cups are both played together, points are halved.
- Use Major Arcana cards (e.g., The Fool, The Tower, Judgment) to replace the in-game jester-card buffs. Example: The Tower card’s effect — after playing two Water cards, the next Earth card playe[...]
- Reduce the number of rounds per run to 3–6.

## Screenshots
Game start interface
<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/2ef86a1e-764a-4515-b734-1b1dda480347" />
gameplay interface
<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/7bb34da8-5178-4cfc-835b-3960b4d94b9a" />
scoring display
<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/6d312c57-a531-4d24-8b05-a4ddb1c824da" />
shop page
<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/1d6de465-3125-4779-9fb5-a5f33eb5c5b5" />

## Possible Challenges
1. Hand score algorithm - detecting card combinations and calculating scores with element reactions
2. Backend state tracking - tracking remaining deck, hand count, scores, and target scores
3. Random strategy - managing random hand order and shop card refresh order

## Links
- https://store.steampowered.com/app/2379780/Balatro/
- https://youtu.be/2n9pkiuSZLU

---

# Game 2: Craft & Life
## Game Type
Sandbox / Open-World, Life Simulation, Farming & Crafting, Light Survival
## Game Prototype
- minecraft (Sandbox / Survival)
  - 3D voxel-based open world
  - First-person and third-person camera modes
  - Crafting System: Tools, furniture, machines, and upgrades
  - Life System: Day–night cycle, seasons, weather
- stardewvalley (Life Simulation / Farming)
  - Farming System: Soil preparation, seasonal crops, animal care
  - Building System: Free-form block building and interior decoration
  - Social System: NPC dialogue, gifting, relationship progression
## Game Description
- Craft & Life is an open-world sandbox life simulation game that blends the creative freedom of voxel-based building with the warmth and structure of a farming and social simulation.

- Players begin a new life in this game, a procedurally generated 3D world where every block can be shaped and transformed. Players are free to build their own home, cultivate farmland, explore caves,[...]

- The game encourages players to balance creativity, productivity, and relationships. Seasonal changes affect crops, events, and NPC behavior, while progression systems unlock new tools, buildings and[...]

**Added Ideas**
- World Memory System
The game world remembers significant player actions over time. Locations gain historical meaning, environments change permanently, and NPCs react to past events, creating a persistent and evolving wor[...]

- Behavior-Based Player Identity
Instead of choosing a predefined role or class, the player’s identity is formed dynamically through gameplay behavior. NPC attitudes, dialogue, and story outcomes adapt based on how the player lives[...]

## Screenshots
Minecraft screenshot
<img width="1538" height="812" alt="image" src="https://github.com/user-attachments/assets/99138510-4500-4f96-a9f1-ca22c32d8ae1" />
Stardew Valley screenshot
<img width="1192" height="704" alt="image" src="https://github.com/user-attachments/assets/c34a374c-0761-4fc2-986c-73c63811ab68" />

## Possible Challenges
- Accidentally causing damage to the environment may affect subsequent development, and an archive function can be established to address this issue.

- A behavior-based identity system may lead to unexpected interpretations of player intent, potentially reducing players’ sense of control over their in-game identity.

- Persistent world memory and evolving environments increase technical complexity and may impact performance, especially in large, heavily modified worlds.

## Links
- https://www.minecraft.net/
- https://www.stardewvalley.net/

---

# Game 3: Elemental Grove Defense
## Game Type
Grid-based Strategy, Tower Defense, Synergy Simulation
## Game Prototype
Carrot Fantasy, Genshin Impact
## Game Description
Set in a "Cyber-Forest" invaded by a "Mechanical Virus." Players plant "Elemental Flora" (Towers) on a grid to stop mechanical bugs from reaching the "Life Tree." Focus is on Placement Strategy and Sy[...]

## **Added Ideas**
- Adjacency Synergy System: towers function as nodes in a graph with dynamic attack strategy changes
- Interactive Terrain Modification: destroying "Old Tech Junk" grants currency and alters terrain properties

## Screenshots
Carrot Fantasy, Genshin Impact screenshots (images referenced in original)

## Possible Challenges
1. Complexity of Interaction Rules - managing elemental combination rules
2. Graph Traversal for Chain Reactions - implementing "Chain Lightning" with optimized recursive search


---

# Game 4: Flappy Bird
## Game Type
Arcade
## Game Prototype
Flappy Bird
## Game Description
Players control a bird that moves vertically along the screen's axis, navigating through gaps between trees that scroll horizontally.

## **Added Ideas**
Unlike the linear, one-hit-death mechanic of the original Flappy Bird, our game introduces 360-degree freedom. The player controls a bird that can move on both X and Y axes with a sophisticated accele[...]

## Screenshots
Flappy Bird screenshot
<img width="650" height="365" alt="image" src="https://github.com/user-attachments/assets/74773eac-3998-42cf-a61a-66f4c2d556c7" />


## Possible Challenges
1. Camera System and Coordinate Transformation
2. Modularity in Scoring and Level Evaluation

---

# Game 5: Park Street Survivor
## Game Type
Vertical Scrolling Arcade, Survival Resource Management
## Game Prototype
- Road Fighter: Vertical scrolling and obstacle avoidance
- Crossy Road: Grid-based movement and voxel/pixel aesthetic
## Game Description
- A satirical survival game simulating the daily struggle of a UoB student trying to reach the Merchant Venturers Building before a 9 AM lecture.(Could be any building ->Multiple maps)

- The game features an infinitely scrolling map of Park Street (a steep hill). The player must navigate through traffic and pedestrians while managing three dynamic stats: Stamina, Mood, and Time.

- The Goal: Survive the climb and reach the top before running out of stats.

- The Struggle: The screen constantly scrolls downwards. If the player is too slow (stopped by obstacles or interactions) and falls off the bottom of the screen, they are "Late" (Game Over).

- The Obstacles: Players must dodge speeding First Buses, erratic Voi Scooters, and slow-walking tourists.

- The Choices: Players encounter random events like a homeless person asking for change or a Tesco offering a Meal Deal. They must decide: risk stopping to interact (restoring Mood/Stamina but losing [...]

## **Added Ideas**
1. Risk-Reward Interaction Mechanic
- Unlike standard arcade games, interacting with shops (Tesco) or NPCs requires the player to stand still in a specific zone for 2 seconds while the screen continues to scroll.
2. Dynamic Weather Physics
- The game implements a variable physics engine. When the weather changes to "Bristol Rain", the friction coefficient decreases, causing the player character to slide (inertia) after moving. In "Heavy[...]
3. The "Bristol Item" System

- Players can pick up items that change gameplay mechanics using the Strategy Pattern:

  - Voi Scooter: Increases speed by 200% but disables braking (high risk).

  - Broken Umbrella: Provides immunity to "Rain" physics but breaks after 3 hits.

  - Noise-Cancelling Headphones: Automatically ignores negative social events (Promoters/Homeless) but blocks positive audio cues (Car horns).

## Screenshots
Road Fighter (NES)
<img width="970" height="770" alt="image" src="https://github.com/user-attachments/assets/95e15f57-3c0f-4b75-b591-b61719f4d6ed" />

Crossy Road screenshots
<img width="1918" height="1186" alt="image" src="https://github.com/user-attachments/assets/67d5dca1-1978-4dc8-a356-9cce45c4e71f" />

## Possible Challenges
1. Complex State Management
   - Balancing the player's three stats (Stamina/Mood/Time) alongside the "Hold-to-Interact" logic requires a sophisticated Finite State Machine (FSM). Handling the transition between Running, Sliding[...]
2. UI/UX in Canvas Environment
   - Since p5.js lacks native UI components, creating a responsive HUD (Heads-up Display) for stats and floating interaction bars (e.g., "Buying... 50%") requires writing a custom UI Manager class fro[...]

## Links
- https://www.retrogames.cz/play_065-NES.php
- https://crossy-road.io/cross-road

---

# Game 6: Pico Park
## Game Type
Cooperative Puzzle-Platformer
## Game Prototype
Pico Park
## **Game Description**
A multiplayer cooperative clearance game. Similar to Fireboy and Watergirl but a simpler version — primarily a jumping/platforming game with a few mechanisms.

## **Additional Idea**
Add character abilities: each player’s chosen character has a different ability, such as jumping farther, being able to push blocks, creating temporary steps, etc.

## Screenshots:
Start page
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/ba64cb78-f5f4-433e-9adc-d19d24cabbf2" />
gameplay pages
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/8835aabb-dcb6-4e66-bf5b-7d9e705ef243" />

## Possible Challenges:
1. Input synchronization in multiplayer
   - Must handle simultaneous keyboard inputs from multiple players, interactions between players (e.g., one player standing on another’s head, a player pushing a block), and collisions between char[...]

2. Level system
   - Design interactive level elements such as moving jumping platforms, interactive switches, doors, and pushable boxes.

## Links:
- https://picoparkgame.com/pp1/

---

# Game 7: Plants vs. Zombies
## Game Type
Tower Defense / Strategy / Casual Puzzle Game
## Game Prototype
Plants vs. Zombies
## Game Description
Grid-based lane defense where players place plants to repel zombies. Core loop: collect sunlight, place plants, repel zombies, adapt strategy, survive waves.

**Added Ideas - Icefield Mode**
- Polar Day/Night Cycle with different resource and temperature rules
- Polar Day: frequent sunlight, 20% increased production
- Polar Night: scarce sunlight, frozen roads increase zombie speed, random snow falls (slows zombies, energizes plants hit by snow)
- Aurora Event: Green aurora empowers plants, Pink aurora empowers zombies
- Blizzard Event: reduces visibility on random tiles
- New Plants: Frost Pine (produces Ice Crystal Sunlight, briefly freezes zombies), Glacier Prism Shooter (light beam peas with Polar Day refraction), Aurora Spike Vine (continuous pierce with Aurora M[...]
- New Zombies: Studded Sled Zombie (accelerates on ice), Aurora Beacon Carrier (disrupts lighting plants)

## Screenshots
Plants vs. Zombies screenshot
<img width="2048" height="1536" alt="image" src="https://github.com/user-attachments/assets/9684feb0-771a-4f70-8ab7-0bcb1242abf3" />


## Possible Challenges
Possible Challenges
System Design Challenges：Multi-System Coupling and Exponential Design Complexity
Challenge： Day–night cycles, terrain states, visibility, plants, and zombies do not function independently; instead, they interact with and modify each other.

Examples: Polar Night → reduced visibility → reliance on lighting plants Lighting plants → countered by aurora-based zombies Frozen terrain → destroyed by heavy stomping zombies

Risks： Difficult to predict whether all mechanic combinations are solvable High risk of “unsolvable levels” or a single dominant optimal strategy Mitigation Strategies Use an Interaction Matrix [...]

Implementation Challenges：Complex State Systems and Code Architecture
Challenge： A single unit may simultaneously be affected by: Day/Night state Freeze/Melt state Visibility modifiers Buffs and debuffs

Risks： State conflicts and unclear priority handling Bugs that are difficult to reproduce and debug

Mitigation Strategies： Adopt a state-driven architecture (e.g., State Machines or ECS) Make all states visualized and debuggable Define clear state priorities (e.g., Terrain > Time > Unit State)

## Links
- https://www.ea.com/games/plants-vs-zombies

---

# Game 8: Super Mario Bros
## Game Type
2D Platformer
## Game Prototype
Super Mario Bros
## Game Description
Players leap between platforms, collect items, stomp on enemies, and reach the finish line.

## Screenshots:
Super Mario Bros screenshots
<img width="900" height="501" alt="image" src="https://github.com/user-attachments/assets/f634249a-8634-450f-8296-dfb466315bb7" />
<img width="900" height="501" alt="image" src="https://github.com/user-attachments/assets/8e54ad21-5f06-4184-a695-a5ad19f8faeb" />

---

# Game 9: Tableturf Battle
## Game Type: Turn-based Strategy / Puzzle / Deck-building
## Game Prototype: Tableturf Battle (from Splatoon 3)
## Game Description:
On a grid map, both sides compete to fill areas with color by placing blocks of different shapes (similar to Tetris). Each block must connect to existing areas of their own color. The player controlli[...]

## Screenshots:
Tableturf Battle screenshot
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d2d16a91-65a3-4a63-a802-c2b8ad0fac7b" />


## Possible Challenges:
1. Intelligent AI Opponent
2. Complex decision rules including boundary conditions, requiring extensive graph algorithms

## Links:
- https://www.youtube.com/watch?v=a3UmoODEjis

---

# Game 10: The Strongest Support
## Game Type
2D Strategy Puzzle Adventure, Indirect Control & AI-Driven Gameplay
## Game Prototype
- **Monolith**: Pixel-art action shooting game with Roguelike elements and periodically automatic skill release.
- **Lemmings**: Indirect player control, problem-solving through positioning rather than direct action, and failure as part of learning.
## Core Gameplay
- **Indirect Player Control:** The player does not control the main attacking character. Instead, the player controls a supporting monster entity whose goal is to protect a hero NPC from incoming thre[...]
- **Periodic Skill-Based Interaction:** Each level assigns the player a different monster, each with a unique skill that activates automatically on a fixed cycle (e.g. every few seconds). Player agenc[...]
- **AI-Driven Environment:** The hero NPC autonomously moves and attacks enemies using a simple AI system. Other enemy entities actively target the hero. The player must use their monster’s skill ef[...]
- **Clear Win/Lose Conditions:**
  - Win: The hero survives long enough to eliminate all enemies in the level.
  - Lose: The hero’s health reaches zero.
## **Added Ideas**
- **Indirect-Control Strategy Loop**: encourages planning, prediction, and spatial reasoning
- **Character-as-Mechanic Design:** each monster is a living game mechanic

## Screenshots
Monolith screenshot
<img width="1024" height="768" alt="image" src="https://github.com/user-attachments/assets/2eb57b35-ea9b-4cbc-8596-6e669ce115d8" />
Lemmings screenshot (images referenced in original)
<img width="466" height="630" alt="image" src="https://github.com/user-attachments/assets/5553f9ee-da0b-4ab5-bd42-f49b2cfb7c80" />

## Possible Challenges
1. AI Behaviour Coordination - designing AI for hero, enemies, and player-controlled monster
2. Timed Skill and State Management - implementing periodic skill activation with reliable timing system

## Links
- https://team-d-13.itch.io/monolithdemo
- https://www.youtube.com/watch?v=OjUYW1WBWFI

---

# Game 11: Tower at the End
## Game Type
2D Cooperative Puzzle Adventure, Mechanic-driven Level Progression
## Game Prototype
- Fireboy and Watergirl: Mandatory two-player cooperation, Asymmetric character abilities, and Precision-based environmental puzzles.
- FEZ: Mechanic-based world perception changes, Puzzle design driven by rule shifts rather than enemies.
## Core Gameplay
- **Exploration & Puzzle Solving**: Players explore compact but dense levels filled with interactive elements such as switches, platforms, and environmental hazards.
- **Asymmetric Cooperation**: Develop relationships with townsfolk, attend festivals, and explore character-driven storylines.
- **Exploration and Adventure**: Each character has unique interaction constraints (similar to Fireboy & Watergirl). Some paths or objects can only be accessed by one player, requiring constant teamwo[...]
- **Mechanic-Based Level Design**: each level introduces one core rule change, such as:
  - Gravity inversion zones
  - Object visibility toggled by position
  - Platforms that exist only for one player
  - Temporal switches that affect the other character
  - Mechanics are cumulative but controlled to avoid overwhelming players.

## **Added Ideas**
- Rule-Switching Tower Structure: each level is a self-contained rule experiment
- Emotional Environmental Storytelling: world tells its story through ruins, lighting, sound, and silence

## Screenshots
Fireboy and Watergirl screenshot
<img width="900" height="506" alt="image" src="https://github.com/user-attachments/assets/7da1ddaf-39b6-491a-b112-15059576c545" />
FEZ screenshot
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/a51d045b-376b-48a6-a294-f2e2084cfafe" />

## Possible Challenges
1. Rule State Management - managing different rule sets per level with clean transitions between mechanics
2. Two-Player Synchronization - keeping both players' interactions logically consistent

## Links
- https://fireboyandwatergirl.run/
- https://www.youtube.com/watch?v=JkEKAi2jaaE
