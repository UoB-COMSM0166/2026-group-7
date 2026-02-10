# Stakeholders
Students of UOB and their family & friends

Staff of UOB

Vertical Scrolling Game fan

Developer & Designer

Team manager


# Epics
Enhance story readability.
Enhance immersive game experience.

# User Stories
As a [type of user], I want [goal or desire], so that [reason of benefit]
1. As a student of UOB, I want to see real-life Bristol street view, so that it brings back university days memory.
2. As a Staff of UOB, I want to attract more people get to know about University of  Bristol, so that we would raise the school's profile.
3. As a Vertical Scrolling Game fan, I want to encounter more obstacles in the game, so that I would feel more challenging about the game.
4. As narrative designer of the game, I want to add unique and attempting storyline, so that our game can attract more players who preferred text-based game.
5. As a citizen of Bristol,  I want to create a game centered on Bristol schools, so that it can promote community engagement and foster a stronger sense of local identity.
6. As level designer of the game, I want to game levels progressively increase in difficulty, so that I can make the game feel easier to pick up and more rewarding to play.
7. **As the game's sound designer,** I want to incorporate ambient city sounds (like the Bristol harbor or Park Street traffic) and a dynamic "Bristol Sound" inspired soundtrack, **so that** the player feels fully immersed in the local atmosphere while navigating obstacles.
8. **As a competitive gamer,** I want to see a score board at the end of each level, **so that** I can share it with other players.
9. **As a Bristol resident and history buff,** I want the game to feature iconic landmarks like the Clifton Suspension Bridge or Wills Memorial Building, **so that** the game feels authentic and celebrates the city’s unique architectural heritage.
10. **As the game’s UI/UX designer,** I want to implement simple, intuitive touch or keyboard controls for the vertical scrolling movement, **so that** the game is accessible to casual players who aren't familiar with complex gaming setups.
# Acceptance Criteria
given [initial context or precondition], when[action or event], then[expected outcome]
### **1. Real-life Street View (Student)**

- **AC:** **Given** I am playing the game, **when** I navigate through specific levels like Park Street or Queens Road, **then** the background assets must display recognizable, high-fidelity textures based on real Bristol street photography.
### **2. Raise School Profile (Staff)**

- **AC:** **Given** the player reaches a "University Hub" checkpoint, **when** they interact with the UOB logo, **then** a "Learn More" pop-up should appear with a link to the university’s official recruitment page.
### **3. Encounter More Obstacles (Game Fan)**

- **AC:** **Given** the player is in the "Challenge" mode, **when** they progress past the 500-meter mark, **then** the density of obstacles (e.g., Bristol seagulls, parked e-scooters) must increase by 25%.
### **4. Unique Storyline (Narrative Designer)**

- **AC:** **Given** the player reaches a story beat, **when** a dialogue sequence begins, **then** the game must present at least three branching text options that significantly alter the next level's environment.
### **5. Community Engagement (Citizen)**

- **AC:** **Given** a player is on the level selection screen, **when** they choose a "Local School" level, **then** the game should display a brief historical or community fact about that specific Bristol school.
### **6. Progressive Difficulty (Level Designer)**

- **AC:** **Given** I am moving from Level 1 to Level 2, **when** the transition occurs, **then** the vertical scroll speed must increase by $15\%$ and the gap between platforms must decrease.
### **7. Ambient City Sounds (Sound Designer)**
- **AC:** **Given** the character enters the "Harbourside" zone, **when** the player is within 50 pixels of the water, **then** the audio engine must cross-fade from the main theme to 3D spatialized sounds of boat horns and water lapping.
### **8. Score Board (Competitive Gamer)**
- **AC:** **Given** I have completed a level, **when** the summary screen appears, **then** I should see a global leaderboard and a "Share to Social Media" button that generates a summary image of my stats.

### **9. Iconic Landmarks (History Buff)**
- **AC:** **Given** the player is in the "Clifton" level, **when** the Clifton Suspension Bridge is visible on screen, **then** the game must render it as a static, high-detail landmark that does not scroll away until the level boss is defeated.

### **10. Intuitive Controls (UI/UX Designer)**
- **AC:** **Given** the game is launched on either mobile or desktop, **when** I use swipe gestures or the WASD keys, **then** the character must move with a response time of less than 16ms (1 frame at 60fps).

# Tasks
**Location Scouting:** Identify specific high-traffic areas on Park Street and Queens Road that are most "iconic" to UOB students.
**Texture Tiling & Cleaning:** Process photographs into seamless, tileable textures suitable for a vertical scrolling background.
**2D/3D Asset Creation:** Model or illustrate "hero buildings" (like the Wills Memorial Building) to stand out from the generic street textures.
**Optimization:** Compress high-fidelity textures into web-friendly formats (e.g., WebP) to ensure the game doesn't lag during vertical scrolling.

# Reflection
