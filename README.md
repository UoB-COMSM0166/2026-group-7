<div align="center">

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

# Park Street Survivor

<p>
  <img src="https://img.shields.io/badge/Language-JavaScript-b8c1ec?style=for-the-badge&logo=javascript&logoColor=white" />
  <img src="https://img.shields.io/badge/Library-p5.js-eebbc3?style=for-the-badge&logo=p5.js&logoColor=ed538b" />
  <img src="https://img.shields.io/badge/Host-GitHub_Pages-b8c1ec?style=for-the-badge&logo=github&logoColor=white" />

<br>

<img src="ArtAsset/ReadMe/game_screenshot.png" width="860" style="border-radius: 16px; border: 3px solid #b8c1ec;" alt="Park Street Survivor – Game Screenshot" />

<br><br>

> *"Sprint through the fragmented memories of a Bristol CS graduate: A 5-day surrealist journey on Park Street where every gift from the past shapes your ultimate choice — to wake up or to fade away."*

<br>

<div align="center">

[![Project Site](https://img.shields.io/badge/Project%20Site-eebbc3?style=for-the-badge&logoColor=white)](https://charlotteyu-47.github.io/2026-group-7/)
[![Play Game](https://img.shields.io/badge/Play%20Game-7c3aed?style=for-the-badge&logoColor=white)](https://charlotteyu-47.github.io/2026-group-7/pss/)

</div>

<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

</div>

<br>

<a name="group-members"></a>
<h2 align="center">Group Members</h2>

<div align="center">

<br><br>

| Role | Name | Email |
|:---:|:---:|:---:|
| **Core Mechanism Designer， Scripts Designer** | Charlotte Yu | fe22207@bristol.ac.uk |
| **Aesthetic Designer， Scripts Designer** | Lucca Zhou | pn25381@bristol.ac.uk |
| **Level Designer， Scripts Designer** | Ray Wang | nz25771@bristol.ac.uk |
| **UI/UX & Audio Designer， Scripts Designer** | Layla Pei | jj25661@bristol.ac.uk |

</div>

<br>

![IMG_9689](https://github.com/user-attachments/assets/3219434e-c07f-4291-9e6a-5471b14c9cfa)

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="table-of-contents"></a>
<h2 align="center">Table of Contents</h2>

<div align="center">

| # | Section | Description |
|:---:|:---:|:---|
| 00 | [Labs](#labs) | Weekly lab tasks & documentation |
| 01 | [Introduction](#introduction) | Game overview & what makes it novel |
| 02 | [Requirements](#requirements) | Ideation, use cases & user stories |
| 03 | [Design](#design) | System architecture & class diagrams |
| 04 | [Implementation](#implementation) | Key technical challenges |
| 05 | [Evaluation](#evaluation) | Qualitative & quantitative testing |
| 06 | [Process](#process) | Team workflow & reflection |
| 07 | [Evaluation](#conclusion) | Lessons learnt & future work |
| 08 | [Contribution](#contribution) | Individual contributions |

</div>

<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="labs"></a>
<h2 align="center">Labs</h2>

<div align="center">

| Week | Title | Documentation |
|:---:|:---|:---:|
| 01 | **Lab 1: List of Game Ideas** | [📂 ReadMe](./docs/Labs/Week_1_List_of_Ideas/README.md) |
| 02 | **Lab 2: Paint System & Game Brainstorming** | [📂 ReadMe](./docs/Labs/Week_2_Paint_App/README.md) |
| 07 | **Lab 7: Think Aloud Study & Heuristic Evaluation** | [📂 ReadMe](./docs/Labs/Week_7_Evaluation/README.md) |
| 08 | **Lab 8: NASA Task Load Index & SUS** | [📂 ReadMe](./docs/Labs/Week_8_Evaluation_2/NASATLX&SUS.md) |

</div>

<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="introduction"></a>
<h2 align="center">Introduction</h2>

Our game is a narrative-driven endless runner that combines fast-paced parkour gameplay with interactive storytelling. The core gameplay is inspired by classic mobile runners such as Temple Run and Subway Surfers, where players must continuously avoid obstacles and manage limited resources while moving forward. However, unlike traditional runner games that focus purely on reflex-based challenges, our game integrates a strong narrative layer and light puzzle elements.

The visual style takes inspiration from the warm pixel-art aesthetics of Stardew Valley and the bold UI presentation of Persona 5. On the narrative side, the story structure draws influence from the psychological tension of Shutter Island and the character-driven storytelling of Persona 5.

The key twist of our game is the integration of story progression within the runner mechanics. Each run represents a fragment of the protagonist’s daily routine, and the player gradually uncovers narrative clues while navigating obstacles. This creates a hybrid experience where movement, exploration, and story discovery are tightly connected.

The story takes place during an ordinary week in Bristol. The protagonist, Iris, begins each day just like any other student: packing her backpack, rushing through crowded streets, avoiding traffic, and trying to reach class before the bell rings. Along the way, she encounters familiar faces, unexpected events, and fragments of hidden stories.

What initially appears to be a normal routine slowly becomes something more mysterious. As the week unfolds, Iris begins to notice that each day may not be as ordinary as it seems. What stories will she uncover, and what choices will she ultimately make?

<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="requirements"></a>
<h2 align="center">Requirements</h2>

<p align="center"><i>15% &nbsp;·&nbsp; ~750 words</i></p>

Early stages design. Ideation process. How did you decide as a team what to develop? Use case diagrams, user stories.<br>
**2.1 Early Design and Ideation**<br>

At the beginning of the project, each team member proposed several potential game concepts, including Park Street Survivor, Pico Park, Plants vs Zombies, Tableturf Battle, and The Strongest Support. To evaluate these ideas systematically, the team developed a scoring table that assessed each proposal according to four criteria: creativity, implementation difficulty, gameplay interest, and extensibility. After several rounds of discussion and voting, Park Street Survivor (PSS) was selected as the final concept. Compared with the other proposals, PSS achieved higher scores in originality and long-term expandability, as it represented a completely original game idea rather than a direct adaptation of an existing title.

In addition to the scoring results, practical constraints such as development time, technical feasibility, and the team’s programming experience were also considered during the decision process. A runner-style game was viewed as a manageable structure that allows clear gameplay loops while still providing opportunities for creative design.

The high-level design goal of the project was to create an original game that reflects everyday experiences such as commuting to school or work. The game aims to provide short, low-pressure play sessions that can entertain players during brief breaks, while gradually introducing narrative elements that encourage reflection beyond the immediate gameplay.

After the core concept was established, the team began analysing system requirements by identifying stakeholders and refining gameplay features into epics and user stories.

todo:
- Stakeholers(onion model)
- Epics
- Functional requirements
- Non-function requirements
- User Stories
- Use case diagram


<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="design"></a>
<h2 align="center">Design</h2>

<p align="center"><i>15% &nbsp;·&nbsp; ~750 words</i></p>

System architecture. Class diagrams, behavioural diagrams.

<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="implementation"></a>
<h2 align="center">Implementation</h2>

<p align="center"><i>15% &nbsp;·&nbsp; ~750 words</i></p>

### Challenge 1: Complex State Management & Non-blocking Persistence

**Problem Context:** The game engine must seamlessly transition between 19 heterogeneous scene states (e.g., menus, gameplay runs, dialogues) within a strict 60 FPS render loop. This introduced three critical engineering bottlenecks:

1. State transitions are prone to leaving cross-scene UI or audio side-effect bleeding.
2. Transient data (e.g., equipped utility items) is easily lost upon a run failure and restart.
3. Frequent synchronous calls to `localStorage` for data synchronisation block the main thread, resulting in severe frame drops (jank) during gameplay.

**Solutions & Implementation Examples:**

1. **Centralised Routing & State Caching (Centralised FSM):** We orchestrated all system side-effects (e.g., BGM toggling, UI visibility) centrally within `GameState.setState()`, replacing scattered state handling across individual Scene classes.

   - *Example:* When handling the pause functionality, the engine writes the current state to `this.previousState` *only* upon entering `STATE_PAUSED`. The render layer reads this cached state ID to determine which scene context to draw beneath the pause overlay, eliminating the corruption caused by stacked pause states.

   <div align="center"><img src="docs/assets/implementation/1.3.1.gif" width="700" alt="Pausing from the Room scene — the Room background is preserved beneath the pause overlay and restored on resume" /><br><sub>Pausing from the Room scene preserves Room context</sub></div>
   <div align="center"><img src="docs/assets/implementation/1.3.2.gif" width="700" alt="Pausing from the gameplay run — the runner background is preserved beneath the pause overlay and restored on resume" /><br><sub>Pausing from the run scene preserves run context</sub></div>

2. **Cross-scene In-memory Payload:** We designed a lightweight payload mechanism to allow transient data to bypass strict lifecycle boundaries.

   - *Example:* Transient data (e.g., the player's equipped utility item: name, charges, armed state) is snapshotted via `saveRunUtilityItemSnapshot()` on the `GameState` instance before a run begins. On restart, the system deliberately bypasses `clearRunUtilityItemSnapshot()`, allowing item state to persist across run failures without re-entering the room scene.

3. **Non-blocking Auto-save & Atomic Restore:** We embedded `SaveSystem.tick()` directly into the `draw()` loop, utilising timestamps to implement a 3000ms in-frame debounce. This guarantees zero frame drops during background data persistence.

   - *Example:* When loading a save file, `applyAndResume()` enforces a strict two-phase atomic restore: it mandates fully writing all global variables before invoking `setupRun()` to initialise the scene. Executed within the `triggerTransition()` fade-to-black callback, this perfectly circumvents any intermediate-state rendering glitches caused by incompletely loaded data.

---

### Challenge 2: Node-based Narrative Engine & Dynamic Logic Injection

**Problem Context:** Hardcoding narrative scripts, UI rendering, and state transitions tightly together inevitably leads to severe logical coupling. The narrative engine requires "state-aware" capabilities (e.g., dispensing utility items or triggering specific endings at exact dialogue nodes) and must support agile branch modifications. Furthermore, it is critical to eliminate the performance overhead caused by redundant node parsing within the high-frequency render loop.

**Solutions & Implementation Examples:**

1. **Strict MVC Decoupling:** We completely separated the presentation logic from the script content, forming the foundational architecture of the narrative system and ensuring the engine remains agnostic to the data.

   - *Example:* `dialogue_data.js` (Model) purely declares text and identifiers; `Cutscene.js` (Engine) polls node IDs frame-by-frame; and `DialogueBox` (View) strictly receives parsed parameters to execute the typewriter rendering.

2. **Two-level Stateless Logic Injection:** To prevent circular dependencies, the data layer strictly holds no references to the engine. Instead, it implements a tiered injection system based on the weight of the side-effects.

   - *Example:* For **lightweight Event injection** (e.g., `event: "showcase"`), the data layer purely declares intent; the engine internally takes over the state machine and automatically advances the node. For **heavyweight Action injection** (e.g., triggering an ending via `action: "good_ending"`), the engine constructs a string-to-closure hydration layer via `_resolveNodeAction()`. This enforces lazy binding, instantiating the callback strictly when the player actively clicks the option, keeping the data layer fully serialisable and engine-agnostic: a closure can only exist in a loaded runtime, but a string can be stored, diffed, and version-controlled.

   <div align="center"><img src="docs/assets/implementation/2.2.1.gif" width="700" alt="A dialogue node triggers the item showcase animation — the utility item fades in at centre screen, then a received toast slides in from the corner" /><br><sub>event: "showcase" fires the item showcase pipeline, followed by the item-received toast</sub></div>

3. **Graph Routing & Dirty Checking:** We utilised a directed graph structure to manage narrative nodes and implemented performance interception within the render loop.

   - *Example:* Nodes are assigned globally unique IDs. Modifying a `next_id` seamlessly reconnects narrative branches, drastically improving the efficiency of iterating the script based on HCI evaluation feedback. Additionally, the engine executes dirty checking in the main `draw()` loop using `_csLastNodeId` (`currentNodeId !== _csLastNodeId`). Content parsing and `DialogueBox` resets are triggered *only* when the node ID genuinely changes. This completely eradicates the performance penalty of redundantly triggering the typewriter animation frame-after-frame.

   <div align="center"><img src="docs/assets/implementation/2.1.1.gif" width="700" alt="Player selects Option 1 at the branch node — the dialogue follows the Option 1 path through its unique sequence of nodes" /><br><sub>Selecting Option 1 — unique branch path via next_id graph traversal</sub></div>
   <div align="center"><img src="docs/assets/implementation/2.1.2.gif" width="700" alt="Player selects Option 2 at the same branch node — the dialogue diverges into a completely different sequence of nodes" /><br><sub>Selecting Option 2 — diverges into a distinct node sequence from the same branch point</sub></div>

---

### Challenge3: Procedural Obstacle Generation and Fairness Control<br>

**Problem Context**

Obstacle generation was one of the most technically demanding systems in the game because it directly influences gameplay fairness, difficulty progression, and player experience. The game features both a finite story-driven mode and an endless mode derived from it. In the story mode, each in-game day must present a distinct difficulty profile while still respecting narrative pacing. Meanwhile, the endless mode extends the same system indefinitely.

Naïve random spawning quickly produced undesirable results: obstacles could overlap spatially, block all safe lanes, or appear in repetitive sequences that made the gameplay feel biased. Conversely, overly restrictive spawning rules reduced unpredictability and created long empty intervals with little challenge. The obstacle generator therefore needed to balance randomness, fairness, and pacing while handling multiple obstacle types with different behaviours (vehicles, NPC hazards, and buffs).

**Engineering Difficulties**

- The first technical challenge involved spatial conflicts during spawning. Pure random placement frequently produced overlapping obstacles or conflicting lane usage, which appeared visually incorrect and sometimes created unavoidable failures.

- A second issue emerged when randomness was constrained too aggressively. While safety checks reduced unfair situations, they also increased the likelihood of repetitive patterns or long empty intervals, making the gameplay feel slow and predictable.

- A further difficulty came from the heterogeneous behaviour of obstacle types. Moving vehicles, static obstacles, and collectible buffs follow different gameplay rules, and the system must ensure that their appearance rates remain balanced across different days and difficulty levels.

**Solution Architecture and Implamentation**

To resolve these issues we developed a multi-stage procedural spawning pipeline coordinated by an ObstacleManager. The system progressively applies constraints and control mechanisms to transform raw randomness into controlled gameplay events.

- The first layer enforces spatial validity. Before confirming a spawn, the system checks lane spacing and bounding box separation, ensuring that obstacles do not overlap and that specific obstacle types only appear in permitted lanes. Mutual exclusion rules further prevent logically conflicting combinations.

- The second layer introduces controlled randomness. Instead of simple random selection, obstacle types are chosen through weighted probabilities combined with diversity penalties that reduce the likelihood of recently spawned types. Certain high-impact hazards also enforce minimum appearance intervals.

- A third layer manages spawn rhythm and difficulty progression. Each level is composed of five predefined difficulty modes arranged in a sequence to form a difficulty curve. Within each mode, symbolic spawn patterns regulate when hazards may appear, preventing both excessive clustering and extended empty periods.

Finally, the system applies runtime fairness validation before committing a spawn. These checks ensure that at least one safe lane remains available and estimate whether the player retains sufficient reaction time based on obstacle speed and scrolling velocity. Buffs are handled through an independent timer-based control system that regulates spawn frequency and provides emergency recovery items when player health becomes critically low.

<div align="center"><img src="docs/assets/implementation/3.1.1.gif" width="700" alt="Parkour clips from Day 5" /><br><sub>Parkour clips from Day 5</sub></div>




<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="evaluation"></a>
<h2 align="center">Evaluation</h2>
<p align="center"><i>15% &nbsp;·&nbsp; ~750 words</i></p>
- One qualitative evaluation (of your choice)
- One quantitative evaluation (of your choice)
- Description of how code was tested

<h3>Qualitative Evaluation: Think Aloud & Heuristic Evaluation</h3> 

We performed a qualitative audit through two primary lenses: a **Think Aloud study** to observe real-time player mental models, and a **Heuristic Evaluation** based on Nielsen’s 10 Principles to identify expert-level UI friction.

<p align="center">
<img width="1022" height="546" alt="image" src="https://github.com/user-attachments/assets/b4db3cbf-3ebc-4c6c-ab17-4cc67bdbc2f0" />
</p>
<p align="center" style="font-size: 0.7rem; color: #777;">
  Heuristic Evaluation form
</p>

**Key Findings:**

- **Semiotic Conflict (Think Aloud):** Participants repeatedly attempted to collide with Ice Cream and Kebab trucks, vocalizing: _"I thought these were shops for health."_ This violation of the "Food = Health" mental model led to unintended penalties.
    
- **Visibility of System Status (Heuristic Evaluation):** Experts flagged the HUD with a severity rating of 3.33. During high-intensity play, users developed "peripheral blindness," missing health updates while focusing on the character.
    
- **Navigation Issues:** Observations showed a "guidance vacuum" where players were unsure of their next objective, leading to stagnation in the room and street phases.
    

**Priority Improvement:** Synthesizing these findings, our primary qualitative goal is an **Integrated Guidance and Feedback Overhaul**.

- **Action Plan:** To resolve semiotic confusion, we are redesigning "Food Truck" hazards with explicit "danger" signifiers, such as flashing lights and darker palettes. To fix the visibility of system status, we implemented a **full-screen red filter** that activates upon taking damage, ensuring feedback is visible even when the player is focused on the character. Furthermore, we have added **yellow exclamation mark (!) icons** to point toward the next goal and integrated **in-game text prompts** and side-screen guidance to ensure the player's path is always clear.

<h3>Quantitative Evaluation: NASA-TLX & SUS</h3>

We conducted a **within-subjects study** with 12 participants to measure the perceived workload between "Easy Mode" and "Hard Mode." To mitigate **learning effects**, we utilized **counterbalancing**: Group 1 played from Easy to Hard, while Group 2 played in the reverse order.

**Data Analysis & Key Findings:** The NASA-TLX results (1–10 scale) revealed a significant intensity gap. The most dramatic shift occurred in **Temporal Demand**, which surged from a mean of 3.33 in Easy Mode to 7.08 in Hard Mode. This surge in "rushed" feelings directly impacted success, as **Performance** scores dropped from 8.17 to 5.25. Furthermore, Group 2 (who faced Hard Mode first) reported a **Frustration** mean of 5.5, significantly higher than Group 1’s 4.83. This indicates that without a mechanical introduction, the Hard Mode is currently too punishing for new players.
<p align="center">
  <img width="692" height="217" alt="temporal demand - easy mode" src="https://github.com/user-attachments/assets/1b4ac6ae-4e03-4335-aff3-d0a561876585" />
</p>
<p align="center" style="font-size: 0.7rem; color: #777;">
  Temporal Demand - Easy mode
</p>

<p align="center">
  <img width="703" height="222" alt="temporal demand - hard mode" src="https://github.com/user-attachments/assets/13e71abf-c71e-4e4e-8a20-b19e1652dfbc" />
</p>
<p align="center" style="font-size: 0.7rem; color: #777;">
  Temporal Demand - Hard mode
</p>


**Priority Improvement:** Based on these results, we are prioritizing a reduction in obstacle density for Hard Mode to bring the temporal demand into a more manageable range. Additionally, to address the frustration spikes seen in Group 2, we are implementing a **detailed, mandatory tutorial** before the game starts. This will ensure all players, regardless of their starting level, are guided through core mechanics and hazard identification before facing high-intensity gameplay.

<h3>Code Test</h3>
TBC
<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="process"></a>
<h2 align="center">Process</h2>

<p align="center"><i>15% &nbsp;·&nbsp; ~750 words</i></p>

<h3>Team Structure and Role Definition</h3>
<p>
At the project's inception, we recognized that a clear division of labor was essential to prevent overlapping efforts and ensure accountability. We adopted a specialized role structure, ensuring each member had "ownership" over a specific pillar of the game’s development:
</p>

<ul>
<li><strong>Charlotte Yu (Core Mechanism Design):</strong> Focused on the physics engine, character movement, and the implementation of the unique health-depletion system.</li>
<li><strong>Lucca Zhou (Aesthetic Design):</strong> Responsible for the 3D environmental assets, character models, and ensuring a cohesive visual identity across all levels.</li>
<li><strong>Ray Wang (Level Design):</strong> Tasked with the architectural flow of the five levels, balancing the difficulty of obstacle placement with the frequency of power-ups.</li>
<li><strong>Layla Pei (UI/UX & Audio):</strong> Developed the head-up display (HUD), menu navigation, and the soundscape that provides feedback for health loss and coffee collection.</li>
</ul>

<h3>Methodology: Agile and Jira Integration</h3>
<p>
To manage our workflow, we adopted an <strong>Agile methodology</strong> centered around two-week sprints. Our primary command center was <strong>Jira</strong>, where we utilized a Kanban board to visualize the lifecycle of every task.
</p>

<p>
The process began with a comprehensive <strong>Product Backlog</strong>, where we listed every requirement—ranging from "Game Bakcground Art Asset" to "Refactor Narrative System to Data-Driven Architecture." During our sprint planning sessions, we moved high-priority "User Stories" from the backlog into the active sprint. This systematic approach allowed us to:
</p>

<ul>
<li><strong>Identify Bottlenecks:</strong> We could immediately see if Aesthetic Design was lagging behind Level Design, which prevented the placement of finalized assets into the game engine.</li>
<li><strong>Maintain Transparency:</strong> Every team member had real-time visibility into their peers' progress, significantly reducing the need for redundant status-update meetings.</li>
</ul>

<p>
<strong>Our Kanban Board:</strong> 
<a href="https://charlotteyu47.atlassian.net/jira/software/projects/PSS/boards/100?sprints=71&atlOrigin=eyJpIjoiNzcxZDYxMzk4YTY2NDY2NDhmZWFhZmY3ODliNWUwM2QiLCJwIjoiaiJ9" target="_blank">View our Jira Project here</a>
</p>

<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="conclusion"></a>
<h2 align="center">Conclusion</h2>

<p align="center"><i>10% &nbsp;·&nbsp; ~500 words</i></p>

Reflect on the project as a whole. Lessons learnt. Reflect on challenges. Future work — describe both immediate next steps for your current game and what you would potentially do if you had the chance to develop a sequel.

<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="contribution"></a>
<h2 align="center">Contribution Statement</h2>

<div align="center">

| Team Member | Primary Role | Contribution |
|:---:|:---|:---:|
| Charlotte Yu | Core Mechanism Design | 25% |
| Lucca Zhou | Aesthetic Design | 25% |
| Ray Wang | Level Design | 25% |
| Layla Pei | UI/UX & Audio | 25% |


</div>

<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<div align="center">

<br>

<img src="https://img.shields.io/badge/Made%20with%20%E2%99%A5%20at-University%20of%20Bristol-c4b5fd?style=flat-square&labelColor=7c3aed" alt="Made at Bristol" />
&nbsp;
<img src="https://img.shields.io/badge/SEDP%202026-Group%207-c4b5fd?style=flat-square&labelColor=7c3aed" alt="Group 7" />

</div>
