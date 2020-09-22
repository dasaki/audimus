
let music;
let cw;
let ch;
let sw;
let sh;
let h = 100;
let chc;
let currPxPos = 0;
let topPos = (ch - h) / 2;
let mouseDownX = 0;
let songDownPos = 0;
let dragDist = 0;
let secPerPx = 0.0;
let bResume = false;
let bMusicPlaying = false;
let bDragging = false;
let bDraggingSliced = false;

let schematic;
let schematic_split;
let xml;
let cTotal;
let posTotal;
let pxTotal;
let pxPerPos;
let zoom;
let gap = 25;
let spaceX;
let spaceY;
let slices;
let score;
let claves;
let currSlice = 0;
let currSliceEndPix = 0;
let currClave = 0;
let currPos = 0;
let currPosA = 0;
let currPosB = 0;
let currMsA = 0;
let currMsB = 0;
let currPxPerMs = 0;
let targetMs = 0;
let sliceGapFactor = 1.05;
let schXpos = 0;



function preload() {
  xml = loadXML('images/chop70_1.xml');
  schematic = loadImage('images/chop70_1.jpg');
  music = createAudio('audio/chop70_1.mp3');
}


function updateCurrSlice() {
  let i = slices.length - 2;
  while ((i > 0) && (slices[i].getNum('pos') >= currPosB)) i--;
  currSlice = i;
}

function setClave(newClave) {
  if ((newClave >= 0) && (newClave < claves.length)) {
    currClave = newClave;
    if (currClave >= claves.length - 1) {
      music.stop();
      bMusicPlaying = false;
      currPxPos = 0;
      schXpos = 0;
      setClave(0);
    }
    else {
      currPosA = claves[currClave].getNum('posA');
      currPosB = claves[currClave].getNum('posB');
      currMsA = claves[currClave].getNum('msA');
      currMsB = claves[currClave].getNum('msB');
      currPxPerMs = ((currPosB - currPosA) * pxPerPos) / (currMsB - currMsA);
      if (currPxPerMs < 0) currPxPerMs *= 0.25;
      updateCurrSlice();
    }


  }
}

function prepare() {
  dragDist = 0;

  sw = schematic.width;
  sh = schematic.height;

  secPerPx = music.duration() / sw;

  slices = xml.getChildren('slice');
  score = slices[0].getParent().getParent();
  claves = xml.getChildren('clave');

  cTotal = score.getNum('cTotal');
  posTotal = score.getNum('posTotal');
  pxTotal = score.getNum('pxTotal');
  pxPerPos = sw / posTotal;
  currPxPos = 0;
  updateCurrSlice();

  // find width of the widest slice
  let maxW = 0;
  for (let i = 1; i < slices.length; i++) {
    let sx = pxPerPos * slices[i - 1].getNum('pos');
    let sw = pxPerPos * slices[i].getNum('pos') - sx;
    if (sw > maxW) maxW = sw;
  }
  // create and fill image of slices and add keypoints to music
  schematic_split = createImage(maxW, sh * 1.05 * (slices.length - 1));
  for (let i = 1; i < slices.length; i++) {
    let sx = pxPerPos * slices[i - 1].getNum('pos');
    let sw = pxPerPos * slices[i].getNum('pos') - sx;
    if (sw > maxW) maxW = sw;
    let value = slices[i - 1].getString('value');
    schematic_split.copy(schematic, sx, 0, sw, sh, 0, (i - 1) * sh * sliceGapFactor, sw, sh);
    // text(value, 100, i*(sh+22));
  }

  for (let i = 0; i < claves.length; i++) {
    music.addCue(claves[i].getNum('msA') / 1000, setClave, i); //
  }
}

function windowResized() {
  adjustZoom();
  resizeCanvas(cw, ch);
}


function adjustZoom() {
  cw = windowWidth * 0.98;
  ch = windowHeight * 0.99;
  chc = cw / 2;

  spaceX = cw - 2 * gap;
  spaceY = ch - sh - 3 * gap;

  let propXschematic = schematic_split.width / schematic_split.height;
  let propXspace = spaceX / spaceY;
  if (propXschematic > 1) {
    if (propXspace > propXschematic) zoom = spaceY / schematic_split.height;
    else zoom = spaceX / schematic_split.width;
  }
  else {
    if (propYspace > propYschematic) zoom = spaceX / schematic_split.width;
    else zoom = spaceY / schematic_split.height;
  }



  // calculate position of scaled sliced schematic

  


}

function setup() {
  prepare();
  adjustZoom();
  createCanvas(cw, ch);
  background(0);
  music.play();
  bMusicPlaying = true;
}


function mousePressed() {


  if ((mouseX > chc - currPxPos) && (mouseX < chc - currPxPos + sw) &&
    (mouseY > gap) && (mouseY < gap + sh)) {
    if (bMusicPlaying) {
      music.stop(); // 
      bMusicPlaying = false;
    }
    mouseDownX = mouseX;
    bDragging = true;
    return;
  }
  else bDragging = false;
  
  
  if ((mouseX > chc - currPxPos) && (mouseX < chc - currPxPos + sw) &&
    (mouseY > gap) && (mouseY < gap + sh)) {
    bDraggingSliced = true;
  }
}

function mouseClicked() {
  /*
  if (music.isPlaying()) {
    music.pause(); 
      background(0);

  } else {
    music.play();
      background(0);

  }
  */
}

function mouseDragged() {
  if (bDragging) {
    let tempDragDist = mouseDownX - mouseX;

    let newPos = currPxPos + tempDragDist;
    if (newPos > sw) dragDist = sw - currPxPos;
    else if (newPos < 0) dragDist = -currPxPos;
    else {
      dragDist = tempDragDist;

    }
  }

  // prevent default
  return false;
}

function mouseReleased() {
  if (bDragging) {
    currPxPos = currPxPos + dragDist;
    dragDist = 0;
    bResume = true;
    bDragging = false;
  }
}


function draw() {
  if (bResume) {
    bResume = false;
    targetSec = ((currPxPos - currPosA * pxPerPos) / currPxPerMs + currMsA) / 1000;
    music.play().time(targetSec);

    bMusicPlaying = true;
  }
  else {
    background(0);
    fill(255);
    textSize(20);
    text('cTotal ' + cTotal + ', claves length ' + claves.length + ' currSlice ' + currSlice +
      ' currClave ' + currClave + ' currPos ' + int(currPxPos / pxPerPos) + ' ms ' +
      int(music.time() * 1000) + ' targetms' + targetMs, 10, 22);

    translate(0, gap);

    if (bDragging) {
      schXpos = currPxPos + dragDist;
      let targetPos = schXpos / pxPerPos;
      let i = 0;
      while ((i < claves.length) && (claves[i].getNum('posB') < targetPos)) i++;
      setClave(i);
      updateCurrSlice();
    }
    else if (bMusicPlaying) {
      currPxPos = currPosA * pxPerPos + (music.time() * 1000 - currMsA) * currPxPerMs;
      schXpos = currPxPos;
    }

    image(schematic, chc - schXpos, 0);
    fill(255, 255, 0);

    rect(chc, 0, 4, sh);

    translate((cw - schematic_split.width * zoom) / 2, sh + gap);
    scale(zoom, zoom);
    image(schematic_split, 0, 0);
    rect(schXpos - slices[currSlice].getNum('pos') * pxPerPos, currSlice * sh * sliceGapFactor, 4 / zoom, sh);
  }
}
