<div align="center">

# Lab 7: Think Aloud Study & Heuristic Evaluation

<br>

## Description

</div>

> The primary objective of Week 7 was **Usability Auditing and User Validation**. Our team conducted a formal Think Aloud study to observe real-time player behavior, focusing on the transition from narrative exploration to core gameplay mechanics. This was followed by a professional Heuristic Evaluation based on Nielsen’s 10 principles to identify UI/UX friction points.

<br>

<div align="center">

## Project Contributors

| Member | Contributions |
|:---:|:---|
| **Layla Pei** | Think Aloud Study (Task 1)|
| **Charlotte Yu** | Think Aloud Study (Task 2)|
| **Ray Wang** | Heuristic Evaluation|
| **Lucca Zhou** | Heuristic Evaluation|

<br>

## Table of Contents

| Deliverable | Description | Status |
|:---:|:---|:---|
| **Think Aloud Study** | Real-time user validation for Task 1 & Task 2 | [View Section](#think-aloud-study) |
| **Heuristic Evaluation** | Expert UI/UX Audit based on Nielsen's 10 Principles | [View Section](#heuristic-evaluation) |

<br>

---

<a name="think-aloud-study"></a>

## Think Aloud Study

</div>

### Executive Summary
* **Successes:** High narrative engagement; the main menu and settings are frictionless; thematic hazards (e.g., the Promoter) are well-received.
* **Pain Points:** Visual guidance "vacuums" in the room leads to stagnation; semiotic conflicts exist where players mistake hazards (Food Trucks) for buffs.
* **Core Conclusion:** Future development will shift focus from content volume to Communication Clarity, specifically regarding interaction signifiers and HUD visibility.

### Research Design: Rationale & Objectives
* **Task 1 (Early Game Flow & Navigation):** To test if environmental cues alone can guide a player through the "Pack & Exit" logic. This is the first "churn point" where players might quit if they feel aimless.
* **Task 2 (Core Mechanics & Hazard Semiotics):** To evaluate the readability of the HUD and the clarity of obstacle types. We aimed to observe if the player's mental model matches the game's intended penalties.

<br>

### Task 1: Onboarding & Room Exploration

#### Objectives & Protocol
Evaluate the clarity of early-game navigation. Observe whether players understand the narrative requirement to "pack the bag" and successfully trigger the DayRun transition.

#### Facilitator's Prompt:
> "Please enter the game and complete what you believe is the first full gameplay flow. You are free to explore, but try to: Start the game, understand available actions, and leave the room to enter the street. Please vocalize your thoughts constantly."

#### Record Sheet

<div align="center">

| Time | Action | Verbalisation | Behaviour | Issue Type | Notes |
|:---:|:---|:---|:---|:---:|:---|
| 00:12 | Clicked Help | "Let me see what this is about." | Immediate click, no hesitation | Exploration | Menu is clear |
| 00:30 | Reading Help page | "The text is so small, it's hard to read." | Leaned forward | Readability | Help font size too small |
| 01:30 | Clicked Setting | "This is easy to understand." | Quick navigation | None | Settings page clear |
| 01:50 | Entered Room | "What should I do now?" | 5s pause | Discoverability | Lack of immediate guidance |
| 02:15 | Approached desk | "Oh, there's something here." | Walk around | Visual cue weakness | Prompt icon too small |
| 02:30 | Entered Backpack | "Which one am I supposed to take?" | Mouse hovering repeatedly | Decision clarity | Required item not highlighted |
| 03:05 | Attempted second Buff-item | "Why can't I take this?" | Click attempt blocked | Rule clarity | 'Only one item' not clear |
| 03:50 | Returned to Room | "How do I leave now?" | 6s pause | Navigation | No clear prompt to return to Room |
| 04:10 | Found door | "Is this the exit?" | Hesitant click | Visual affordance | Door marker not obvious |

</div>

<br>

#### Summary & Critical Reflection

**What worked well (Strengths):**
* **Menu Intuition:** The Main Menu and Settings architecture are highly effective. The "Start" button provides a frictionless entry point with zero reported confusion.
* **Interface Familiarity:** Players were able to understand the core purpose of the backpack and settings pages quickly once they were accessed.

**What failed (Weaknesses):**
* **Guidance Vacuum:** Once in the Room phase, player hesitation increased significantly. Players were unsure which objects were interactive and spent time wandering without a clear goal.
* **Weak Interaction Signifiers:** The prompt icon for the desk was too small and located in the periphery, causing players to miss interaction points even when standing nearby.
* **Logical Obscurity:** Interaction constraints, such as the "Only one buff-item" rule, were not communicated. This led players to believe the game was unresponsive rather than following a rule.

**Future Iteration Goals:**
* **Strengthen Prompts:** Redesign interaction icons and environmental markers (like the exit door) to be more visually prominent.
* **Improve Visual Hierarchy:** Use lighting or shaders to highlight key interaction points, ensuring players don't need to "guess" what is clickable.
* **Explicit Constraints:** Make game rules and interaction limits (e.g., item counts) visible within the UI to prevent user frustration.

<br>

### Task 2: Core Gameplay & Hazard Clarity

#### Objectives & Protocol
Assess the intuitiveness of the DayRun phase. Observe how players identify street hazards and whether the HUD provides sufficient progress information.

#### Facilitator's Prompt:
> "While playing, describe: What does this obstacle represent? What do you expect it to do? How do you know you have been penalised? Do you clearly understand why you lost health? If anything feels unexpected, please say so."

#### Record Sheet

<div align="center">

| Time | Feature Type | User Reaction | Expected Outcome | Actual Outcome | Evidence of Confusion | Proposed Solution |
|:---:|:---|:---:|:---|:---|:---|:---|
| 05:20 | Hazard: Small Business Trucks | Confused | Player avoids the truck to prevent energy loss. | Player intentionally collided with the truck. | "I thought the Ice Cream truck was a shop where I could buy food." | Visual Re-design: Add warning strobes or hazard colors. |
| 06:10 | HUD: Progress Bar | Ignored | Check distance to understand progress. | Player failed to notice the bar. | "I didn't know how far I had gone." | UI Label: Add explicit 'DISTANCE' label. |
| 07:05 | Hazard: Promoter (Flyer) | Stuck | Press space to dismiss the flyer. | Panic and fail. | "I thought the flyer was a static ad." | UX Feedback: Add pulsing "Press SPACE" prompt. |

</div>

<br>

#### Summary & Critical Reflection

**What worked well (Strengths):**
* **Engagement:** The participant was highly engaged with the "Promoter" hazard, acknowledging it as a unique and thematic challenge.
* **Immediate Feedback:** The "Death/Fail" screen effectively communicated that the run had ended, even if the intermediate health loss was sometimes missed.

**What failed (Weaknesses):**
* **Semiotic Confusion:** There is a clear "mental model" conflict. By making food trucks (Kebab/Ice Cream) obstacles, we violated user expectations (Food = Health) without enough visual warning.
* **Peripheral Blindness:** The HUD is currently too "quiet". Users focused on the center of the screen (the character) and completely missed the progress bar at the top.
* **Lack of Affordance:** The interactive hazards (Promoter) lacked a clear call-to-action, leading to "Stall-and-Fail" scenarios.

**Future Iteration Goals:**
* **Visual Hierarchy:** Redesign obstacles to look more "threatening" (e.g., darker palettes or caution outlines for trucks).
* **Explicit HUD:** Add micro-interactions or labels to the Progress Bar so it feels like a functional tool rather than background decoration.
* **Contextual Tutorials:** Instead of a wall of text, implement "Just-in-Time" hints (e.g., a flashing Space key icon when a flyer hits the screen).

---

<a name="heuristic-evaluation"></a>

<div align="center">

## Heuristic Evaluation

</div>

### Record Sheet

<div align="center">

| **Interface** | **Issue** | **Heuristic(s)** | **Frequency** | **Impact** | **Persistence** | **Severity** |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| backpack page | can't find "back" button | User control and freedom | 0 | 1 | 1 | **0.67** |
| time wheel page | level choosing interface (don't know when would unlock) | Visibility of system status | 1 | 2 | 2 | **1.67** |
| bedroom | instruction in bedroom is not clear / don't know what to do | Help and documentation | 3 | 3 | 1 | **2.33** |
| within the level | health bar is not clear (damage effect) | Visibility of system status | 3 | 3 | 4 | **3.33** |
| backpack | backpack page is repetitive | Aesthetic and minimalist design | 3 | 0 | 1 | **1.33** |
| without tutorial page | lack of tutorial | Help and documentation | 4 | 3 | 3 | **3.33** |
| level design | too much dialogs | Aesthetic and minimalist design | 0 | 0 | 0 | **0.00** |
| ui | instruction of dialog page is not clear | Help and documentation | 1 | 0 | 0 | **0.33** |

</div>

<br>



### Issues & Solutions

### 1. Item Management (Backpack)
**Issue:** The backpack interface feels repetitive or redundant when selecting core items.
**Improvement:** Implement Fixed Core Slots.
**Solution:** Lock the two mandatory items in place by default. This reduces cognitive load and clicks, allowing the user to focus exclusively on selecting optional power-ups or strategic items.

### 2. Onboarding & Guidance (Tutorial)
**Issue:** New players lack direction and don't understand game mechanics.
**Improvement:** Introduce an Integrated Tutorial & Glossary.
**Solution:** Add a "How to Play" overlay at the start of the first session. Include a visual encyclopedia (Tooltips or a Help Page) that clearly defines the effects of power-ups and the threats posed by specific obstacles.

### 3. Narrative Pacing (Dialogs)
**Issue:** Large amounts of text can frustrate players who prefer action over story.
**Improvement:** Add a Global "Skip" Function.
**Solution:** Place a "Skip" or "Fast-Forward" button in the corner of dialog sequences. This empowers the user with control over their pace while keeping the script available for story-driven players.

### 4. UI Clarity (Dialog Interface)
**Issue:** The purpose or flow of the dialog page is currently ambiguous.
**Improvement:** Refine Text Hierarchy and Placement.
**Solution:** Standardize the dialog UI by placing a dedicated text box at the bottom of the screen. Use a "Tap to Continue" indicator to signal that there is more text, making the interaction intuitive.

### 5. Backpack Repetition
**Issue:** Players feel confused and frustrated by having to repeatedly place the same mandatory items into the backpack every day.
**Improvement:** Reduce Repetitive Interaction.
**Solution:** Automatically fix mandatory daily items into permanent backpack slots. Only optional or strategic items remain selectable. This removes redundant actions and streamlines pre-level preparation.

### 6. Lack of Tutorial
**Issue:** Players are confused about UI elements, movement boundaries, and the effects of obstacles during levels.
**Improvement:** Introduce Structured Onboarding.
**Solution:** Add a tutorial sequence before the first gameplay session. The tutorial will clearly explain UI elements (stamina bar, timer), movement boundaries, and obstacle consequences.

### 7. Level Length
**Issue:** Players report that levels feel too long, which reduces engagement and pacing quality.
**Improvement:** Optimize Level Duration.
**Solution:** Shorten overall level length by reducing total travel distance or adjusting progression pacing. Maintain challenge while improving tempo and player retention.

### 8. Dialog UI Clarity
**Issue:** The instruction and interaction flow of the dialog page are unclear to users.
**Improvement:** Integrate Dialog Guidance into Tutorial.
**Solution:** Include a clear explanation of dialog interaction within the tutorial. Demonstrate how to proceed (e.g., tap to continue), and ensure visual cues are consistent throughout gameplay.

<br>

---

<div align="center">

[Back to Project Home](../../../README.md)

</div>
