// Global variables
let segments = [];      // Array to store the 3 segment images
let segmentY = [];      // Y positions for each segment
let scrollSpeed = 5;    // Scroll speed (pixels per frame)

// Preload images before setup runs
function preload() {
  // Load all 3 segments
  segments[0] = loadImage('assets/backgrounds/segmentA.png');
  segments[1] = loadImage('assets/backgrounds/segmentB.png');
  segments[2] = loadImage('assets/backgrounds/segmentC.png');
}

function setup() {
  createCanvas(1920, 1080);
  
  // Get the height of segments (assuming all same height)
  let segmentHeight = segments[0].height;
  
  // Initialize positions - stack them vertically above the screen
  segmentY[0] = 0;                    // First segment at top of screen
  segmentY[1] = -segmentHeight;        // Second segment above first
  segmentY[2] = -segmentHeight * 2;    // Third segment above second
}

function draw() {
  background(135, 206, 235); // Sky blue background (in case of gaps)
  
  // Get segment height
  let segmentHeight = segments[0].height;
  
  // Draw and scroll all 3 segments
  for (let i = 0; i < 3; i++) {
    // Draw the segment
    image(segments[i], 0, segmentY[i]);
    
    // Move segment downward (scrolling effect)
    segmentY[i] += scrollSpeed;
    
    // When segment scrolls off bottom of screen, move it to top
    if (segmentY[i] > height) {
      // Find the highest segment (most negative Y)
      let highestY = Math.min(segmentY[0], segmentY[1], segmentY[2]);
      
      // Place this segment above the highest one
      segmentY[i] = highestY - segmentHeight;
    }
  }
  
  // Display instructions and info
  fill(255);
  stroke(0);
  strokeWeight(3);
  textSize(24);
  textAlign(LEFT);
  text('Press SPACE to pause/play', 20, 40);
  text('Press UP/DOWN to change speed', 20, 80);
  text('Scroll Speed: ' + scrollSpeed + ' px/frame', 20, 120);
  text('FPS: ' + floor(frameRate()), 20, 160);
  noStroke();
}

// Keyboard controls
function keyPressed() {
  // Spacebar to pause/play
  if (key === ' ') {
    scrollSpeed = (scrollSpeed === 0) ? 5 : 0;
  }
  
  // Arrow keys to adjust speed
  if (keyCode === UP_ARROW) {
    scrollSpeed = min(scrollSpeed + 1, 20); // Max speed 20
  }
  if (keyCode === DOWN_ARROW) {
    scrollSpeed = max(scrollSpeed - 1, 0); // Min speed 0
  }
}