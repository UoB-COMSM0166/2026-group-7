let img;
let drops = [];
let splashes = [];
let numDrops = 400;

function preload() {
  img = loadImage('landscape.jpg'); 
}

function setup() {
  // This makes the canvas fit your browser window
  createCanvas(windowWidth, windowHeight);
  
  for (let i = 0; i < numDrops; i++) {
    drops[i] = new Raindrop();
  }
}

function draw() {
  // Draw the image scaled to fit the canvas
  if (img) {
    image(img, 0, 0, width, height);
  } else {
    background(30);
  }

  // Update and show drops
  for (let i = 0; i < drops.length; i++) {
    drops[i].fall();
    drops[i].show();
  }

  // Update and show splashes
  for (let i = splashes.length - 1; i >= 0; i--) {
    splashes[i].display();
    if (splashes[i].finished()) {
      splashes.splice(i, 1); // Remove splash once it fades
    }
  }
}

class Raindrop {
  constructor() {
    this.reset();
    this.y = random(height);
  }

  reset() {
    this.x = random(width);
    this.y = random(-200, -100);
    this.z = random(0, 20);
    this.len = map(this.z, 0, 20, 5, 15);
    this.yspeed = map(this.z, 0, 20, 5, 12);
  }

  fall() {
    this.y += this.yspeed;
    if (this.y > height) {
      // Create a splash at the bottom before resetting
      splashes.push(new Splash(this.x, height));
      this.reset();
    }
  }

  show() {
    let thick = map(this.z, 0, 20, 1, 2);
    strokeWeight(thick);
    stroke(255, 180); // White rain with some transparency
    line(this.x, this.y, this.x, this.y + this.len);
  }
}

class Splash {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.alpha = 200;
    this.w = 2; // Width of the splash ellipse
  }

  display() {
    noFill();
    stroke(255, this.alpha);
    strokeWeight(1);
    // Draw an oval to look like a ripple on the ground
    ellipse(this.x, this.y - 2, this.w, this.w / 2);
    this.alpha -= 10; // Fade out
    this.w += 2;      // Grow larger
  }

  finished() {
    return this.alpha < 0;
  }
}
