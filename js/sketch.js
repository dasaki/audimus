
let music;
let cw;
let ch;
let w;
let h = 100;
let chc;
let leftPos = 0;
let topPos = (ch - h) / 2;
let mouseDownX = 0;
let songDownPos = 0;
let dragDist = 0;
let secPerPx = 0.0;
let bResume = false;
let bMusicPlaying = false;

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
let currSliceEnd = 0;
let currClave = 0;
let currPos = 0;
let currPosA = 0;
let currPosB = 0;
let currMsA = 0;
let currMsB = 0;
let currPxPerMs = 0;


function preload() {
  xml = loadXML('images/chop70_1.xml');
  schematic = loadImage('images/chop70_1.jpg');

}


function setSlice(newSlice) {
  if ((newSlice >= 0) && (newSlice < slices.length-1)) {
    currSlice = newSlice;
    currSliceEndPos = slices[currSlice+1].getNum('pos');
  }
}

function setClave(newClave) {
  if ((newClave >= 0) && (newClave < claves.length-1)) {
     currClave = newClave;
     if (currClave >= cTotal-1) {
      music.stop();
      setClave(0);
     }
     else {
        currPosA = claves[currClave].getNum('posA');
        currPosB = claves[currClave].getNum('posB');
        currMsA = claves[currClave].getNum('msA');
        currMsB = claves[currClave].getNum('msB');
        currPxPerMs = ((currPosB-currPosA)*pxPerPos)/(currMsB-currMsA);
     }
  }
}

function prepare() {
  dragDist = 0;
  
  w = schematic.width;
 
  secPerPx = music.duration() / w;
 
  slices = xml.getChildren('slice');
  score = slices[0].getParent().getParent();
  claves = xml.getChildren('clave');

  cTotal = score.getNum('cTotal');
  posTotal = score.getNum('posTotal');
  pxTotal = score.getNum('pxTotal');
  pxPerPos = pxTotal / posTotal;
  setSlice(0);
  
  // find width of the widest slice
  let maxW = 0;
  for (let i = 1; i < slices.length; i++) {
    let sx = pxPerPos * slices[i - 1].getNum('pos');
    let sw = pxPerPos * slices[i].getNum('pos') - sx;
    if (sw > maxW) maxW = sw;
  }
  // create and fill image of slices and add keypoints to music
  schematic_split = createImage(maxW, schematic.height * (slices.length - 1));
  for (let i = 1; i < slices.length; i++) {
    let sx = pxPerPos * slices[i - 1].getNum('pos');
    let sw = pxPerPos * slices[i].getNum('pos') - sx;
    if (sw > maxW) maxW = sw;
    let value = slices[i - 1].getString('value');
    schematic_split.copy(schematic, sx, 0, sw, schematic.height, 0, (i - 1) * schematic.height, sw, schematic.height);
   // text(value, 100, i*(schematic.height+22));
  }

  for (let i = 0; i < claves.length; i++) {
    music.addCue(claves[i].getNum('msA')/1000, setClave, i); //
  }
}

function windowResized() {
  adjustZoom();
  resizeCanvas(cw, ch);
}


function adjustZoom() {
  cw = windowWidth - 2 * gap;
  ch = windowHeight - gap;
  chc = cw / 2;

  spaceX = cw - 2 * gap;
  spaceY = ch - schematic.height - 3 * gap;

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


}

function setup() {

    music = createAudio('audio/chop70_1.mp3');

  prepare();


  adjustZoom();
  createCanvas(cw, ch);
  background(255, 0, 255);
  music.play();
  bMusicPlaying = true;
}


function mousePressed() {
 // if (music.isPlaying()) {
    // .isPlaying() returns a boolean
    music.stop(); // .play() will resume from .pause() slice
    bMusicPlaying = false;
 // }
  mouseDownX = mouseX;
//  musicDownPos = music.currentTime();
  musicDownPos = music.time();
}

function mouseClicked() {
  /*
  if (music.isPlaying()) {
    // .isPlaying() returns a boolean
    music.pause(); // .play() will resume from .pause() slice
    background(255, 0, 0);
  } else {
    music.play();
    background(0, 255, 0);
  }
  */
}

function mouseDragged() {
  let tempDragDist = mouseDownX - mouseX;

  let newPos = leftPos + tempDragDist;
  if (newPos > w) dragDist = w - leftPos;
  else if (newPos < 0) dragDist = -leftPos;
  else {
    dragDist = tempDragDist;

  }
 
  // prevent default
  return false;
}

function mouseReleased() {
  leftPos = leftPos + dragDist;
  dragDist = 0;
  bResume = true;
}


function draw() {
  translate(0, gap);
  if (bMusicPlaying) {
    background(255, 0, 0);
    fill(0, 128, 255);
    leftPos = currPosA*pxPerPos+(music.time()*1000-currMsA)*currPxPerMs;
    image(schematic, chc - leftPos, 0);
    fill(255, 255, 0);
    rect(chc, 0, 4, schematic.height);
  }
  else if (!bResume) {
    background(255, 0, 0);
    fill(0, 128, 255);
    image(schematic, chc - (leftPos + dragDist), 0);
    fill(255, 255, 0);
    rect(chc, 0, 4, schematic.height);
  }
  else {
    bResume = false;

    music.play().time(leftPos * secPerPx);
    bMusicPlaying = true;
    //music.play(0, music.rate(), 1.0, leftPos * secPerPx);
  }

fill(255);
  textSize(20);
  text('cTotal '+cTotal+', claves length '+claves.length+' currClave '+currClave+' currPos '+int(leftPos/pxPerPos)+' ms '+int(music.time()*1000), 10, 22);//(leftPos + dragDist)*secPerPx, 10, 22);

  translate((cw - schematic_split.width * zoom) / 2, schematic.height + gap);
  scale(zoom, zoom);
  image(schematic_split, 0, 0);
  
  
}
