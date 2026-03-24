// p5.js sketch implementing Spin + Bounce challenges

let spots, arm, rectSpin, bouncer;

function setup() {
  createCanvas(640, 360);

  // Faster initial speeds
  arm = new SpinArm(width / 2, height / 2, 0.08);
  spots = new SpinSpots(width / 2, height / 2, -0.12, 90.0);

  // New subclass: stationary rectangle using angle from Spin
  rectSpin = new SpinRect(width / 2, height / 2 + 100, 0.05, 80, 30);

  // New superclass Bounce with a bouncing ball subclass
  bouncer = new BounceBall(width / 2, 40, 3, 2, 30);
}

function draw() {
  background(204);

  arm.update();
  arm.display();

  spots.update();
  spots.display();

  rectSpin.update();
  rectSpin.display();

  bouncer.update();
  bouncer.display();
}

// -------------------------
// Spin hierarchy (spinning)
// -------------------------
class Spin {
  constructor(x, y, s) {
    this.x = x;
    this.y = y;
    this.speed = s;
    this.angle = 0.0;
    this.damping = 0.99; // controls how quickly spinning slows
  }

  update() {
    this.angle += this.speed;

    // Gradually slow the spinning
    this.speed *= this.damping;

    // Optionally clamp tiny speeds to zero
    if (Math.abs(this.speed) < 0.0001) {
      this.speed = 0;
    }
  }
}

class SpinArm extends Spin {
  constructor(x, y, s) {
    super(x, y, s);
  }

  display() {
    strokeWeight(1);
    stroke(0);
    push();
    translate(this.x, this.y);
    // Angle already updated in update(), just rotate
    rotate(this.angle);
    line(0, 0, 165, 0);
    pop();
  }
}

class SpinSpots extends Spin {
  constructor(x, y, s, d) {
    super(x, y, s);
    this.dim = d;
  }

  display() {
    noStroke();
    push();
    translate(this.x, this.y);
    // Angle already updated in update(), just rotate
    rotate(this.angle);
    ellipse(-this.dim / 2, 0, this.dim, this.dim);
    ellipse(this.dim / 2, 0, this.dim, this.dim);
    pop();
  }
}

// New subclass: stationary rectangle using angle for color/width
class SpinRect extends Spin {
  constructor(x, y, s, w, h) {
    super(x, y, s);
    this.baseW = w;
    this.h = h;
  }

  display() {
    push();
    translate(this.x, this.y);

    // Use angle to modulate width and color, but keep rectangle stationary
    let w = this.baseW + 40 * Math.sin(this.angle);
    let c = map(Math.sin(this.angle), -1, 1, 50, 255);

    rectMode(CENTER);
    noStroke();
    fill(c, 100, 200);
    rect(0, 0, w, this.h);

    pop();
  }
}

// ---------------------------
// Bounce hierarchy (bouncing)
// ---------------------------
class Bounce {
  constructor(x, y, vx, vy, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off left/right
    if (this.x < this.size / 2) {
      this.x = this.size / 2;
      this.vx *= -1;
    } else if (this.x > width - this.size / 2) {
      this.x = width - this.size / 2;
      this.vx *= -1;
    }

    // Bounce off top/bottom
    if (this.y < this.size / 2) {
      this.y = this.size / 2;
      this.vy *= -1;
    } else if (this.y > height - this.size / 2) {
      this.y = height - this.size / 2;
      this.vy *= -1;
    }
  }
}

class BounceBall extends Bounce {
  constructor(x, y, vx, vy, size) {
    super(x, y, vx, vy, size);
  }

  display() {
    noStroke();
    fill(50, 120, 255);
    ellipse(this.x, this.y, this.size, this.size);
  }
}
