# Technical Sustainability

## SusAD Effect Chain

```mermaid
flowchart TD
    A[CDN-only dependency\np5.js loaded from cdnjs] -->|single point of failure| B[Game unavailable\nif CDN goes down]
    B -->|impacts| C([Technical])

    D[No noLoop call\n60fps draw always running] -->|continuous CPU load| E[Unnecessary energy use\non idle/paused screens]
    E -->|impacts| F([Environmental])
    E -->|impacts| C

    G[TestingPanel\nbundled in production] -->|instantiated every session\ndrawn every frame| H[Increased parse time\n+ memory overhead]
    H -->|impacts| C

    I[Separated engine systems\nObstacle / Level / Dialogue / Save] -->|modular, extendable| J[Easier maintenance\nand future development]
    J -->|positive impact| C

    style C fill:#f9c74f
    style F fill:#90be6d
```

## Analysis

Overall, Park Street Survivor is well-structured because the engine is built around separated systems — obstacle management, level control, dialogue, and save — which makes it extendable and easier to maintain over time.

However, there are three technical sustainability concerns worth addressing.

The first is our CDN dependency. Both p5.js and p5.sound are loaded directly from cdnjs.cloudflare.com at runtime. There is no local fallback, so if the CDN goes down, the game simply does not load.

The second is the draw loop. p5.js calls `draw()` at 60 frames per second and we never call `noLoop()` — not during the pause menu, not on static screens, not on the main menu. This means the game continuously redraws even when nothing has changed, putting unnecessary load on the CPU.

The third is `TestingPanel`. We built this as a developer tool during development and the file is intentionally kept in the codebase. However, before final submission the entry points — instantiation and the draw call — will be removed so it does not run in the shipped version. This is the right approach: keeping the file available for development while making sure it does not add unnecessary overhead in production.

The CDN dependency and draw loop throttling remain as clear targets for a future improvement pass.
