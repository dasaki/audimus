
let button;

let music;
let cw;
let ch;
let sw;
let sh;
let chc;


let mouseDownX = 0;

let dragDist = 0;

let bResume = false;
let bMusicPlaying = false;
let bDragging = false;
let bDraggingSliced = false;
let bReset = false;
let bWasPlaying = false;
let bLoading = false;

let schematic;
let schematic_split;

let posTotal;
let pxPerPos;
let zoom;
let gap = 25;
let spaceX;
let spaceY;
let currSlice = 0;
let currKey = 0;
let currPos = 0;
let currPosA = 0;
let currPosB = 0;
let currMsA = 0;
let currMsB = 0;
let currPxPerMs = 0;
let targetMs = 0;
let currPxPos = 0;
let schXpos = 0;
let currSec = 0;
let sliceGapFactor = 1.05;
let draggedSlice= 0;

let strUser;
let fileName;

var keys = [];
var slices = [];

let SLICES_GAP = 1.05;


function getFilename() {
  let e = document.getElementById("fileSelector");
  strUser = e.options[e.selectedIndex].text;


  return e.options[e.selectedIndex].value;
}


function preload() {
  bLoading = true;
  schematic_split = createImage(10, 10);
  fileName = getFilename();
  music = createAudio('audio/' + fileName + '.mp3');
  loadXML('images/' + fileName + '.xml', parseXML);
  schematic = loadImage('images/' + fileName + '.jpg', prepare);
  bLoading = false;
}



function reLoad() {
  if (bMusicPlaying) {
    music.stop(); // 
    bMusicPlaying = false;

  }
  bLoading = true;
  fileName = getFilename();
  music.attribute('src', 'audio/' + fileName + '.mp3');
  loadXML('images/' + fileName + '.xml', parseXML);
  schematic = loadImage('images/' + fileName + '.jpg', prepare);
  bLoading = false;
  /* 
    fileName = getFilename(); 
    loadXML('images/'+fileName+'.xml', parseXML);
    schematic = loadImage('images/'+fileName+'.jpg', prepare);
    music = createAudio('audio/'+fileName+'.mp3');
    //music.attribute('src','audio/'+fileName+'.mp3'); 
    bResume = true;*/
}


function parseXML(xml) {

  let positions = xml.getChildren('position');
  let claves = xml.getChildren('clave');
  posTotal = positions[positions.length - 1].getNum('pos');

  keys.length = 0;
  for (var i in claves) {
    let newKey = {
      "posA": claves[i].getNum('posA'),
      "posB": claves[i].getNum('posB'),
      "msA": claves[i].getNum('msA'),
      "msB": claves[i].getNum('msB')
    };
    keys.push(newKey);
  }

  slices.length = 0;
  for (var i in positions) {
    let newSlice = {
      "pos": positions[i].getNum('pos'),
      "value": positions[i].getString('value'),
      "pxWidth": 0
    };

    slices.push(newSlice);
  }



}


function setup() {


  var canvas = createCanvas(cw, ch);
  canvas.parent('sketch-div');
  background(0);
  //  music = createAudio('');
  //  music.play();
  bMusicPlaying = false;

  button = createButton('PLAY');
  button.size(80, 30);
  button.position(gap, ch - 30);
  button.mousePressed(playPause);
}

function playPause() {
  if (bMusicPlaying) {
    button.html("PLAY");
    music.pause();
    bMusicPlaying = false;
  } else {
    button.html("PAUSE");
    music.play().time(currSec);
    bMusicPlaying = true;
  }
}


function prepare() {
  currPos = 0;
  currPxPos = 0;
  schXpos = 0;
  targetMs = 0;
  dragDist = 0;
  currSec = 0;

  sw = schematic.width;
  sh = schematic.height;

  pxPerPos = sw / posTotal;
  currPxPos = 0;
  updateCurrSlice();

  // find width of the widest slice
  let maxW = 0;
  for (let i = 1; i < slices.length; i++) {
    let sx = pxPerPos * slices[i - 1].pos;
    let sw = pxPerPos * slices[i].pos - sx;
    if (sw > maxW) maxW = sw;
  }
  // create and fill image of slices and add keypoints to music

  schematic_split = createImage(maxW, sh * SLICES_GAP * (slices.length - 1));

  for (let i = 1; i < slices.length; i++) {
    let ssx = pxPerPos * slices[i - 1].pos;
    slices[i-1].width = pxPerPos * slices[i].pos - ssx;
    if (slices[i-1].width > maxW) maxW = slices[i-1].width;
    //    let value = slices[i - 1].value;
    // text(value, 100, i*(sh+22));
    schematic_split.copy(schematic, ssx, 0, slices[i-1].width, sh, 0, (i - 1) * sh * sliceGapFactor, slices[i-1].width, sh);
  }
  slices.pop();

  music.clearCues();
  for (let i = 0; i < keys.length; i++) {
    music.addCue(keys[i].msA / 1000, setClave, i); //
  }
  adjustZoom();
  setClave(0);
}

function windowResized() {
  adjustZoom();
  resizeCanvas(cw, ch);
}


function adjustZoom() {
  cw = windowWidth * 0.98;
  ch = windowHeight * 0.99 - 100;
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


function updateCurrSlice() {
  let i = slices.length - 1;
  while ((i > 0) && (slices[i].pos >= currPosB)) i--;
  currSlice = i;
}

function setClave(newClave) {
  if ((newClave >= 0) && (newClave < keys.length)) {
    currKey = newClave;
    if (currKey >= keys.length - 1) {
      music.stop();
      bMusicPlaying = false;
      currPxPos = 0;
      schXpos = 0;
      setClave(0);
    }
    else {
      currPosA = keys[currKey].posA;
      currPosB = keys[currKey].posB;
      currMsA = keys[currKey].msA;
      currMsB = keys[currKey].msB;
      currPxPerMs = ((currPosB - currPosA) * pxPerPos) / (currMsB - currMsA);
      if (currPxPerMs < 0) currPxPerMs = 0;
      updateCurrSlice();
    }
  }
}


function mousePressed() {


  if ( (mouseY > gap) && (mouseY < gap + sh) &&
       (mouseX > chc - currPxPos) && (mouseX < chc - currPxPos + sw) 
    ) {
    if (bMusicPlaying) {
      music.stop(); // 
      bWasPlaying = true;
      bMusicPlaying = false;
    }
    else bWasPlaying = false;
    mouseDownX = mouseX;
    bDragging = true;
    updateDragDist();
    return;
  }
  else bDragging = false;


  if ((mouseY > 2 * gap + sh) && (mouseY < ch - gap) &&
    (mouseX > (cw - schematic_split.width * zoom) / 2) && (mouseX < (cw + schematic_split.width * zoom) / 2))
     {
    if (bMusicPlaying) {
      music.stop(); // 
      bWasPlaying = true;
      bMusicPlaying = false;
    }
    else bWasPlaying = false;
    bDraggingSliced = true;
    updateDragDist();
    return;
  }
  else bDraggingSliced = false;

}
function keyPressed() {
  if (key == ' ') {
    playPause();
  }
}
function mouseClicked() {
 

}

function mouseDragged() {
  updateDragDist();
  // prevent default
  return false;
}

function mouseReleased() {
  if (bDragging || bDraggingSliced) {
    updateDragDist();
    currPxPos = currPxPos + dragDist;
    currSec = ((currPxPos - currPosA * pxPerPos) / currPxPerMs + currMsA) / 1000;
    dragDist = 0;
    bResume = true;
    bDraggingSliced = false;
    bDragging = false;
  }
}


function updateDragDist() {

  if (bDragging) {
    let tempDragDist = mouseDownX - mouseX;

    let newPos = currPxPos + tempDragDist;
    if (newPos > sw) dragDist = sw - currPxPos;
    else if (newPos < 0) dragDist = -currPxPos;
    else {
      dragDist = tempDragDist;
    }
  }
  else if (bDraggingSliced) {

    let pressedSlicePx = 0;
    let i = 0;
    while ( (i < slices.length-1) &&
            (pressedSlicePx < sw) && 
            (mouseY > (2 * gap + sh + (i+1) * (zoom*sh*SLICES_GAP))) &&
            (mouseY < ch - gap)
            ) {
            pressedSlicePx+=slices[i].width;
            i++;
          }
    draggedSlice = i;
    let slicePxOffset = (mouseX- (cw - schematic_split.width * zoom) / 2)/zoom;
    if (slicePxOffset > slices[i].width) slicePxOffset = slices[i].width;

    let targetPxPos = pressedSlicePx+slicePxOffset;

    let tempDragDist = targetPxPos-currPxPos;

    let newPos = currPxPos + tempDragDist;
    if (newPos > sw) dragDist = sw - currPxPos;
    else if (newPos < 0) dragDist = -currPxPos;
    else {
      dragDist = tempDragDist;
    }
  }

}

function draw() {

  if (bResume) {
    if (bWasPlaying) playPause();
    //music.play().time(currSec);
    //bMusicPlaying = true;
    bResume = false;
  }
  else if (!bLoading) {
    background(0);
    fill(255);
    textSize(20);

    text('filename: ' + fileName + ' slice ' + slices[currSlice].value + ', claves  ' + keys.length + ' posiciones ' + posTotal +
      ' currKey ' + currKey + ' currPos ' + int(currPxPos / pxPerPos) + ' sec ' +
      int(music.time()) + ' targetms ' + targetMs, 10, 22);

    translate(0, gap);

    if (bDragging || bDraggingSliced) {
      schXpos = currPxPos + dragDist;
      let targetPos = schXpos / pxPerPos;
      let i = 0;
      while ((i < keys.length) && (keys[i].posB < targetPos)) i++;
      setClave(i);
      updateCurrSlice();
    }
    else if (bMusicPlaying) {
      currSec = music.time();
      let msMusic = music.time() * 1000;
      if (msMusic > currMsA) {
        currPxPos = currPosA * pxPerPos + (msMusic - currMsA) * currPxPerMs;
        schXpos = currPxPos;
      }
    }
    else  schXpos = currPxPos;

    image(schematic, chc - schXpos, 0);
    fill(255, 255, 0);
    strokeWeight(2);
    rect(chc, 0, 4, sh);

    translate((cw - schematic_split.width * zoom) / 2, sh + gap);
    scale(zoom, zoom);
    
    image(schematic_split, 0, 0);
    strokeWeight(2.0/zoom);
    rect(schXpos - slices[currSlice].pos * pxPerPos, currSlice * sh * sliceGapFactor, 4 / zoom, sh);
  }
}
