// Main Menu Refactor
// Responsibilities: Implementation of horizontal navigation, button animations, unified input routing, and scene transitions.

class MainMenu {
    /**
     * CONSTRUCTOR: INTERFACE INITIALIZATION
     * Initializes menu states, navigation arrays, UI components, and the transition controller.
     */
    constructor() {
        // Defines the active sub-scene within the menu architecture
        this.menuState = "HOME"; 
        
        // Component: Circular level selection interface (Contributor: Level Designer)
        this.timeWheel = new TimeWheel(DAYS_CONFIG);
        
        // Navigation Logic: Primary index for tracking keyboard/mouse focus
        this.currentIndex = 0; 
        this.buttons = [];
        this.setupButtons();

        // UI Component: Universal Back Button for sub-menus (Positioned at 80, 60)
        this.backButton = new UIButton(80, 60, 60, 60, "BACK_ARROW", () => {
            this.handleBackAction();
        });

        // DUAL SLIDER SYSTEM: Synchronized with global audio engine constants
        this.bgmSlider = new UISlider(width / 2, height / 2 - 40, 400, 0, 1, masterVolumeBGM, "BGM VOLUME");
        this.sfxSlider = new UISlider(width / 2, height / 2 + 80, 400, 0, 1, masterVolumeSFX, "SFX VOLUME");
    }

    /**
     * CORE: UNIFIED BACK ACTION
     * Centralized logic for returning to the HOME screen with transition support.
     */
    handleBackAction() {
        if (globalFade.isFading) return; // Prevent input during transition
        playSFX(sfxClick); 
        triggerTransition(() => {
        this.menuState = "HOME";
        }); 
    }

    /**
     * LAYOUT CALCULATION: HORIZONTAL ALIGNMENT
     * Positions primary navigation buttons and assigns transition-based callbacks.
     */
    setupButtons() {
        let centerY = height - 250; 
        let spacing = 320; 

        this.buttons.push(new UIButton(width/2 - spacing, centerY, 256, 96, "START", () => {
            triggerTransition(() => { this.menuState = "SELECT"; });
        }));

        this.buttons.push(new UIButton(width/2, centerY, 256, 96, "HELP", () => {
            triggerTransition(() => { this.menuState = "HELP"; });
        }));

        this.buttons.push(new UIButton(width/2 + spacing, centerY, 256, 96, "SETTINGS", () => {
            triggerTransition(() => { this.menuState = "SETTINGS"; });
        }));
    }

    /**
     * RENDERING: TOP-LEVEL VIEWPORT
     * Manages background drawing and delegates sub-screen rendering.
     */
    display() {
        if (assets.menuBg) {
            image(assets.menuBg, 0, 0, width, height);
        } else {
            background(20); 
        }

        // Scene Routing
        switch(this.menuState) {
            case "HOME":     this.drawHomeScreen(); break;
            case "SELECT":   this.drawSelectScreen(); break;
            case "SETTINGS": this.drawSettingsScreen(); break;
            case "HELP":     this.drawHelpScreen(); break;
        }

        // Global UI Layer: Back Button
        if (this.menuState !== "HOME") {
            this.backButton.isFocused = this.backButton.checkMouse(mouseX, mouseY);
            this.backButton.update();
            this.backButton.display();
        }

    }

    /**
     * RENDERING: HOME SCREEN
     */
    drawHomeScreen() {
        drawLogoPlaceholder(width/2, 320);

        for (let i = 0; i < this.buttons.length; i++) {
            // Lock focus selection if a transition is active
            if (!this.isFading && this.buttons[i].checkMouse(mouseX, mouseY)) {
                this.currentIndex = i;
            }
            this.buttons[i].isFocused = (this.currentIndex === i);
            this.buttons[i].update();
            this.buttons[i].display();
        }
    }

    /**
     * RENDERING: HELP INTERFACE
     */
    drawHelpScreen() {
        push();
        fill(0, 0, 0, 200);
        rect(0, 0, width, height);
        textAlign(CENTER, CENTER);
        textFont(fonts.title);
        fill(255, 215, 0);
        textSize(50);
        text("HELP & CONTROLS", width / 2, 150);

        textFont(fonts.body);
        fill(255);
        textSize(24);
        text("WASD / ARROWS - MOVE", width / 2, height / 2 - 50);
        text("ENTER - CONFIRM  /  ESC - BACK", width / 2, height / 2 + 50);
        
        fill(150);
        text("PRESS ESC TO RETURN", width / 2, height - 100);
        pop();
    }

    /**
     * RENDERING: LEVEL SELECTOR
     */
    drawSelectScreen() {
        this.timeWheel.display();
        push();
        textFont(fonts.body);
        textAlign(CENTER, CENTER);
        fill(255, 150); 
        textSize(20);
        text("PRESS ENTER TO START  /  ESC TO BACK", width / 2, height - 80);
        pop();
    }

    /**
     * RENDERING: SETTINGS INTERFACE
     */
    drawSettingsScreen() {
        push();
        textAlign(CENTER, CENTER);
        textFont(fonts.title);
        fill(255, 215, 0); 
        textSize(50);
        text("SETTINGS", width / 2, height / 2 - 180);

        this.bgmSlider.display();
        this.sfxSlider.display();

        masterVolumeBGM = this.bgmSlider.value;
        masterVolumeSFX = this.sfxSlider.value;
        if (bgm) bgm.setVolume(masterVolumeBGM);

        textFont(fonts.body);
        fill(150); 
        textSize(20);
        text("PRESS ESC TO BACK", width / 2, height - 80);
        pop();
    }

    /**
     * INPUT HANDLING: KEYBOARD EVENTS
     */
    handleKeyPress(key, keyCode) {
        if (this.isFading) return; 

        if (this.menuState === "HOME") {
            if (keyCode === LEFT_ARROW || keyCode === 65 || keyCode === RIGHT_ARROW || keyCode === 68) {
                playSFX(sfxSelect);
                if (keyCode === LEFT_ARROW || keyCode === 65) {
                    this.currentIndex = (this.currentIndex - 1 + this.buttons.length) % this.buttons.length;
                } else {
                    this.currentIndex = (this.currentIndex + 1) % this.buttons.length;
                }
            } else if (keyCode === ENTER || keyCode === 13) {
                playSFX(sfxClick);
                this.buttons[this.currentIndex].handleClick(); 
            }
        } 
        else {
            if (keyCode === ESCAPE) {
                this.handleBackAction();
            }

            if (this.menuState === "SELECT") {
                this.timeWheel.handleInput(keyCode);
                if (keyCode === ENTER || keyCode === 13) {
                    setupRun(this.timeWheel.selectedDay);
                }
            }
        }
    }

    /**
     * INPUT HANDLING: MOUSE CLICK ROUTING
     */
    handleClick(mx, my) {
        if (this.isFading) return; 

        if (this.menuState === "HOME") {
            for (let btn of this.buttons) {
                if (btn.checkMouse(mx, my)) {
                    btn.handleClick();
                }
            }
        } else {
            if (this.backButton.checkMouse(mx, my)) {
                this.backButton.handleClick();
            }

            if (this.menuState === "SETTINGS") {
                this.bgmSlider.handlePress(mx, my);
                this.sfxSlider.handlePress(mx, my);
            }
        }
    }

    /**
     * INPUT HANDLING: MOUSE RELEASED
     */
    handleRelease() {
        if (this.menuState === "SETTINGS") {
            this.bgmSlider.handleRelease();
            this.sfxSlider.handleRelease();
        }
    }
}