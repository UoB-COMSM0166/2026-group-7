// Navigation & Audio Interface
// Responsibilities: Implementation of multi-state menu navigation, volume management, and font-specific rendering logic.

class MainMenu {
    /**
     * CONSTRUCTOR: INTERFACE INITIALIZATION
     * Initializes menu states, navigation arrays, and the centralized audio control system.
     */
    constructor() {
        // Defines the active sub-scene within the menu architecture
        this.menuState = "HOME"; 
        
        // Component: Circular level selection interface (Contributor: Level Designer)
        this.timeWheel = new TimeWheel(DAYS_CONFIG);
        
        // Navigation: Primary menu entries
        this.options = ["START", "SELECT LEVEL", "SETTINGS"];
        this.currentIndex = 0; 

        // DUAL SLIDER SYSTEM: Synchronized with global audio engine constants
        this.bgmSlider = new UISlider(width / 2, height / 2 - 40, 400, 0, 1, masterVolumeBGM, "BGM VOLUME");
        this.sfxSlider = new UISlider(width / 2, height / 2 + 80, 400, 0, 1, masterVolumeSFX, "SFX VOLUME");
    }

    /**
     * RENDERING: TOP-LEVEL VIEWPORT
     * Manages background asset drawing and delegates rendering to specific sub-screens.
     */
    display() {
        // Asset Check: Render background image or fallback to flat color
        if (assets.menuBg) {
            image(assets.menuBg, 0, 0, width, height);
        } else {
            background(20); 
        }

        // Scene Routing: Selects display logic based on current menuState
        if (this.menuState === "HOME") {
            this.drawHomeScreen();
        } else if (this.menuState === "SELECT") {
            this.drawSelectScreen();
        } else if (this.menuState === "SETTINGS") {
            this.drawSettingsScreen();
        }
    }

    /**
     * RENDERING: HOME SCREEN
     * Displays the primary title using the 'Press Start 2P' font and renders the interactive vertical list.
     */
    drawHomeScreen() {
        push();
        textAlign(CENTER, CENTER);
        
        // LAYER: MAIN TITLE (Aesthetic: 8-bit Gold)
        textFont(fonts.title); 
        fill(255, 215, 0); 
        textSize(80); 
        text("PARK STREET", width / 2, height / 2 - 120);
        
        fill(255); 
        textSize(50);
        text("SURVIVOR", width / 2, height / 2 - 30);

        // LAYER: VERTICAL NAVIGATION MENU
        textFont(fonts.body); 
        let startY = height / 2 + 100;
        let spacing = 80;
        
        for (let i = 0; i < this.options.length; i++) {
            let isSelected = (i === this.currentIndex);
            
            // Visual Feedback: Adjust brightness and size based on selection state
            fill(isSelected ? 255 : 150);
            textSize(isSelected ? 40 : 32);
            
            let prefix = isSelected ? "• " : "";
            text(prefix + this.options[i], width / 2, startY + i * spacing);
        }
        pop();
    }

    /**
     * RENDERING: LEVEL SELECTOR
     * Displays the TimeWheel component and provides navigation prompts for level confirmation.
     */
    drawSelectScreen() {
        this.timeWheel.display();
        
        push();
        // Feedback UI: Instructional text for state transitions
        textFont(fonts.body);
        textAlign(CENTER, CENTER);
        fill(255, 150); 
        textSize(20);
        text("PRESS ENTER TO START  /  ESC TO BACK", width / 2, height - 80);
        pop();
    }

    /**
     * RENDERING: SETTINGS INTERFACE
     * Manages the volume slider components and synchronizes values with the global audio engine.
     */
    drawSettingsScreen() {
        push();
        textAlign(CENTER, CENTER);
        textFont(fonts.title);
        fill(255, 215, 0); 
        textSize(50);
        text("SETTINGS", width / 2, height / 2 - 180);

        // Component Integration: Process slider rendering
        this.bgmSlider.display();
        this.sfxSlider.display();

        // LOGIC: DYNAMIC AUDIO SYNC
        // Real-time update of master volume variables and p5.Sound instances
        masterVolumeBGM = this.bgmSlider.value;
        masterVolumeSFX = this.sfxSlider.value;
        if (bgm) bgm.setVolume(masterVolumeBGM);

        // Instruction Layer
        textFont(fonts.body);
        fill(150); 
        textSize(20);
        text("PRESS ESC TO BACK", width / 2, height - 80);
        pop();
    }

    /**
     * ACTION ROUTER: MENU NAVIGATION
     * Executes logic corresponding to the player's selected menu option.
     */
    executeAction() {
        let choice = this.options[this.currentIndex];
        if (choice === "START") {
            setupRun(1); // Standard entry point for Day 1
        } else if (choice === "SELECT LEVEL") {
            this.menuState = "SELECT"; 
        } else if (choice === "SETTINGS") {
            this.menuState = "SETTINGS"; 
        }
    }

    /**
     * INPUT HANDLING: KEYBOARD EVENTS
     * Manages focus shifts, state transitions, and triggers SFX feedback for interactions.
     */
    handleKeyPress(key, keyCode) {
        if (this.menuState === "HOME") {
            // Logic: Vertical Navigation (Arrow keys and WASD support)
            if (keyCode === UP_ARROW || keyCode === 87 || keyCode === DOWN_ARROW || keyCode === 83) {
                playSFX(sfxSelect); // Audio Feedback: Selection swap
                
                if (keyCode === UP_ARROW || keyCode === 87) {
                    this.currentIndex = (this.currentIndex - 1 + this.options.length) % this.options.length;
                } else {
                    this.currentIndex = (this.currentIndex + 1) % this.options.length;
                }
            } else if (keyCode === ENTER || keyCode === 13) {
                playSFX(sfxClick); // Audio Feedback: Confirmation
                this.executeAction();
            }
        } 
        else if (this.menuState === "SELECT") {
            if (keyCode === ESCAPE) this.menuState = "HOME";
            this.timeWheel.handleInput(keyCode);
            
            if (keyCode === ENTER || keyCode === 13) {
                setupRun(this.timeWheel.selectedDay);
            }
        }
        else if (this.menuState === "SETTINGS") {
            if (keyCode === ESCAPE) this.menuState = "HOME";
        }
    }

    /**
     * INPUT HANDLING: MOUSE PRESSED
     * Detects clicks on the slider tracks to allow for volume adjustments.
     */
    handleClick(mx, my) {
        if (this.menuState === "SETTINGS") {
            this.bgmSlider.handlePress(mx, my);
            this.sfxSlider.handlePress(mx, my);
        }
    }

    /**
     * INPUT HANDLING: MOUSE RELEASED
     * Finalizes the slider dragging logic to prevent persistent value changes.
     */
    handleRelease() {
        if (this.menuState === "SETTINGS") {
            this.bgmSlider.handleRelease();
            this.sfxSlider.handleRelease();
        }
    }
}