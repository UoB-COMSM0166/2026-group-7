<div align="center">

# Week 9 Lab: Quality Assurance — Black-Box & White-Box Testing

<br>

## Summary

</div>

> The primary objective of Week 9 was to **freeze new feature development and transition strictly into the Quality Assurance (QA) phase**. We designed and executed a comprehensive testing protocol combining industry-standard Black-Box and White-Box methodologies — moving beyond ad-hoc playthroughs to produce systematic, evidenced verification that the game met its original functional requirements.

<br>

<div align="center">

---

## 1. Testing Strategy & Methodology

</div>

Our QA strategy was structured around two complementary testing layers:

<br>

### Black-Box Testing

Black-Box tests treat the system as an opaque unit — inputs are supplied and outputs are verified against the specification, with no knowledge of internal implementation. We applied two formal techniques:

- **Equivalence Partitioning (EP):** Used in the collision test suite (Table 3 of the main README). Rather than testing every individual obstacle asset, we grouped all obstacles into six behavioural classes — Fatal, Damage, Stun, Displacement, Status Effect, and Illusory. Testing one representative per class validates the underlying collision logic without redundant cases.

- **Boundary Value Analysis (BVA):** Applied in Table 8 to stress-test the engine at its extreme operational limits — specifically HP underflow, stamina overflow, lane boundary enforcement, and rapid-input edge cases. These boundaries are the most common sources of runtime faults and are invisible during normal playthroughs.

<br>

### White-Box Testing

White-Box tests inspect the internal structure of the code itself — control flow paths, branch conditions, and data interactions. We focused on two areas where internal complexity posed the highest risk:

### Control Flow Coverage — FSM State Machine

The main draw loop in `sketch.js` is a `switch(gameState.currentState)` statement managing over 20 distinct game states. A missing or broken state transition would leave the player permanently stuck. We constructed a state-transition path table and verified that every state is both reachable and escapable — with no dead states. The critical path tested was:

```text
STATE_MENU → STATE_DIFF_SELECT → STATE_DIFF_CONFIRM → STATE_LOAD_GAME
→ STATE_LEVEL_SELECT → STATE_TUTORIAL_SLIDES → STATE_DAY_RUN
→ STATE_WIN → STATE_ROOM → STATE_DAY_RUN (next day)
```

We also verified all diverging branches: `CASUAL` mode selection routes correctly to Endless Easy Mode (Day 1 pacing) and `HARD` to Endless Hard Mode (Day 5 intensity), each requiring a valid Player ID before the confirm button activates; `ESC` on every sub-screen returns to its documented parent state.

<div align="center">

| State | Reachable | Escapable | Verified Via |
| :--- | :---: | :---: | :--- |
| `STATE_LOADING` | Yes | Yes | Auto-advance when all assets pass preload check |
| `STATE_SPLASH` | Yes | Yes | Click or 10 s auto-advance → MENU |
| `STATE_WARNING` | Yes | Yes | Dismiss trigger-warning overlay → MENU |
| `STATE_MENU` | Yes | Yes | Click START → DIFF_SELECT; SETTINGS / HELP / CREDITS reachable |
| `STATE_SETTINGS` | Yes | Yes | ESC / Back → MENU (or PAUSE if entered from pause) |
| `STATE_HELP` | Yes | Yes | ESC / Back → MENU or PAUSE depending on entry point |
| `STATE_CREDITS` | Yes | Yes | End of credits or skip → MENU |
| `STATE_DIFF_SELECT` | Yes | Yes | ESC → MENU, or select difficulty → DIFF_CONFIRM |
| `STATE_DIFF_CONFIRM` | Yes | Yes | ESC → DIFF_SELECT, or confirm → LOAD_GAME / LEVEL_SELECT |
| `STATE_LOAD_GAME` | Yes | Yes | NEW GAME / CONTINUE → LEVEL_SELECT; ESC → DIFF_CONFIRM |
| `STATE_LEVEL_SELECT` | Yes | Yes | Select day → ROOM; SAVE_CHOICE if unsaved game detected |
| `STATE_SAVE_CHOICE` | Yes | Yes | CONTINUE → LEVEL_SELECT; ABANDON → MENU |
| `STATE_CUTSCENE` | Yes | Yes | Node completion → ROOM or LEVEL_SELECT depending on cutscene type |
| `STATE_ROOM` | Yes | Yes | Walk to door → DAY_RUN; B → INVENTORY; P → PAUSE |
| `STATE_TUTORIAL_SLIDES` | Yes | Yes | Click through all slides or SKIP → DAY_RUN |
| `STATE_DAY_RUN` | Yes | Yes | WIN / FAIL / PAUSE (P key) / B (INVENTORY) |
| `STATE_PAUSE` | Yes | Yes | ESC / BACK → DAY_RUN or ROOM; EXIT → MENU |
| `STATE_INVENTORY` | Yes | Yes | B / ESC → previous state (ROOM or DAY_RUN) |
| `STATE_WIN` | Yes | Yes | Auto-transition after victory sequence; CONTINUE / RESTART / EXIT |
| `STATE_FAIL` | Yes | Yes | RETRY → DAY_RUN; NEW GAME → ROOM; EXIT → MENU |

</div>

<br>

### Branch Coverage — Utility Item Collision Handler

The utility item activation logic in `Player.js` contains nested conditional branches that determine whether a hazard is negated. We designed a decision table to ensure every branch combination was exercised:

<div align="center">

| Condition | Tangle vs Coffee | Headphones vs Promoter | Rain Boots vs Puddle |
| :--- | :---: | :---: | :---: |
| Item carried, armed (`press E`), charges > 0 | Hazard negated | Hazard negated | Hazard negated |
| Item carried, **not armed**, charges > 0 | Normal collision | Normal collision | Normal collision |
| Item carried, armed, charges = 0 | Normal collision | Normal collision | Normal collision |
| No item carried | Normal collision | Normal collision | Normal collision |
| Player invincible (any state) | Hazard bypassed | Hazard bypassed | Hazard bypassed |

</div>

All five branches per item were verified, confirming that the guard conditions are evaluated in the correct order and that no branch is unreachable.

<br>

### Cyclomatic Complexity & Coverage Summary

<div align="center">

| Analysed Area | V(G) | Branch Coverage | Dead Code |
| :--- | :---: | :---: | :--- |
| **Utility Item Collision Handler** (`Player.js` / `ObstacleSystem.js`) | **5** | **100%** — all 5 independent paths exercised | None identified |
| **FSM Draw Loop** (`sketch.js`) | **≥ 21** | **100%** — all 20 states confirmed reachable and escapable | None identified |

</div>

**V(G) derivation — Utility Item Collision Handler:** The decision table above maps to 5 linearly independent paths through the handler (one per row). The handler logic is distributed across two files: predicate functions (`shouldTriggerRainBoots`, `shouldTriggerHeadphones`, `shouldTriggerTangle`) in `Player.js`, and the collision dispatch logic in `ObstacleSystem.js::handleCollision`. Because no single function contains all decision points, a single-function CFG cannot be constructed for the $E - N + 2P$ formula. V(G) is therefore derived directly from the path-count method: the number of linearly independent paths through the combined logic equals the number of rows in the decision table, giving **V(G) = 5**. A V(G) of 5 is well within the accepted low-complexity threshold (≤ 10) and serves as an ISO 25010 *maintainability* indicator — functions within this threshold are considered readily comprehensible, testable, and modifiable without cascading side effects.

**V(G) derivation — FSM Draw Loop:** The central `switch` statement has 20 cases, each representing a distinct game state. By definition, a switch with *k* cases contributes *k* to cyclomatic complexity, giving a base $V(G) \geq 21$. Additional nested conditions within certain cases (e.g., mode-specific routing in `STATE_DIFF_CONFIRM`, ESC-handler branching in `STATE_PAUSE`) increase the true value further. The FSM's high V(G) reflects its role as the engine's central dispatcher — its complexity is managed by isolating each state's logic into dedicated handler functions rather than embedding it in the switch body.

**Dead code:** No unreachable code paths were identified in either analysed area during the white-box phase. The Testing Panel confirmed that every `case` branch in the FSM switch was triggerable, and the collision handler's guard conditions are mutually exclusive with no path that could never be entered.

<br>

<div align="center">

---

## 2. QA Process in Action — Testing Panel Integration

</div>

Executing BVA cases manually — such as forcing HP to exactly 1 HP or spawning a specific obstacle on demand — would have been prohibitively time-consuming through normal play. We relied heavily on the custom in-game **Testing Panel** built earlier in the project. This debug overlay allowed us to:

- Instantly set HP to any value (enabling precise lower-boundary tests for 8.1 and 8.2)
- Directly jump to any game state (validating every FSM transition in the control flow table above)
- Spawn specific obstacle types on demand (verifying each EP class in Table 3)
- Equip specific utility items with known charge counts (exercising every branch in the collision handler table above)

The Testing Panel was instrumental in reducing the time needed to reach a specific edge case from several minutes of play to a single button press — dramatically compressing the QA cycle.

<br>

<div align="center">

---

## 3. Critical Bugs Identified and Resolved

</div>

Rigorous BVA and EP testing surfaced four bugs that were invisible during casual playthroughs. Each was traced directly to a specific test case, resolved, and re-verified.

<br>

### Bug 1 — Lane-Switching Hyper-Sensitivity (PSS-265, PSS-261)

> **Discovered by:** BVA Test 8.6 — Input Spam Boundary

**Issue:** With `laneRepeatDelayFrames` initially set to 5 frames, a single held directional key (`A` or `D`) was registered across multiple consecutive frames before the lane-transition animation completed. This caused the player character to jump two lanes in a single input, frequently landing in unintended obstacles or stepping out of the valid lane range (1–4).

**Resolution:** The fix was applied iteratively. In PSS-265, Ray increased the delay to 8 frames, reducing the most severe overshoots. After further testing confirmed that 8 frames was still insufficient under rapid tap inputs, the value was raised to 20 frames in PSS-261 — eliminating the overshoot entirely while keeping movement responsive. The final value of 20 frames is reflected in Test 8.6 of the main README.

**Files changed:** `docs/pss/src/Player.js`

<br>

### Bug 2 — Fantasy Coffee Illusory Behaviour Mismatch (PSS-263)

> **Discovered by:** EP Test 3.7 — Illusory obstacle class

**Issue:** The Fantasy Coffee obstacle is designed to drop its disguise and flee when approached — dealing no damage. Testing revealed two problems: (1) the disguise-drop trigger condition was inconsistent, occasionally dealing damage before the flee animation completed; and (2) the power-up sprite asset lacked a white border, making it visually indistinguishable from a genuine collectible until the very last moment, breaking the intended illusory design.

**Resolution:** The trigger logic in `ObConfig.js` and `ObstacleSystem.js` was corrected to ensure the disguise drops and the flee velocity activates atomically. Updated sprite assets with white borders were added for all power-up items. The flee sequence was also synchronised with `sketch.js` to prevent the collision handler from processing the obstacle after the flee has started.

**Files changed:** `docs/pss/src/ObConfig.js`, `docs/pss/src/ObstacleSystem.js`, `docs/pss/sketch.js`

<br>

### Bug 3 — Homeless NPC Dialogue Box Layout Fault (PSS-260)

> **Discovered by:** EP Test 3.4 — Displacement obstacle class

**Issue:** When the player collided with the Homeless NPC, the triggered dialogue box rendered incorrectly — the portrait, speaker name, and text body were misaligned and, in some cases, the dialogue overlay persisted after the interaction concluded, blocking the run HUD.

**Resolution:** The dialogue box instantiation and lifecycle management inside `ObstacleSystem.js` was refactored. The portrait anchoring was corrected, and an explicit dismissal flag was added to ensure the overlay is reliably cleared when the collision interaction ends. The internal rendering logic grew from approximately 46 lines to 151 lines of structured code to handle all edge cases.

**Files changed:** `docs/pss/src/ObstacleSystem.js`

<br>

### Bug 4 — Stale Snapshot and Race Condition in Item Tutorial (PSS-267)

> **Discovered by:** Item system tests 4.3, 4.4 — combined with Testing Panel item tutorial buttons

**Issue:** Two related bugs were found during item tutorial QA. First, `setupRunDirectly()` called `restoreUtilityItemFromRunSnapshot()` which read from `gameState.savedRunUtilityItem` — a value set by a previous test run. This caused the HUD to display the wrong utility item when triggering a new day via the Testing Panel. Second, the 400 ms `setTimeout` callback in each Testing Panel item-tutorial button could fire after the user had already switched to a different day's run, overwriting the new run's player state.

**Resolution:** `setupRunDirectly()` was updated to call `syncUtilityItemFromBackpack()` immediately after `resetForNewDay()`, ensuring the equipped item always reflects the current backpack state rather than a stale snapshot. The race condition was resolved by introducing a generation counter (`_itemTutGen`) — each button click increments the counter, and the `setTimeout` callback silently exits if its captured generation no longer matches the current value.

**Files changed:** `docs/pss/sketch.js`, `docs/pss/src/TestingPanel.js`

<br>

<div align="center">

---

## 4. Requirements Traceability & Acceptance Testing

</div>

### Requirements-to-Test Traceability Matrix

The table below maps each functional requirement from the MoSCoW prioritisation (Section 2.5 of the main README) to the specific test cases that verify it.

<div align="center">

| Requirement | Priority | Verified By |
| :--- | :---: | :--- |
| Four-lane movement with spring-damper physics | Must | Tests 2.5, 2.6, 8.4, 8.5, 8.6 |
| Passive health decay + coffee collection to restore health | Must | Tests 4.1, 7.1, 8.1, 8.2, 8.3 |
| Collision detection for vehicles, scooters, NPC hazards | Must | Tests 3.1 – 3.7 |
| Instant-fail on large vehicle (bus/ambulance) collision | Must | Tests 3.1, 7.2 |
| Five narrative days with distinct obstacle profiles | Must | Tests 1.3, 1.4, 7.4 |
| Branching dialogue system with choice persistence | Must | FSM white-box: `STATE_CUTSCENE` reachable/escapable; UC9 end-to-end flow |
| Backpack inventory system with active item usage | Should | Tests 4.3 – 4.7, 8.7 |
| Procedural obstacle spawning with fairness scaling | Should | Tests 3.1 – 3.7 (EP class coverage) |
| Local leaderboard with high-score tracking | Should | Tests 1.9, 1.10 |
| Brightness control via CSS filter | Should | Test 5.6 |
| Fullscreen toggle via [F] key | Should | Test 5 (UI/Audio); FSM any-state verification |
| Puddle trap mechanic with interactive escape | Could | Tests 2.10, 3.6 |
| CASUAL / HARD endless difficulty modes | Could | Tests 1.9, 1.10 |

</div>

### Acceptance Testing (Validation)

Acceptance testing answers the question: *does the delivered system solve the user's original problem?* Each user story from Section 2.4 of the main README was validated against the final build using the Given–When–Then criteria defined at the requirements stage.

<div align="center">

| User Story | Acceptance Criterion (Summary) | Validated? |
| :--- | :--- | :---: |
| Health depletes continuously during run | HP bar decreases each frame at day-specific rate; coffee restores HP | Yes |
| Lane-switching via keyboard | A/D and arrow keys trigger smooth spring-damper transition | Yes |
| Different obstacle types behave differently | EP tests confirm each of 6 behavioural classes produces distinct outcome | Yes |
| Utility item usage from backpack | E key activates item; charge count decrements correctly | Yes |
| Scene transitions are clean (no audio/UI bleed) | Manual verification across all 20 FSM state transitions | Yes |
| Progress saved automatically | Save persists across browser refresh; corrupted save falls back to new game | Yes |
| Trigger warning before sensitive content | Warning screen blocks all gameplay until dismissed | Yes |
| Brightness adjustable in Settings | CSS filter updates in real time; persists across sessions | Yes |

</div>

All eight validated user stories passed. No acceptance criterion required a design change at this stage; the four bugs resolved during QA (Section 3) were implementation-level faults that did not alter the stated requirements — they corrected the engine's behaviour to match what the requirements already specified.

<br>

<div align="center">

---

## 5. Reflection

</div>

Week 9 reinforced a lesson that is easy to state but hard to internalise: **testing is not a final gate — it is a discovery process**. Every one of the four bugs above had been present in the codebase for multiple sprints, completely invisible during informal play. It was only the systematic rigour of BVA (forcing HP to exact boundaries) and EP (isolating each obstacle class) that made them surface.

The white-box analysis added a second layer of confidence. Mapping the FSM state transitions to a table and auditing every conditional branch in the collision handler transformed our intuitive belief that "the game works" into a structured, evidenced claim.

The two methods proved complementary: black-box testing validated *what* the system does against its specification; white-box testing validated *how* the internal logic handles every code path. Together they gave us genuine confidence in the stability of the final release.

<br>

> For the complete set of passing test case tables and parameters, refer to the **Black-Box Testing** section of the [main README](../../../README.md#evaluation).

<br>

---

<div align="center">

[Back to Project Home](../../../README.md)

</div>
