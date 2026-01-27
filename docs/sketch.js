// Global Variables
let currentBrush = 1;
let pg; // Layer 3: Drawing Layer
let myBrush; 
let brushImgInput;

// Undo History
let history = []; 

// State Flags
let showGrid = false; // Controls Layer 2

// UI References
let colorPicker, bgColorPicker;
let sizeSlider, alphaSlider;
let symmetryCheckbox, axisSelect;
let wInput, hInput, nameInput;
let helpModal; 

// Config
const TOP_BAR_HEIGHT = 60;
const SIDE_BAR_WIDTH = 200;
const CANVAS_X = SIDE_BAR_WIDTH + 20; 
const CANVAS_Y = TOP_BAR_HEIGHT + 20; 
const CUTE_FONT = 'Comic Sans MS, Chalkboard SE, sans-serif';

function preload() {
  myBrush = loadImage('https://upload.wikimedia.org/wikipedia/commons/f/f1/Heart_coraz%C3%B3n.svg');
}

function setup() {
  // Initialize Main Canvas
  let cnv = createCanvas(500, 500);
  cnv.position(CANVAS_X, CANVAS_Y); 
  cnv.style('box-shadow', '0 4px 15px rgba(0,0,0,0.1)');
  cnv.style('border-radius', '4px'); 
  
  // Initialize Drawing Layer
  pg = createGraphics(500, 500);
  
  // Defaults
  document.oncontextmenu = () => false;
  textFont(CUTE_FONT);
  imageMode(CENTER);
  pg.imageMode(CENTER);

  // Build UI
  createTopBar();
  createSideBar();
  createHelpModal();
  saveHistory(); // Initial state
}

function draw() {
  // Layer 1: Background Color
  background(bgColorPicker.color());

  // Layer 2: Grid (Rendered directly to canvas, under the drawing)
  if (showGrid) {
    drawGridLayer();
  }

  // Handle Input
  handleInput();

  // Layer 3: Drawing Layer (Rendered on top)
  image(pg, width/2, height/2);

  // Layer 4: Axis Guide (Ephemeral overlay)
  if (symmetryCheckbox.checked()) {
    drawAxisGuide();
  }
}

// Input Handler
function handleInput() {
  if (mouseIsPressed) {
    let mx = mouseX;
    let my = mouseY;
    let pmx = pmouseX;
    let pmy = pmouseY;

    // Boundary Check
    if (mx > 0 && mx < width && my > 0 && my < height) {
      let activeBrush = (mouseButton === RIGHT) ? 6 : currentBrush;

      if (activeBrush === 6 || activeBrush === 7) {
        eraserTool(mx, my, pmx, pmy, activeBrush);
        if (symmetryCheckbox.checked()) applySymmetry(mx, my, pmx, pmy, true, activeBrush);
      } 
      else if (mouseButton === LEFT) {
        drawBrushAt(mx, my, pmx, pmy);
        if (symmetryCheckbox.checked()) applySymmetry(mx, my, pmx, pmy, false, 0);
      }
    }
  }
}

// Grid Renderer
function drawGridLayer() {
  push();
  stroke(200); 
  strokeWeight(1);
  for (let i = 0; i < width; i += 20) line(i, 0, i, height);
  for (let j = 0; j < height; j += 20) line(0, j, width, j);
  pop();
}

// Eraser Logic
function eraserTool(x, y, px, py, type) {
  let size = sizeSlider.value();
  
  if (type === 6) { 
    // True Eraser (Transparency) - Reveals Grid
    pg.erase(); 
    pg.strokeWeight(size); 
    pg.strokeCap(ROUND);
    pg.line(px, py, x, y); 
    pg.noErase(); 
  } else { 
    // Cover Eraser (Paint Background) - Hides Grid
    pg.noErase(); 
    pg.stroke(bgColorPicker.color());
    pg.strokeWeight(size); 
    pg.strokeCap(ROUND); 
    pg.strokeJoin(ROUND);
    pg.line(px, py, x, y);
  }
}

// Undo System
function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    saveHistory();
  }
}

function saveHistory() {
  let snapshot = pg.get(); 
  history.push(snapshot);
  if (history.length > 20) history.shift();
}

function undoLastAction() {
  if (history.length > 0) {
    let previousState = history.pop();
    pg.clear();
    pg.push();
    pg.imageMode(CORNER);
    pg.image(previousState, 0, 0);
    pg.pop();
  }
}

// UI: Top Bar
function createTopBar() {
  let y = 15; let startX = 20;

  // Size Controls
  createSpan("W:").position(startX, y+5).style('font-family', CUTE_FONT).style('font-size','12px');
  wInput = createInput('500'); wInput.position(startX+20, y); wInput.size(35, 20);
  createSpan("H:").position(startX+65, y+5).style('font-family', CUTE_FONT).style('font-size','12px');
  hInput = createInput('500'); hInput.position(startX+85, y); hInput.size(35, 20);
  let resizeBtn = createButton('Set Size'); styleSmallButton(resizeBtn, startX+135, y);
  resizeBtn.mousePressed(updateCanvasSize);

  startX += 220; 

  // Undo & Grid Controls
  let undoBtn = createButton('↩️ Undo'); styleSmallButton(undoBtn, startX, y);
  undoBtn.style('width','70px'); undoBtn.style('font-weight','bold');
  undoBtn.mousePressed(undoLastAction);

  let gridBtn = createButton('▦ Grid'); styleSmallButton(gridBtn, startX+80, y);
  gridBtn.mousePressed(() => { showGrid = !showGrid; });

  let clearBtn = createButton('🗑️ Clear'); styleSmallButton(clearBtn, startX+155, y);
  clearBtn.mousePressed(() => { saveHistory(); pg.clear(); });

  startX += 240;

  // File Controls
  createSpan("File:").position(startX, y+5).style('font-family', CUTE_FONT).style('font-size','12px');
  nameInput = createInput('myArt'); nameInput.position(startX+35, y); nameInput.size(90, 20);
  let saveBtn = createButton('💾 Save'); styleSmallButton(saveBtn, startX+140, y);
  saveBtn.style('background-color', '#E1BEE7'); saveBtn.mousePressed(saveArt);
  let helpBtn = createButton('❓ Keys'); styleSmallButton(helpBtn, startX+220, y);
  helpBtn.style('background-color', '#FFF9C4'); helpBtn.mousePressed(toggleHelp);
}

// UI: Side Bar
function createSideBar() {
  let x = 20; let y = TOP_BAR_HEIGHT + 20; let col2 = x + 90; 

  // Style Section
  createLabel('🎨 PEN STYLE', x, y); y += 25;
  createSpan("BG Color:").position(x, y+5).style('font-family', CUTE_FONT).style('font-size','10px');
  bgColorPicker = createColorPicker('#FEC7D7'); bgColorPicker.position(x+55, y); stylePicker(bgColorPicker); y += 35;
  createSpan("Pen Color:").position(x, y+5).style('font-family', CUTE_FONT).style('font-size','10px');
  colorPicker = createColorPicker('#A786DF'); colorPicker.position(x+55, y); stylePicker(colorPicker); y += 35;

  createLabel('Size:', x, y); sizeSlider = createSlider(1, 100, 10); sizeSlider.position(x+40, y); sizeSlider.style('width', '120px'); y += 30;
  createLabel('Alpha:', x, y); alphaSlider = createSlider(0, 255, 255); alphaSlider.position(x+40, y); alphaSlider.style('width', '120px'); y += 45;

  // Brush Section
  createLabel('🖌️ BRUSHES', x, y); y += 25;
  makeBtn('🖊️ Basic', 1, x, y); makeBtn('💨 Spray', 2, col2, y); y += 35;
  makeBtn('⚡ Speed', 3, x, y); makeBtn('❤️ Image', 4, col2, y); y += 35;
  makeBtn('🌀 Scribble', 5, x, y); y += 45;

  // Eraser Section
  createLabel('🧽 ERASERS', x, y); y += 25;
  makeBtn('✨ Clear', 6, x, y); makeBtn('🖍️ Cover', 7, col2, y); y += 45;

  // Symmetry Section
  createLabel('🦋 SYMMETRY', x, y); y += 25;
  symmetryCheckbox = createCheckbox(' On', false); symmetryCheckbox.position(x, y); symmetryCheckbox.style('font-family', CUTE_FONT);
  axisSelect = createSelect(); axisSelect.position(x+60, y); axisSelect.option('Horizontal'); axisSelect.option('Vertical'); axisSelect.option('Quadrant');
  axisSelect.size(100, 25); axisSelect.style('font-family', CUTE_FONT); y += 50;

  // Upload Section
  brushImgInput = createFileInput(handleFile); brushImgInput.hide();
  let uploadBtn = createButton('📂 Upload Brush'); styleButton(uploadBtn, x, y); uploadBtn.style('width', '180px'); uploadBtn.mousePressed(() => brushImgInput.elt.click());
}

// UI: Help Modal
function createHelpModal() {
  helpModal = createDiv(`
    <div style="text-align:center; font-family:${CUTE_FONT}">
      <h3>🎹 Shortcuts</h3>
      <hr style="border:1px solid #eee">
      <ul style="text-align:left; padding-left:20px; line-height:1.8; font-size:14px;">
        <li><b>Ctrl + Z</b> : Undo</li>
        <li><b>1 - 5</b> : Brushes</li>
        <li><b>6</b> : <b>Clear</b> (Reveals Grid)</li>
        <li><b>7</b> : <b>Cover</b> (Hides Grid)</li>
      </ul>
      <button onclick="this.parentElement.parentElement.style.display='none'" style="padding:8px 20px; border-radius:15px; border:1px solid #ccc; cursor:pointer;">Close</button>
    </div>
  `);
  helpModal.position(0, 0); helpModal.style('position', 'fixed'); helpModal.style('top', '50%'); helpModal.style('left', '50%');
  helpModal.style('transform', 'translate(-50%, -50%)'); helpModal.style('background', 'white'); helpModal.style('padding', '20px');
  helpModal.style('border-radius', '15px'); helpModal.style('box-shadow', '0 10px 40px rgba(0,0,0,0.3)'); helpModal.style('display', 'none'); helpModal.style('z-index', '9999');
}

// Logic Helpers
function updateCanvasSize() {
  let newW = parseInt(wInput.value()); let newH = parseInt(hInput.value());
  if (newW >= 100 && newH >= 100) { resizeCanvas(newW, newH); pg = createGraphics(newW, newH); pg.imageMode(CENTER); pg.clear(); history = []; }
}
function saveArt() { let name = nameInput.value().trim() || "myMasterpiece"; saveCanvas(name, 'jpg'); }
function toggleHelp() { let disp = helpModal.style('display'); helpModal.style('display', disp === 'none' ? 'block' : 'none'); }

// Brush Implementation
function drawBrushAt(x, y, px, py) {
  let size = sizeSlider.value(); let col = colorPicker.color(); col.setAlpha(alphaSlider.value());
  pg.stroke(col); pg.fill(col); pg.noErase(); 
  switch (currentBrush) {
    case 1: basicBrush(x, y, px, py, size); break;
    case 2: sprayBrush(x, y, size); break;
    case 3: speedBrush(x, y, px, py); break;
    case 4: imageBrush(x, y, size); break;
    case 5: autoScribbler(x, y, size); break;
  }
}

function basicBrush(x, y, px, py, size) { pg.strokeWeight(size); pg.strokeCap(ROUND); pg.strokeJoin(ROUND); pg.line(px, py, x, y); }
function sprayBrush(x, y, size) { pg.noStroke(); let density = size * 3; for (let i = 0; i < density; i++) pg.ellipse(x + randomGaussian(0,size/3), y + randomGaussian(0,size/3), 2, 2); }
function speedBrush(x, y, px, py) { let weight = constrain(map(dist(x,y,px,py), 0, 50, 25, 2), 2, 25); pg.strokeWeight(weight); pg.strokeCap(ROUND); pg.line(px, py, x, y); }
function imageBrush(x, y, size) { if (myBrush) { pg.push(); pg.translate(x, y); pg.rotate(random(TWO_PI)); pg.image(myBrush, 0, 0, size * 3, size * 3); pg.pop(); } }
function autoScribbler(x, y, size) { pg.strokeWeight(1 + size/10); pg.noFill(); pg.beginShape(); for(let i=0; i<5; i++) pg.vertex(x + random(-size, size), y + random(-size, size)); pg.endShape(); }

// Symmetry Helper
function applySymmetry(x, y, px, py, isEraser, eraserType) {
  let mode = axisSelect.value();
  let act = (ax, ay, apx, apy) => { if(isEraser) eraserTool(ax, ay, apx, apy, eraserType); else drawBrushAt(ax, ay, apx, apy); };
  if (mode === 'Horizontal' || mode === 'Quadrant') act(width-x, y, width-px, py);
  if (mode === 'Vertical' || mode === 'Quadrant') act(x, height-y, px, height-py);
  if (mode === 'Quadrant') act(width-x, height-y, width-px, height-py);
}

function drawAxisGuide() { push(); stroke(150, 150); strokeWeight(2); drawingContext.setLineDash([5, 5]); let mode = axisSelect.value(); if (mode === 'Horizontal' || mode === 'Quadrant') line(width/2, 0, width/2, height); if (mode === 'Vertical' || mode === 'Quadrant') line(0, height/2, width, height/2); pop(); }

// Styling Helpers
function stylePicker(p) { p.style('height','25px'); p.style('width','30px'); p.style('border','none'); p.style('cursor','pointer'); }
function createLabel(t, x, y) { createSpan(t).position(x, y).style('font-family',CUTE_FONT).style('font-weight','bold').style('font-size','12px').style('color','#888'); }
function makeBtn(l, t, x, y) { let b = createButton(l); styleButton(b, x, y); b.mousePressed(() => currentBrush = t); }
function styleButton(b, x, y) { b.position(x, y); b.size(85, 30); b.style('background','#fff'); b.style('border','1px solid #ddd'); b.style('border-radius','15px'); b.style('font-family',CUTE_FONT); b.style('cursor','pointer'); b.mouseOver(() => b.style('background','#f5f5f5')); b.mouseOut(() => b.style('background','#fff')); }
function styleSmallButton(b, x, y) { b.position(x, y); b.size(70, 25); b.style('background','#eee'); b.style('border','1px solid #ccc'); b.style('border-radius','5px'); b.style('font-family',CUTE_FONT); b.style('font-size','11px'); b.style('cursor','pointer'); }
function handleFile(f) { if(f.type==='image'){ myBrush=createImg(f.data,''); myBrush.hide(); currentBrush=4; } }
function keyPressed() { if(key>='1'&&key<='7') currentBrush=int(key); if(key==='s'||key==='S') saveArt(); if(key==='c'||key==='C') { saveHistory(); pg.clear(); } if(key==='z'||key==='Z') undoLastAction(); }