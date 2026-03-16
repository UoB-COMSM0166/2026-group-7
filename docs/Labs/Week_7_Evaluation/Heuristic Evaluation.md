# Heuristic Evaluation
| **Interface**             | **Issue**                                                      | **Heuristic(s)**                | **Frequency**                           | **Impact**                              | **Persistence**                             | **Severity**                             |
| ------------------------- | -------------------------------------------------------------- | ------------------------------- | --------------------------------------- | --------------------------------------- | ------------------------------------------- | ---------------------------------------- |
| backpack page             | can't find "back" button                                       | User control and freedom        | 0                                       | 1                                       | 1                                           | **0.67**                                 |
| time wheel page           | level choosing interface (don't know when would unlock)        | Visibility of system status     | 1                                       | 2                                       | 2                                           | **1.67**                                 |
| bedroom                   | instruction in bedroom is not clear / don't know what to do    | Help and documentation          | 3                                       | 3                                       | 1                                           | **2.33**                                 |
| within the level          | health bar is not clear (damage effect)                        | Visibility of system status     | 3                                       | 3                                       | 4                                           | **3.33**                                 |
| backpack                  | backpack page is repetitive                                    | Aesthetic and minimalist design | 3                                       | 0                                       | 1                                           | **1.33**                                 |
| without tutorial page     | lack of tutorial                                               | Help and documentation          | 4                                       | 3                                       | 3                                           | 3.33                                     |
| level design              | too much dialogs                                               | Aesthetic and minimalist design | 0                                       | 0                                       | 0                                           | **0.00**                                 |
| ui                        | instruction of dialog page is not clear                        | Help and documentation          | 1                                       | 0                                       | 0                                           | **0.33**                                 |

## 1. Item Management (Backpack)
Issue: The backpack interface feels repetitive or redundant when selecting core items.

Improvement: Implement Fixed Core Slots.

Solution: Lock the two mandatory items in place by default. This reduces cognitive load and clicks, allowing the user to focus exclusively on selecting optional power-ups or strategic items.

## 2. Onboarding & Guidance (Tutorial)
Issue: New players lack direction and don't understand game mechanics.

Improvement: Introduce an Integrated Tutorial & Glossary.

Solution: Add a "How to Play" overlay at the start of the first session. Include a visual encyclopedia (Tooltips or a Help Page) that clearly defines the effects of power-ups and the threats posed by specific obstacles.

## 3. Narrative Pacing (Dialogs)
Issue: Large amounts of text can frustrate players who prefer action over story.

Improvement: Add a Global "Skip" Function.

Solution: Place a "Skip" or "Fast-Forward" button in the corner of dialog sequences. This empowers the user with control over their pace while keeping the script available for story-driven players.

## 4. UI Clarity (Dialog Interface)
Issue: The purpose or flow of the dialog page is currently ambiguous.

Improvement: Refine Text Hierarchy and Placement.

Solution: Standardize the dialog UI by placing a dedicated text box at the bottom of the screen. Use a "Tap to Continue" indicator (like a blinking arrow) to signal that there is more text, making the interaction intuitive.

## 5. Backpack Repetition

Issue: Players feel confused and frustrated by having to repeatedly place the same mandatory items into the backpack every day.

Improvement: Reduce Repetitive Interaction.

Solution: Automatically fix mandatory daily items into permanent backpack slots. Only optional or strategic items remain selectable. This removes redundant actions and streamlines pre-level preparation.

## 6. Lack of Tutorial

Issue: Players are confused about UI elements, movement boundaries, and the effects of obstacles during levels.

Improvement: Introduce Structured Onboarding.

Solution: Add a tutorial sequence before the first gameplay session. The tutorial will clearly explain:

- UI elements (stamina bar, timer, indicators)

- Movement boundaries and playable area

- Obstacle effects and consequences


## 7. Level Length

Issue: Players report that levels feel too long, which reduces engagement and pacing quality.

Improvement: Optimize Level Duration.

Solution: Shorten overall level length by reducing total travel distance or adjusting progression pacing. Maintain challenge while improving tempo and player retention.

## 8. Dialog UI Clarity

Issue: The instruction and interaction flow of the dialog page are unclear to users.

Improvement: Integrate Dialog Guidance into Tutorial.

Solution: Include a clear explanation of dialog interaction within the tutorial. Demonstrate how to proceed (e.g., tap to continue), and ensure visual cues are consistent throughout gameplay.
