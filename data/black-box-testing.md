# Black-Box Testing — Park Street Survivor

To ensure software quality and validate functional requirements, we conducted comprehensive Black-Box Testing using **Equivalence Partitioning (EP)** and **Boundary Value Analysis (BVA)** methods.

**Functional Validation:** The following test cases are designed to verify that the core gameplay loops, scene transitions, and inventory state management strictly conform to the user stories and functional requirements defined in the design phase.

---

## 1. Game Scene Switching Test

| Test Case | Input | Expected Output | Observed Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1.1** | Player enters the Main Menu and clicks START | Game switches to the SELECT DIFFICULTY page (CASUAL / NORMAL / HARD) | Behaves as expected | **Pass** |
| **1.2** | Player selects NORMAL in the SELECT DIFFICULTY page | Game switches to the MODE confirmation page | Behaves as expected | **Pass** |
| **1.3** | Player confirms NORMAL mode and chooses NEW GAME | Game proceeds through opening cutscene to TIME WHEEL (level select) | Behaves as expected | **Pass** |
| **1.4** | Player selects a date in the TIME WHEEL page | Game switches to the corresponding ROOM scene | Behaves as expected | **Pass** |
| **1.5** | Player finishes preparation in ROOM and starts the run | Game switches to the DAY-RUN gameplay scene | Behaves as expected | **Pass** |
| **1.6** | Player presses P (or ESCAPE) during DAY-RUN | Game switches to the PAUSE SCREEN, gameplay loop is halted | Behaves as expected | **Pass** |
| **1.7** | Player selects EXIT in the PAUSE SCREEN | Game completely resets and returns to the MAIN MENU | Behaves as expected | **Pass** |
| **1.8** | Player reaches the total distance target with HP > 0 | Game transitions to WIN screen after a brief victory phase | Behaves as expected | **Pass** |
| **1.9** | Player selects CASUAL difficulty and confirms | Game shows "Coming Soon" notice (CASUAL not yet implemented) | Behaves as expected | **Pass** |
| **1.10** | Player selects HARD difficulty and confirms | Game shows "Coming Soon" notice (HARD not yet implemented) | Behaves as expected | **Pass** |

---

## 2. Player Movement and Control Interaction Test

| Test Case | Input | Expected Output | Observed Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **2.1** | Player presses W / UP_ARROW in ROOM scene | Player character moves north | Behaves as expected | **Pass** |
| **2.2** | Player presses S / DOWN_ARROW in ROOM scene | Player character moves south | Behaves as expected | **Pass** |
| **2.3** | Player presses A / LEFT_ARROW in ROOM scene | Player character moves west | Behaves as expected | **Pass** |
| **2.4** | Player presses D / RIGHT_ARROW in ROOM scene | Player character moves east | Behaves as expected | **Pass** |
| **2.5** | Player presses A / LEFT_ARROW in DAY-RUN | Player character changes to the left lane | Behaves as expected | **Pass** |
| **2.6** | Player presses D / RIGHT_ARROW in DAY-RUN | Player character changes to the right lane | Behaves as expected | **Pass** |
| **2.7** | Player presses P (or ESCAPE) during DAY-RUN | The PAUSE SCREEN is displayed instantly | Behaves as expected | **Pass** |
| **2.8** | Player presses ESC on a submenu or sub-screen | Game returns to the previous page | Behaves as expected | **Pass** |
| **2.9** | Player presses ENTER near the desk in the ROOM scene | Backpack / Inventory page is opened | Behaves as expected | **Pass** |
| **2.10** | Player presses SPACE 3 times while trapped in a PUDDLE | Puddle slow effect is cleared and run continues normally | Behaves as expected | **Pass** |
| **2.11** | Player presses SPACE 5 times during a PROMOTER interaction | Leaflet overlay is dismissed, run continues | Behaves as expected | **Pass** |
| **2.12** | Player presses E with a utility item equipped during DAY-RUN | Item effect activates; remaining charge count decreases by 1 | Behaves as expected | **Pass** |

---

## 3. DAY-RUN Collision Test (Equivalence Partitioning)

**Testing Methodology (Equivalence Partitioning):** Instead of exhaustively testing every single obstacle asset, we applied EP to group obstacles into distinct behavioural classes (Fatal, Damage, Stun, Displacement, Status Effect, Illusory). Testing one representative from each class validates the underlying collision logic without redundant cases.

| Test Case | Input (Obstacle Category) | Expected Output | Observed Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **3.1** | Player collides with a **large vehicle** — Bus / Ambulance (Fatal) | Game ends immediately; fail screen displays reason "HIT_BUS" | Behaves as expected | **Pass** |
| **3.2** | Player collides with a **small vehicle** — Police car / Sedan (Damage, −34 HP) | Player takes 34 HP damage; run continues if HP > 0 | Behaves as expected | **Pass** |
| **3.3** | Player collides with a **scooter rider** (Stun) | Player is stunned for 0.5 s then lane input is blocked for 1.0 s | Behaves as expected | **Pass** |
| **3.4** | Player collides with a **homeless NPC** (Displacement) | Player takes 10 HP damage and is forced into an adjacent lane | Behaves as expected | **Pass** |
| **3.5** | Player collides with a **small business** — ice cream cart / kebab stall (Damage, −10 HP) | Player takes 10 HP damage; run continues | Behaves as expected | **Pass** |
| **3.6** | Player walks into a **puddle** (Status Effect) | Player takes 20 HP damage and movement slows to 72 % until 3× SPACE presses | Behaves as expected | **Pass** |
| **3.7** | Player approaches a **fantasy coffee** obstacle | Item disguise drops; obstacle flees at high speed — no damage dealt | Behaves as expected | **Pass** |

---

## 4. Item Collection and Backpack System Test

| Test Case | Input | Expected Output | Observed Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **4.1** | Player collects a **Coffee** item during DAY-RUN | Player's HP is restored by +33; overflow at max HP grants 3 s invincibility | Behaves as expected | **Pass** |
| **4.2** | Player collects an **Empty Scooter** item during DAY-RUN | Player gains a 5 s speed boost (1.2×) and 7 s invincibility | Behaves as expected | **Pass** |
| **4.3** | Player selects a utility item (Vitamins / Tangle / Headphones / Rain Boots) in the ROOM backpack interface | Item is equipped as the active utility for the next run | Behaves as expected | **Pass** |
| **4.4** | Player carries a utility item into DAY-RUN | HUD correctly displays the item icon and remaining charge count | Behaves as expected | **Pass** |
| **4.5** | Player presses E to activate the **Vitamins** item | HP is immediately restored to max; charge count decreases by 1 | Behaves as expected | **Pass** |
| **4.6** | Player presses E to arm the **Rain Boots** then walks into a puddle | Puddle trap and slow are negated; charge count decreases by 1 | Behaves as expected | **Pass** |
| **4.7** | Player uses the last remaining charge of a utility item | HUD item icon returns to the default empty-backpack state | Behaves as expected | **Pass** |

---

## 5. UI, Visual Feedback and Audio Test

| Test Case | Input | Expected Output | Observed Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **5.1** | Player navigates menu options | Currently hovered option is visually highlighted | Behaves as expected | **Pass** |
| **5.2** | Player clicks a menu option | Menu selection sound effect (sfxSelect / sfxClick) plays | Behaves as expected | **Pass** |
| **5.3** | Player enters a new scene (e.g., DAY-RUN, Fail screen, Room) | Background music transitions smoothly to the scene-appropriate track | Behaves as expected | **Pass** |
| **5.4** | Player takes damage or collides with an obstacle | Visual hit feedback (red screen flash / screen shake) is shown | Behaves as expected | **Pass** |
| **5.5** | Player has no utility item equipped | HUD displays the default backpack icon and no charge badge | Behaves as expected | **Pass** |
| **5.6** | Player adjusts the MUSIC VOLUME slider in Settings | BGM volume changes in real time; new value persists when settings is closed | Behaves as expected | **Pass** |
| **5.7** | Player adjusts the SOUND EFFECTS slider in Settings | SFX volume changes in real time | Behaves as expected | **Pass** |

---

## 6. Pause and Submenu Navigation Test

| Test Case | Input | Expected Output | Observed Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **6.1** | Player presses P (or clicks the Pause icon) during DAY-RUN | PAUSE SCREEN is displayed; gameplay loop is strictly halted | Behaves as expected | **Pass** |
| **6.2** | Player clicks BACK (or presses ESCAPE) in the PAUSE SCREEN | Game resumes exactly from the paused state | Behaves as expected | **Pass** |
| **6.3** | Player selects SETTINGS in the PAUSE SCREEN | Settings submenu is rendered with MUSIC VOLUME and SOUND EFFECTS sliders | Behaves as expected | **Pass** |
| **6.4** | Player selects HELP in the PAUSE SCREEN | Help pages cycle through Controls, Character Wiki, Buffs, and Hazards | Behaves as expected | **Pass** |
| **6.5** | Player selects STORY in the PAUSE SCREEN | Story recap with scrollable day summaries (Days 0–5) is rendered | Behaves as expected | **Pass** |
| **6.6** | Player selects EXIT in the PAUSE SCREEN and confirms | Game completely resets and returns to the MAIN MENU | Behaves as expected | **Pass** |
| **6.7** | Player selects RESTART → "BACK TO ROOM" | Player is returned to the ROOM scene for the current day | Behaves as expected | **Pass** |
| **6.8** | Player selects RESTART → "RESTART RUN" | Current DAY-RUN restarts from the beginning with full HP | Behaves as expected | **Pass** |

---

## 7. Fail and Win Condition Test

| Test Case | Input | Expected Output | Observed Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **7.1** | Player's HP decays to 0 through natural stamina loss | Fail screen displayed with reason "EXHAUSTED" | Behaves as expected | **Pass** |
| **7.2** | Player collides with a large vehicle (Bus / Ambulance) | Fail screen displayed with reason "HIT_BUS" | Behaves as expected | **Pass** |
| **7.3** | Player's in-game clock exceeds the 30-minute deadline | Fail screen displayed with reason "LATE" | Behaves as expected | **Pass** |
| **7.4** | Player reaches the total distance target with HP > 0 | 3-second victory transition plays; WIN screen is shown | Behaves as expected | **Pass** |

---

## 8. Boundary Value Analysis (BVA) Test

**Testing Methodology (Boundary Value Analysis):** Edge cases are the most common source of software faults. These tests target the extreme limits of the system's constraints — HP underflow clamping, stamina overflow, rapid inputs, and empty-state interactions — to ensure the engine remains stable under stress.

| Test Case | Input (Boundary Scenario) | Expected Output | Observed Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **8.1** | **HP Lower Boundary:** Player HP is exactly 1, receives 1 HP of damage | HP drops to 0; fail state (EXHAUSTED) triggers immediately | HP reaches 0; fail state triggered | **Pass** |
| **8.2** | **HP Zero Overflow:** Player HP is exactly 1, receives 34 HP of damage (SMALL_CAR) | HP clamps to 0 (no negative HP); fail state triggers | HP correctly clamps at 0 | **Pass** |
| **8.3** | **Stamina Upper Boundary — Coffee overflow:** Player collects Coffee at 100 % HP | Coffee's +33 HP overflows max; HP is locked at max for 3 s invincibility; no HP exceeds 100 | HP remains at 100; 3 s invincibility activates | **Pass** |
| **8.4** | **Lane Boundary — left edge:** Player presses LEFT_ARROW while already in lane 1 (leftmost) | Character stays in lane 1; no out-of-bounds movement | Movement restricted to lane 1 | **Pass** |
| **8.5** | **Lane Boundary — right edge:** Player presses RIGHT_ARROW while already in lane 4 (rightmost) | Character stays in lane 4; no out-of-bounds movement | Movement restricted to lane 4 | **Pass** |
| **8.6** | **Input Spam Boundary:** Player spams A / D extremely fast | Character changes lanes one at a time; repeat delay (5-frame lock) prevents skipping lanes; stays within lanes 1–4 | Movement restricted to valid lanes with natural delay | **Pass** |
| **8.7** | **Empty Inventory Boundary:** Player presses E with no utility item equipped | No crash; input is safely ignored (no sound or visual change) | Input safely ignored; no crash | **Pass** |
| **8.8** | **SPACE input outside interaction:** Player presses SPACE when no Puddle or Promoter is active | No crash; input is safely ignored | Input safely ignored; no crash | **Pass** |
