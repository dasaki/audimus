
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

let schematic;
let schematic_split;

let posTotal;
let pxPerPos;
let zoom;
let gap = 25;
let spaceX;
let spaceY;
let currSlice = 0;
let currClave = 0;
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

let strUser;
let fileName;

var claves2 = [];
var slices2 = [];


function getFilename() {
  let e = document.getElementById("fileSelector");
  strUser = e.options[e.selectedIndex].text;
 

  return e.options[e.selectedIndex].value;
}


function preload() {

  schematic_split = createImage(10,10);
  fileName = getFilename();
  loadXML('images/'+fileName+'.xml', parseXML);
  schematic = loadImage('images/'+fileName+'.jpg', prepare);
  music = createAudio('audio/'+fileName+'.mp3');
}



function reLoad() {
  if (bMusicPlaying) {
    music.stop(); // 
    bMusicPlaying = false;
  
  }
  fileName = getFilename();
  
  loadXML('images/'+fileName+'.xml', parseXML);
  schematic = loadImage('images/'+fileName+'.jpg', prepare);
  music.attribute('src','audio/'+fileName+'.mp3'); 
/* 
  fileName = getFilename(); 
  loadXML('images/'+fileName+'.xml', parseXML);
  schematic = loadImage('images/'+fileName+'.jpg', prepare);
  music = createAudio('audio/'+fileName+'.mp3');
  //music.attribute('src','audio/'+fileName+'.mp3'); 
  bResume = true;*/
}


function parseXML(xml) {

  let slices = xml.getChildren('position');
  let claves = xml.getChildren('clave');
  posTotal = slices[slices.length-1].getNum('pos');

  claves2.length = 0;
  for (var i in claves){
    let clave = { "posA" : claves[i].getNum('posA'),
                    "posB" : claves[i].getNum('posB'),
                    "msA" : claves[i].getNum('msA'),
                    "msB" : claves[i].getNum('msB')
                  };
    claves2.push(clave);
  }

  slices2.length = 0;
  for (var i in slices){
    let slice = { "pos": slices[i].getNum('pos'),
                  "value" : slices[i].getString('value') };

    slices2.push(slice);
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
  button.size(80,30);
  button.position(gap, ch-40);
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
  for (let i = 1; i < slices2.length; i++) {
    let sx = pxPerPos * slices2[i - 1].pos;
    let sw = pxPerPos * slices2[i].pos - sx;
    if (sw > maxW) maxW = sw;
  }
  // create and fill image of slices and add keypoints to music

   schematic_split = createImage(maxW, sh * 1.05 * (slices2.length - 1));

  for (let i = 1; i < slices2.length; i++) {
    let sx = pxPerPos * slices2[i - 1].pos;
    let sw = pxPerPos * slices2[i].pos - sx;
    if (sw > maxW) maxW = sw;
//    let value = slices2[i - 1].value;
    // text(value, 100, i*(sh+22));
    schematic_split.copy(schematic, sx, 0, sw, sh, 0, (i - 1) * sh * sliceGapFactor, sw, sh);
  }

  music.clearCues();
  for (let i = 0; i < claves2.length; i++) {
    music.addCue(claves2[i].msA / 1000, setClave, i); //
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
  ch = windowHeight * 0.99-100;
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
  let i = slices2.length - 2;
  while ((i > 0) && (slices2[i].pos >= currPosB)) i--;
  currSlice = i;
}

function setClave(newClave) {
  if ((newClave >= 0) && (newClave < claves2.length)) {
    currClave = newClave;
    if (currClave >= claves2.length - 1) {
      music.stop();
      bMusicPlaying = false;
      currPxPos = 0;
      schXpos = 0;
      setClave(0);
    }
    else {
      currPosA = claves2[currClave].posA;
      currPosB = claves2[currClave].posB;
      currMsA = claves2[currClave].msA;
      currMsB = claves2[currClave].msB;
      currPxPerMs = ((currPosB - currPosA) * pxPerPos) / (currMsB - currMsA);
      if (currPxPerMs < 0) currPxPerMs *= 0.25;
      updateCurrSlice();
    }
  }
}


function mousePressed() {


  if ((mouseX > chc - currPxPos) && (mouseX < chc - currPxPos + sw) &&
    (mouseY > gap) && (mouseY < gap + sh)) {
    if (bMusicPlaying) {
      music.stop(); // 
      bWasPlaying = true;
      bMusicPlaying = false;
    }
    else bWasPlaying = false;
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
    currSec = ((currPxPos - currPosA * pxPerPos) / currPxPerMs + currMsA) / 1000;
    if ( bWasPlaying ) playPause();
      //music.play().time(currSec);
    //bMusicPlaying = true;
    bResume = false;
  }
  else {
    background(0);
    fill(255);
    textSize(20);
    
    text('filename: '+fileName+' slice '+slices2[0].value+ ', claves  ' + claves2.length + ' posiciones ' + posTotal +
      ' currClave ' + currClave + ' currPos ' + int(currPxPos / pxPerPos) + ' sec ' +
      int(music.time()) + ' targetms ' + targetMs, 10, 22);

    translate(0, gap);

    if (bDragging) {
      schXpos = currPxPos + dragDist;
      let targetPos = schXpos / pxPerPos;
      let i = 0;
      while ((i < claves2.length) && (claves2[i].posB < targetPos)) i++;
      setClave(i);
      updateCurrSlice();
    }
    else if (bMusicPlaying) {
      currSec = music.time();
      let msMusic = music.time() * 1000;
      if (msMusic > currMsA ) {
        currPxPos = currPosA * pxPerPos + (msMusic - currMsA) * currPxPerMs;
        schXpos = currPxPos;
      }
    }

    image(schematic, chc - schXpos, 0);
    fill(255, 255, 0);

    rect(chc, 0, 4, sh);

    translate((cw - schematic_split.width * zoom) / 2, sh + gap);
    scale(zoom, zoom);
    image(schematic_split, 0, 0);
    rect(schXpos - slices2[currSlice].pos * pxPerPos, currSlice * sh * sliceGapFactor, 4 / zoom, sh);
  }
}