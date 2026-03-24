<div align="center">

# Lab 2: Interactive Paint System & Game Brainstorming

<br>

## Summary

| Deliverable | Description | Status |
|:---:|:---|:---|
| **Paint Application** | Advanced p5.js drawing tool with 7 brushes & symmetry | [Live Demo](#live-demo--source) |
| **Idea 1: Survival** | Park Street Survivor (Top-down roguelike) | [Selected](#1-park-street-survivor-top-down-survival) |
| **Idea 2: Co-op** | The Strongest Support (Asymmetric cooperative) | [Selected](#2-the-strongest-support-asymmetric-cooperative) |

<br>

---

## Part 1: Interactive Paint Tool

</div>

> The primary objective of Lab 2 was to develop a **Feature-Rich Drawing Application** using p5.js. This project demonstrates advanced canvas manipulation, including layered rendering, custom brush physics, and interactive UI systems.

<br>

<div align="center">

### Live Demo & Source

[**[ Click Here to Run Paint App ]**](https://uob-comsm0166.github.io/2026-group-7/docs/Labs/Week_2_Paint_App/)

[**View Source Code (sketch.js)**](./sketch.js)

<br>

---

### Catalog of Features

| Category | Functionality | Key Mechanism |
|:---:|:---|:---|
| **Brushes** | 5 Unique Brush Types | `switch()` state management |
| **Physics** | Speed-based Stroke | `dist(mouseX, mouseY, pmouseX, pmouseY)` |
| **Symmetry** | Multi-axis Mirroring | Coordinate mapping logic |
| **Systems** | 20-Step Undo History | `p5.Image` snapshot stack |

<br>

---

### Core System Overview

</div>

**Interactive Brushes**
* **Basic & Spray:** Classic line drawing and Gaussian-distributed particle spray.
* **Speed-Sensitive Stroke:** Dynamic `strokeWeight` that adapts based on mouse velocity.
* **Image Brush:** Custom SVG/Image textures with randomized rotation (`random(TWO_PI)`) for varied strokes.
* **Auto-Scribbler:** An autonomous-feel brush that nudges vertex positions for organic textures.

**System Functionalities**
* **Layered Architecture:** Separate `p5.Graphics` layers for the background, grid paper, drawing, and UI guides.
* **Undo System:** A 20-step snapshot history allowing users to revert actions via `Z` key.
* **Symmetry Suite:** Real-time Horizontal, Vertical, and Quadrant symmetry mapping.
* **Dual-Mode Eraser:** Supports both Transparency Erasing (revealing grid) and Cover Erasing (painting background).

**Implemented Challenges**
* **Keyboard Shortcuts:** Full integration of `keyPressed()` for brush switching (1-7), saving (S), and clearing (C).
* **Grid Paper System:** Implementation of nested `for` loops to generate a coordinate-accurate background grid.
* **Dynamic HUD:** On-screen documentation using `text()` and console feedback via `print()`.
* **File Management:** Custom canvas resizing and high-quality JPG export.

<br>

---

<div align="center">

## Part 2: Final Game Ideas Selection

</div>

> Based on our brainstorming sessions, we have decided to progress with the following **TWO IDEAS** for next week's workshop, balancing technical feasibility with creative gameplay.

<br>

### 1. Park Street Survivor (Top-down Survival)
This is a fast-paced, top-down roguelike survival game set in the iconic Park Street of Bristol. Players must navigate through waves of increasingly difficult obstacles (inspired by local Bristol elements like seagulls or steep hills) while collecting "academic credits" to level up. The core mechanic focuses on strategic positioning and weapon upgrades, drawing inspiration from *Vampire Survivors*, but with a distinct local aesthetic that captures the unique challenge of climbing Bristol's famous slopes.

<br>

<p align="center">
  <b>Road Fighter (Vertical Scrolling & Obstacle Avoidance)</b><br>
  <img src="../Week_1_List_of_Ideas/assets/CY_Road_Fighter.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

<p align="center">
  <b>Crossy Road (Voxel Aesthetic & Grid-based Movement)</b><br>
  <img src="../Week_1_List_of_Ideas/assets/CY_Crossy_Road.png" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

### 2. The Strongest Support (Asymmetric Cooperative)
A unique asymmetric cooperative game where one player takes on the role of the "Hero" facing challenges, while the other plays as the "Strongest Support." Unlike traditional co-op games, the supporter doesn't fight directly but manipulates the environment, provides strategic buffs, and manages resources to ensure the Hero's survival. This idea emphasizes communication and interdependent mechanics, drawing inspiration from *Keep Talking and Nobody Explodes* and *It Takes Two*, focusing on the "invisible hand" that guides a hero to victory.

<br>

<p align="center">
  <b>Monolith (Pixel-art Style Reference)</b><br>
  <img src="../Week_1_List_of_Ideas/assets/LP_Monolith.jpg" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

<p align="center">
  <b>Lemmings (Indirect Control Reference)</b><br>
  <img src="../Week_1_List_of_Ideas/assets/LP_Lemmings.jpg" width="800" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #ddd;" />
</p>

<br>

<div align="center">


---

<div align="center">

[Back to Project Home](../../../README.md)

</div>
