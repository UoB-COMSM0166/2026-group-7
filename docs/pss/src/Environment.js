class Environment {
    constructor() {
        this.scrollPos = 0;

        this.defaultBg = null;
        this.defaultBgCycle = [];
        this.defaultBgHeadIndex = 0;
        this.destinationBg = null;

        // Symmetry: 500 (Scenery) | 200 (Sidewalk) | 260 (Lane) | 260 (Lane) | 200 (Sidewalk) | 500 (Scenery)
        this.layout = {
            sceneryW: 500,
            sidewalkW: 200,
            laneW: 260,
            roadStart: 700,
            roadEnd: 1220
        };

        this.bgHeight = 1080;
        this.centerX  = 960;

        this.colors = {
            scenery: color(40, 70, 40),
            sidewalk: color(160, 160, 165),
            road: color(45, 45, 50),
            marking: color(255)
        };

        this.victoryColors = {
            scenery: color(100, 120, 80),
            sidewalk: color(200, 200, 200),
            road: color(80, 80, 100),
            marking: color(255, 200, 0)
        };

        this.victoryFireworks = [];
        this.victoryFireworkCooldown = 0;

        // Weather overlay state
        this.weatherMode = "clear";
        this.raindrops = [];
        this.rainSplashes = [];
        this.rainDropCount = 420;
    }

    loadBackgrounds() {
        // Assets are preloaded in sketch.js; this method is kept for API consistency.
    }

    update(speed) {
        this.scrollPos += speed;

        const bgHeight = 1080;
        const levelPhase = levelController ? levelController.getLevelPhase() : "RUNNING";

        if (levelPhase === "RUNNING" && this.scrollPos > bgHeight) {
            this.scrollPos -= bgHeight;
            if (this.defaultBgCycle && this.defaultBgCycle.length > 0) {
                const n = this.defaultBgCycle.length;
                // The top tile becomes the next full-screen tile after wrap.
                this.defaultBgHeadIndex = ((this.defaultBgHeadIndex - 1) % n + n) % n;
            }
        }

        this.updateWeather();
    }

    display() {
        const levelPhase = levelController ? levelController.getLevelPhase() : "RUNNING";
        const defaultBg = this.defaultBg;
        const destinationBg = this.destinationBg;

        imageMode(CORNER);

        if (levelPhase === "RUNNING") {
            const bgHeight = 1080;
            const scrollY = this.scrollPos % bgHeight;
            const tileShift = Math.floor(this.scrollPos / bgHeight);
            const bgA = this.getDefaultBgByTileIndex(this.defaultBgHeadIndex - tileShift) || defaultBg;
            const bgB = this.getDefaultBgByTileIndex(this.defaultBgHeadIndex - tileShift - 1) || defaultBg;
            if (bgA && bgB) {
                image(bgA, 0, scrollY);
                image(bgB, 0, scrollY - bgHeight);
            } else {
                this.displayFallbackRoad(this.colors);
            }
        }
        else if (levelPhase === "VICTORY_TRANSITION") {
            const bgHeight = 1080;
            const scrollY = this.scrollPos % bgHeight;
            const tileShift = Math.floor(this.scrollPos / bgHeight);
            const bgA = this.getDefaultBgByTileIndex(this.defaultBgHeadIndex - tileShift) || defaultBg;
            const bgB = this.getDefaultBgByTileIndex(this.defaultBgHeadIndex - tileShift - 1) || defaultBg;

            if (bgA && bgB) {
                image(bgA, 0, scrollY);
                image(bgB, 0, scrollY - bgHeight);
            } else {
                this.displayFallbackRoad(this.colors);
            }

            if (destinationBg) {
                const scrolledSinceVictory = this.scrollPos - levelController.victoryStartScrollPos;
                const preRoll = Math.max(0, Number(levelController.victoryPreRollDistance) || 0);
                const destinationProgress = scrolledSinceVictory - preRoll;
                const destinationBgHeight = destinationBg.height || 1080;

                if (destinationProgress >= 0) {
                    const victoryEntryY = destinationProgress - destinationBgHeight;
                    image(destinationBg, 0, victoryEntryY);
                    this.drawVictoryMadeText(destinationProgress, true);
                }
            }
        }
        else if (levelPhase === "VICTORY_ZONE") {
            if (destinationBg) {
                const bgHeight = destinationBg.height || 1080;
                const victoryY = levelController.victoryZoneStartY;
                image(destinationBg, 0, victoryY);
                if (victoryY < 0) {
                    image(destinationBg, 0, victoryY + bgHeight);
                }
                this.drawVictoryMadeText(0, false);
            } else {
                this.displayFallbackRoad(this.victoryColors);
            }
        }
        else {
            console.warn("[Environment] Background images not loaded, using fallback colors");
            const colors = (levelPhase === "RUNNING") ? this.colors : this.victoryColors;
            this.displayFallbackRoad(colors);
        }

        this.drawWeatherOverlay();
    }

    displayFallbackRoad(colors = this.colors) {
        noStroke();
        rectMode(CORNER);

        fill(colors.scenery);
        rect(0, 0, this.layout.sceneryW, height);
        rect(1420, 0, this.layout.sceneryW, height);

        fill(colors.sidewalk);
        rect(500, 0, this.layout.sidewalkW, height);
        rect(1220, 0, this.layout.sidewalkW, height);

        fill(colors.road);
        rect(this.layout.roadStart, 0, this.layout.laneW * 2, height);

        this.drawCenterLine(colors);
    }

    configureWeather(themeKey) {
        if (themeKey === "heavyRain") this.weatherMode = "heavyRain";
        else if (themeKey === "lightRain") this.weatherMode = "lightRain";
        else this.weatherMode = "clear";
        this.resetWeather();
    }

    resetWeather() {
        this.raindrops = [];
        this.rainSplashes = [];
        if (this.weatherMode === "clear") return;

        for (let i = 0; i < this.rainDropCount; i++) {
            this.raindrops.push(this.createRaindrop(true));
        }
    }

    exportStateSnapshot() {
        return {
            scrollPos: this.scrollPos,
            defaultBgHeadIndex: this.defaultBgHeadIndex,
            weatherMode: this.weatherMode
        };
    }

    restoreStateSnapshot(snapshot) {
        if (!snapshot) return;
        if (Number.isFinite(Number(snapshot.scrollPos))) {
            this.scrollPos = Math.max(0, Number(snapshot.scrollPos));
        }
        if (Number.isFinite(Number(snapshot.defaultBgHeadIndex))) {
            this.defaultBgHeadIndex = Math.max(0, Math.floor(Number(snapshot.defaultBgHeadIndex)));
        }
        if (typeof snapshot.weatherMode === "string") {
            this.weatherMode = snapshot.weatherMode;
            this.resetWeather();
        }
    }

    createRaindrop(spawnAnywhere = false) {
        const isHeavy = this.weatherMode === "heavyRain";
        const drop = {
            x: random(width),
            y: spawnAnywhere ? random(height) : random(-220, -80),
            z: random(0, 20)
        };
        drop.len = isHeavy
            ? map(drop.z, 0, 20, 18, 34)
            : map(drop.z, 0, 20, 14, 26);
        drop.yspeed = isHeavy
            ? map(drop.z, 0, 20, 18, 32)
            : map(drop.z, 0, 20, 12, 21);
        drop.xspeed = isHeavy
            ? map(drop.z, 0, 20, -1.6, -3.2)
            : map(drop.z, 0, 20, -0.6, -1.3);
        return drop;
    }

    respawnRaindrop(drop) {
        const isHeavy = this.weatherMode === "heavyRain";
        drop.x = random(width + 120);
        drop.y = random(-220, -80);
        drop.z = random(0, 20);
        drop.len = isHeavy
            ? map(drop.z, 0, 20, 18, 34)
            : map(drop.z, 0, 20, 14, 26);
        drop.yspeed = isHeavy
            ? map(drop.z, 0, 20, 18, 32)
            : map(drop.z, 0, 20, 12, 21);
        drop.xspeed = isHeavy
            ? map(drop.z, 0, 20, -1.6, -3.2)
            : map(drop.z, 0, 20, -0.6, -1.3);
    }

    updateWeather() {
        if (this.weatherMode === "clear") return;
        const isHeavy = this.weatherMode === "heavyRain";

        for (const drop of this.raindrops) {
            drop.x += drop.xspeed;
            drop.y += drop.yspeed;

            if (drop.y > height + 8 || drop.x < -20) {
                if (isHeavy && random() < 0.45) {
                    this.rainSplashes.push({
                        x: constrain(drop.x, 0, width),
                        y: height - random(10, 30),
                        alpha: 175,
                        w: random(7, 13)
                    });
                }
                this.respawnRaindrop(drop);
            }
        }

        for (let i = this.rainSplashes.length - 1; i >= 0; i--) {
            const splash = this.rainSplashes[i];
            splash.alpha -= 11;
            splash.w += 2.8;
            if (splash.alpha <= 0) this.rainSplashes.splice(i, 1);
        }
    }

    drawWeatherOverlay() {
        if (this.weatherMode === "clear") return;
        const isHeavy = this.weatherMode === "heavyRain";

        push();
        strokeCap(SQUARE);
        for (const drop of this.raindrops) {
            const thick = isHeavy
                ? map(drop.z, 0, 20, 2.2, 4.2)
                : map(drop.z, 0, 20, 1.0, 2.1);
            strokeWeight(thick);
            stroke(225, 235, 255, isHeavy ? 190 : 105);
            line(drop.x, drop.y, drop.x - (isHeavy ? 7 : 3), drop.y + drop.len);
        }

        if (!isHeavy) {
            noStroke();
            fill(120, 145, 170, 32);
            rectMode(CORNER);
            rect(0, 0, width, height);
        } else {
            noFill();
            for (const splash of this.rainSplashes) {
                stroke(240, 245, 255, splash.alpha);
                strokeWeight(1.6);
                ellipse(splash.x, splash.y, splash.w, splash.w * 0.52);
            }
        }
        pop();
    }

    drawCenterLine(colors = this.colors) {
        push();
        stroke(colors.marking);
        strokeWeight(6);

        let centerX = 960;
        let segment = 120; // dash (60) + gap (60)

        for (let y = this.scrollPos - segment; y < height; y += segment) {
            line(centerX, y, centerX, y + 60);
        }
        pop();
    }

    getDefaultBgByTileIndex(tileIndex) {
        if (!this.defaultBgCycle || this.defaultBgCycle.length === 0) return null;
        const n = this.defaultBgCycle.length;
        const idx = ((tileIndex % n) + n) % n;
        return this.defaultBgCycle[idx];
    }

    drawVictoryMadeText(destinationProgress, isMoving) {
        const message = "I made it!";
        const startY = height + 120;
        const settleY = 150;
        const transitionDistance = (this.destinationBg && this.destinationBg.height) || 1080;
        const t = isMoving ? constrain(destinationProgress / transitionDistance, 0, 1) : 1;
        const easedT = 1 - pow(1 - t, 2.2);
        const y = lerp(startY, settleY, easedT);

        push();
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        const pulse = 1 + sin(frameCount * 0.12) * 0.04;
        textSize(140 * pulse);
        noStroke();
        fill(0, 0, 0, 120);
        text(message, width / 2 + 6, y + 6);

        stroke(70, 40, 20);
        strokeWeight(10);
        fill(255, 245, 150);
        text(message, width / 2, y);

        this.updateAndDrawVictoryFireworks(y, isMoving);

        const sparkCount = 12;
        for (let i = 0; i < sparkCount; i++) {
            const side = (i % 2 === 0) ? -1 : 1;
            const spreadX = 210 + (i % 6) * 72;
            const wave = sin((frameCount * 0.09) + i * 0.8) * 18;
            const sx = width / 2 + side * spreadX + wave;
            const sy = y + ((i % 3) - 1) * 56 + cos((frameCount * 0.12) + i * 1.2) * 10;
            const twinkle = 0.5 + 0.5 * sin(frameCount * 0.16 + i * 1.7);
            const starAlpha = 110 + 145 * twinkle;
            const starOuter = 8 + twinkle * 5;
            const starInner = starOuter * 0.45;

            noStroke();
            for (let k = 1; k <= 4; k++) {
                fill(255, 235, 170, starAlpha * (0.16 - k * 0.028));
                circle(sx - k * side * 2.0, sy + k * 9, 9 - k * 1.5);
            }

            fill(255, 245, 185, starAlpha);
            this.drawSparkleStar(sx, sy, starOuter, starInner, 5);
        }
        pop();
    }

    drawSparkleStar(cx, cy, outerR, innerR, points) {
        beginShape();
        const step = TWO_PI / points;
        for (let a = -HALF_PI; a < TWO_PI - HALF_PI; a += step) {
            vertex(cx + cos(a) * outerR, cy + sin(a) * outerR);
            vertex(cx + cos(a + step / 2) * innerR, cy + sin(a + step / 2) * innerR);
        }
        endShape(CLOSE);
    }

    updateAndDrawVictoryFireworks(textY, isMoving) {
        if (this.victoryFireworkCooldown > 0) this.victoryFireworkCooldown--;
        const spawnChance = isMoving ? 0.12 : 0.08;
        if (this.victoryFireworkCooldown <= 0 && random() < spawnChance) {
            const cx = width / 2 + random(-480, 480);
            const cy = textY + random(-180, 70);
            this.spawnVictoryFireworkBurst(cx, cy);
            this.victoryFireworkCooldown = Math.floor(random(7, 14));
        }

        for (let i = this.victoryFireworks.length - 1; i >= 0; i--) {
            const p = this.victoryFireworks[i];
            p.px = p.x;
            p.py = p.y;
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.035;
            p.life--;

            const alpha = 255 * (p.life / p.maxLife);
            stroke(p.r, p.g, p.b, alpha * 0.45);
            strokeWeight(2);
            line(p.px, p.py, p.x, p.y);
            noStroke();
            fill(p.r, p.g, p.b, alpha);
            circle(p.x, p.y, 3.2);

            if (p.life <= 0) this.victoryFireworks.splice(i, 1);
        }
    }

    spawnVictoryFireworkBurst(cx, cy) {
        const count = 22;
        const baseHue = random(0, 1);
        for (let i = 0; i < count; i++) {
            const a = random(TWO_PI);
            const speed = random(1.6, 4.2);
            const c = this.getFireworkColor(baseHue, i);
            this.victoryFireworks.push({
                x: cx,
                y: cy,
                px: cx,
                py: cy,
                vx: cos(a) * speed,
                vy: sin(a) * speed - random(0.2, 0.9),
                life: Math.floor(random(20, 34)),
                maxLife: 34,
                r: c.r,
                g: c.g,
                b: c.b
            });
        }
    }

    getFireworkColor(baseHue, idx) {
        const t = (baseHue + idx * 0.07) % 1;
        const r = 190 + 65 * sin(TWO_PI * (t + 0.00));
        const g = 190 + 65 * sin(TWO_PI * (t + 0.33));
        const b = 190 + 65 * sin(TWO_PI * (t + 0.66));
        return { r: constrain(r, 120, 255), g: constrain(g, 120, 255), b: constrain(b, 120, 255) };
    }
}
