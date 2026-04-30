// Park Street Survivor - Dialogue Box
// Responsibilities: Reusable typewriter-style dialogue overlay.
// Renders a bottom-screen bar with a character portrait and word-by-word text reveal.
// Any scene or system can trigger a line by calling trigger(text, portrait, speakerName).

class DialogueBox {

    hasRenderablePortrait(portrait) {
        return !!(portrait && portrait.width > 0 && portrait.height > 0);
    }

    resolvePortraitBySpeaker(speakerName) {
        if (typeof assets === 'undefined' || !speakerName) return null;

        const raw = String(speakerName).trim().toUpperCase();
        const key = raw.replace(/[^A-Z]/g, '');
        const map = {
            IRIS: 'portraitPlayerNormal',
            WIOLA: 'portraitWiola',
            LAYLA: 'portraitLayla',
            RAYMOND: 'portraitRaymond',
            LYDIA: 'portraitLydia',
            CHARLOTTE: 'portraitCharlotte'
        };

        let assetKey = map[key] || null;
        if (!assetKey) {
            if (key.indexOf('IRIS') >= 0) assetKey = 'portraitPlayerNormal';
            else if (key.indexOf('WIOLA') >= 0) assetKey = 'portraitWiola';
            else if (key.indexOf('LAYLA') >= 0) assetKey = 'portraitLayla';
            else if (key.indexOf('RAYMOND') >= 0) assetKey = 'portraitRaymond';
            else if (key.indexOf('LYDIA') >= 0) assetKey = 'portraitLydia';
            else if (key.indexOf('CHARLOTTE') >= 0) assetKey = 'portraitCharlotte';
        }
        const portrait = assetKey ? (assets[assetKey] || null) : null;
        return this.hasRenderablePortrait(portrait) ? portrait : null;
    }

    drawNineSlice(img, x, y, w, h, cap) {
        if (!img) return;
        const iw = img.width;
        const ih = img.height;
        const c = max(1, min(cap, floor(iw / 2), floor(ih / 2)));

        const midSrcW = max(1, iw - c * 2);
        const midSrcH = max(1, ih - c * 2);
        const midDstW = max(1, w - c * 2);
        const midDstH = max(1, h - c * 2);

        image(img, x, y, c, c, 0, 0, c, c);
        image(img, x + c, y, midDstW, c, c, 0, midSrcW, c);
        image(img, x + c + midDstW, y, c, c, iw - c, 0, c, c);

        image(img, x, y + c, c, midDstH, 0, c, c, midSrcH);
        image(img, x + c, y + c, midDstW, midDstH, c, c, midSrcW, midSrcH);
        image(img, x + c + midDstW, y + c, c, midDstH, iw - c, c, c, midSrcH);

        image(img, x, y + c + midDstH, c, c, 0, ih - c, c, c);
        image(img, x + c, y + c + midDstH, midDstW, c, c, ih - c, midSrcW, c);
        image(img, x + c + midDstW, y + c + midDstH, c, c, iw - c, ih - c, c, c);
    }

    drawPortraitMasked(portrait, x, y, w, h, radius) {
        if (!portrait) return;

        const boxRatio = w / h;
        const imgRatio = portrait.width / portrait.height;

        let sx = 0;
        let sy = 0;
        let sw = portrait.width;
        let sh = portrait.height;

        if (imgRatio > boxRatio) {
            sw = portrait.height * boxRatio;
            sx = (portrait.width - sw) * 0.5;
        } else {
            sh = portrait.width / boxRatio;
            sy = (portrait.height - sh) * 0.5;
        }

        const ctx = drawingContext;
        if (!ctx || typeof ctx.save !== 'function' || typeof ctx.clip !== 'function') {
            image(portrait, x, y, w, h, sx, sy, sw, sh);
            return;
        }

        try {
            ctx.save();
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(x, y, w, h, radius);
            } else {
                ctx.rect(x, y, w, h);
            }
            ctx.clip();
            image(portrait, x, y, w, h, sx, sy, sw, sh);
            ctx.restore();
        } catch (e) {
            if (ctx && typeof ctx.restore === 'function') ctx.restore();
            image(portrait, x, y, w, h, sx, sy, sw, sh);
        }
    }

    constructor() {
        this.timerMax       = 120;
        // after testing: enough to follow and read the whole sentence
        this.wordsPerSecond = 16;
        this.typingSfx      = (typeof sfxDialogue !== 'undefined') ? sfxDialogue : null;
        /** When true the box stays visible until the player advances manually. */
        this.persistent     = false;
        /** When true, show an auto-play indicator instead of the click-to-advance triangle. */
        this.autoPlayMode   = false;
        this.reset();
    }

    /** Resets per-line state to inactive. Does NOT reset `persistent`. */
    reset() {
        this.active         = false;
        this.timer          = 0;
        this.portraitImg    = null;
        this.fullText       = "";
        this.words          = [];
        this.wordIndex      = 0;
        this.displayedText  = "";
        this.wordTickMs     = 0;
        this.speakerName    = "";
        this.options        = null;
        this.onOptionSelect = null;  // (opt, index) => void — intercepts option clicks
        this.highlight      = null;  // [{start,end}] character ranges to render in red
    }

    trigger(text, portrait, speakerName, options = null, highlight = null) {
        this.active        = true;
        this.timer         = this.timerMax;
        const explicitPortrait = this.hasRenderablePortrait(portrait) ? portrait : null;
        this.portraitImg   = explicitPortrait || this.resolvePortraitBySpeaker(speakerName) || null;
        this.fullText      = text;
        this.words         = text.trim().split(/\s+/);
        this.wordIndex     = 0;
        this.displayedText = "";
        this.wordTickMs    = 0;
        this.speakerName   = speakerName || "";
        this.options       = options;
        this.highlight     = (highlight && highlight.length > 0) ? highlight : null;
    }

    /** Renders word-by-word with highlighted character ranges drawn in red, replicating p5 word-wrap. */
    _drawHighlightedText(displayedText, hlRanges, tx, ty, tw, th) {
        if (!displayedText) return;
        const lh  = textLeading() || textSize() * 1.2;
        const spW = textWidth(' ');
        let cx = tx, cy = ty;
        let i = 0;
        const len = displayedText.length;

        while (i < len) {
            const ch = displayedText[i];
            if (ch === '\n') { cx = tx; cy += lh; i++; continue; }
            if (ch === ' ')  { cx += spW; i++; continue; }

            let j = i;
            while (j < len && displayedText[j] !== ' ' && displayedText[j] !== '\n') j++;
            const word = displayedText.slice(i, j);
            const wW   = textWidth(word);

            if (cx + wW > tx + tw && cx > tx) {
                cx = tx; cy += lh;
                if (cy > ty + th) break;
            }

            // Use i < r.end (not j) so trailing punctuation doesn't break the range check.
            const isHl = hlRanges.some(r => i >= r.start && i < r.end);
            fill(isHl ? color(255, 60, 60) : color(255));
            text(word, cx, cy);
            cx += wW;
            i = j;
        }
    }

    isActive() {
        return this.active && (this.persistent || this.timer > 0);
    }

    isFinishedTyping() {
        return this.wordIndex >= this.words.length;
    }

    skipToEnd() {
        this.displayedText = this.fullText;
        this.wordIndex     = this.words.length;
    }

    /** Updates typewriter animation and renders the dialogue bar for one frame. */
    display() {
        if (!this.active) return;

        if (!this.persistent) {
            if (this.timer <= 0) return;
            this.timer--;
        }

        if (this.wordIndex < this.words.length) {
            const dtMs = (typeof deltaTime === 'number' && isFinite(deltaTime) && deltaTime > 0)
                ? deltaTime
                : (1000 / 60);
            this.wordTickMs += dtMs;

            const intervalMs = 1000 / max(1, this.wordsPerSecond);
            let appendedCount = 0;
            while (this.wordTickMs >= intervalMs && this.wordIndex < this.words.length) {
                this.wordTickMs -= intervalMs;
                let w = this.words[this.wordIndex];
                this.displayedText += (this.displayedText ? " " : "") + w;
                this.wordIndex++;
                appendedCount++;
            }
            if (appendedCount > 0 && typeof playSFX === "function" && this.typingSfx) {
                playSFX(this.typingSfx);
            }
        }

        const DESIGN_W = 1920;
        const DESIGN_H = 1080;
        const s = min(width / DESIGN_W, height / DESIGN_H);

        const UI = {
            dialog: { x: 0, y: 685, w: 1920, h: 395 },
            frame: { x: 35, y: 722, w: 320, h: 320 },
            name: { xPortrait: 400, xNarrative: 100, y: 722, minW: 172, h: 65, cap: 13 },
            text: {
                xPortrait: 400,
                yPortrait: 814,
                xNarrative: 100,
                yNarrative: 813,
                rightPad: 92,
                bottomPad: 24
            },
            triangle: { x: 1836, y: 1005, w: 50, h: 35, amp: 10, speed: 0.06 }
        };

        const hasPortrait = this.hasRenderablePortrait(this.portraitImg);
        const barY = UI.dialog.y * s;
        const tx = (hasPortrait ? UI.text.xPortrait : UI.text.xNarrative) * s;
        const ty = (hasPortrait ? UI.text.yPortrait : UI.text.yNarrative) * s;
        const tw = max(120 * s, (DESIGN_W - (hasPortrait ? UI.text.xPortrait : UI.text.xNarrative) - UI.text.rightPad) * s);
        const th = max(80 * s, (DESIGN_H - (hasPortrait ? UI.text.yPortrait : UI.text.yNarrative) - UI.text.bottomPad) * s);

        push();

        if (typeof assets !== 'undefined' && assets.dialogueBox) {
            imageMode(CORNER);
            image(assets.dialogueBox, UI.dialog.x * s, UI.dialog.y * s, UI.dialog.w * s, UI.dialog.h * s);
        } else {
            rectMode(CORNER);
            noStroke();
            fill(56, 39, 96, 230);
            rect(UI.dialog.x * s, UI.dialog.y * s, UI.dialog.w * s, UI.dialog.h * s);
        }

        if (this.speakerName) {
            const tagX = (hasPortrait ? UI.name.xPortrait : UI.name.xNarrative) * s;
            const tagY = UI.name.y * s;
            const tagH = UI.name.h * s;
            const tagPadX = 24 * s;

            let fT = (typeof fonts !== 'undefined') ? (fonts.title || fonts.body || fonts.dialogueBlue) : null;
            if (fT) textFont(fT);
            textSize(28 * s);
            const tagW = max(UI.name.minW * s, textWidth(this.speakerName) + tagPadX * 2);

            if (typeof assets !== 'undefined' && assets.dialogueNameBox) {
                this.drawNineSlice(assets.dialogueNameBox, tagX, tagY, tagW, tagH, UI.name.cap * s);
            } else {
                rectMode(CORNER);
                noStroke();
                fill(56, 39, 96, 240);
                rect(tagX, tagY, tagW, tagH, 8 * s);
            }

            noStroke();
            fill(255);
            textAlign(CENTER, CENTER);
            text(this.speakerName, tagX + tagW * 0.5, tagY + tagH * 0.5);
        }

        imageMode(CORNER);
        if (hasPortrait) {
            const frameX = UI.frame.x * s;
            const frameY = UI.frame.y * s;
            const frameW = UI.frame.w * s;
            const frameH = UI.frame.h * s;
            const maskInset = 8 * s;

            if (typeof assets !== 'undefined' && assets.dialogueFrameBox) {
                image(assets.dialogueFrameBox, frameX, frameY, frameW, frameH);
            } else {
                noFill();
                stroke(255);
                strokeWeight(2 * s);
                rect(frameX, frameY, frameW, frameH, 40 * s);
            }

            this.drawPortraitMasked(
                this.portraitImg,
                frameX + maskInset,
                frameY + maskInset,
                frameW - maskInset * 2,
                frameH - maskInset * 2,
                40 * s
            );
        }

        let fB = (typeof fonts !== 'undefined') ? (fonts.jersey20 || fonts.dialogueBlue || fonts.body || fonts.title) : null;
        if (fB) textFont(fB);
        textSize(58 * s);
        textLeading(58 * s);
        noStroke();
        textAlign(LEFT, TOP);
        if (this.highlight && this.highlight.length > 0) {
            this._drawHighlightedText(this.displayedText, this.highlight, tx, ty, tw, th);
        } else {
            fill(255);
            text(this.displayedText, tx, ty, tw, th);
        }

        if (this.autoPlayMode) {
            const pulse = 0.55 + 0.45 * abs(sin(frameCount * 0.04));
            textAlign(RIGHT, CENTER);
            textFont(fonts && fonts.body ? fonts.body : null);
            textSize(28 * s);
            noStroke();
            fill(200, 190, 160, 180 * pulse);
            text('AUTO >', UI.triangle.x * s + UI.triangle.w * s, (UI.triangle.y + UI.triangle.h * 0.5) * s);
        } else {
            const triX = UI.triangle.x * s;
            const triBaseY = UI.triangle.y;
            const triY = (triBaseY - abs(sin(frameCount * UI.triangle.speed)) * UI.triangle.amp) * s;
            const triW = UI.triangle.w * s;
            const triH = UI.triangle.h * s;
            noStroke();
            fill(0);
            triangle(triX, triY, triX + triW, triY, triX + triW * 0.5, triY + triH);
        }

        if (this.options && this.isFinishedTyping()) {
            const n      = this.options.length;
            const optH   = 84 * s;
            const optGap = 26 * s;
            const optW   = 820 * s;
            const totalH = n * optH + (n - 1) * optGap;
            const panelCY  = barY * 0.5;
            const startY   = panelCY - totalH / 2;
            const optX     = width / 2 - optW / 2;
            const optPadX  = 28 * s;
            const accentW  = 6 * s;

            let fB = (typeof fonts !== 'undefined') ? (fonts.jersey20 || fonts.body || fonts.title) : null;

            this.options.forEach((opt, idx) => {
                const btnY   = startY + idx * (optH + optGap);
                const isHover = (mouseX > optX && mouseX < optX + optW &&
                                 mouseY > btnY  && mouseY < btnY  + optH);

                push();
                rectMode(CORNER);
                fill(isHover ? color(72, 50, 120, 245) : color(56, 39, 96, 230));
                stroke(isHover ? color(220, 185, 90, 255) : color(180, 148, 72, 160));
                strokeWeight(1.5 * s);
                rect(optX, btnY, optW, optH, 8 * s);

                if (isHover) {
                    noStroke();
                    fill(220, 185, 70, 220);
                    rect(optX, btnY, accentW, optH, 8 * s, 0, 0, 8 * s);
                    cursor(HAND);
                }

                noStroke();
                fill(isHover ? color(255, 225, 120) : color(220, 200, 155));
                if (fB) textFont(fB);
                textSize(32 * s);
                textAlign(LEFT, CENTER);
                text(opt.label, optX + optPadX + (isHover ? accentW : 0), btnY + optH / 2);
                pop();

                if (isHover && mouseIsPressed) {
                    mouseIsPressed = false;  // prevent click-through
                    if (typeof this.onOptionSelect === 'function') {
                    this.onOptionSelect(opt, idx);
                } else {
                    if (typeof opt.cb === 'function') {
                        opt.cb();
                    } else if (opt.nextIndex !== undefined) {
                        if (typeof handleOptionSelect === 'function') handleOptionSelect(opt.nextIndex);
                    }
                }
                }
            });
        }

        pop();

        if (!this.persistent && this.timer <= 0) {
            this.active = false;
        }
    }
}
