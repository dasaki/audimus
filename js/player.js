var angle = 0;

let fileName = '';
let currDuration = '';
let secTotal = 0;
let currLang = 'es';
let audioFileName;
let composerName;
let pieceName;

let canvasDiv;
let button;
let slider;
let dropdown;

let music;
let cw = 500;
let CANVAS_HEIGHT = 600;
let ch = CANVAS_HEIGHT;
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
let bReadyToPlay = false;
let bFirstTime = true;
let bReloading = false;
let bThinking = true;
let bFirstDraw = true;

let schematic;
let schematic_split;

let posTotal;
let pxPerPos;
let zoom;

let spaceX;
let spaceY;
let currSlice = 0;
let currPosition = 0;
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
let sliceGAPFactor = 1.05;

var positions = [];
var slices = [];

let GAP = 50;
let SLICES_GAP = 1.05;
let TIME_TEXT_SIZE = 15;
let CANVAS_TEXT_SIZE = 25;





/*******************************************************************
*
*                               GET XML HTTP
*
*******************************************************************/

function getXmlHttp() {
  var xmlhttp;
  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (E) {
      xmlhttp = false;
    }
  }
  if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
    xmlhttp = new XMLHttpRequest();
  }
  return xmlhttp;
}
/*******************************************************************
*
*                               CLEAR SELECTOR BY ID
*
*******************************************************************/
function clearElementById(elementId) {
  var e = document.getElementById(elementId);
  e.innerHTML = "";
}

/*******************************************************************
*
*                               FILL SELECTOR BY ID
*
*******************************************************************/

function fillSelectorById(elementId, directory, extension, callback) {

  var req = getXmlHttp();
  var playerSelector = document.getElementById(elementId);

  bThinking = true;
  do {
    playerSelector.innerHTML = "<option value=\"loading\" selected>LOADING</option>";
  }
  while ("loading" != getCurrentSelectionValue(elementId));

  req.onreadystatechange = function () {
    if (req.readyState == 4) {
      if (req.status == 200) {
        if (req.responseText != "null") {
          playerSelector.innerHTML = req.responseText;
          
          callback(directory);
        }
      }
    }
  }
  try {
    currLang = getCurrentSelectionValue('lang-selector');
    req.open('GET', 'getfilelist.php?directory=' + directory + '&extension=' + extension + '&language=' + currLang, true);
    req.send(null);
  }
  catch (e) {
    window.alert("Unable to load the xml file list.");
    return;
  }
}

/*******************************************************************
*
*                               DISABLE SELECT
*
*******************************************************************/


function disableElement(elementId) {

  let e = document.getElementById(elementId);
  e.classList.add("disabled");
  var newAttr = document.createAttribute("disab");
    newAttr.value = "1";
    e.parentElement.attributes.setNamedItem(newAttr);

  return true;
}

/*******************************************************************
*
*                               ENABLE SELECT
*
*******************************************************************/


function enableElement(elementId) {

  let e = document.getElementById(elementId);
  if (e.classList.contains("disabled")) {
    e.classList.remove("disabled");
    var newAttr = document.createAttribute("disab");
    newAttr.value = "0";
    e.parentElement.attributes.setNamedItem(newAttr);
  }
  
}

/*******************************************************************
*
*                               GET CURRENT SELECTION
*
*******************************************************************/


function getCurrentSelectionValue(selectorId) {

  let e = document.getElementById(selectorId);
  return e.options[e.selectedIndex].value;
}

/*******************************************************************
*
*                               GET CURRENT SELECITON INDEX
*
*******************************************************************/


function getCurrentSelectionIndex(selectorId) {

  let e = document.getElementById(selectorId);
  return e.selectedIndex;
}



/*******************************************************************
*
*                               PARSE XML
*
*******************************************************************/

function parseXML(loadedXML) {

  let xmlSections = loadedXML.getChildren('position');

  let xmlPositions = loadedXML.getChildren('clave');

  posTotal = xmlSections[xmlSections.length - 1].getNum('pos');
  


  positions.length = 0;
  for (var i in xmlPositions) {
    let newPosition = {
      "posA": xmlPositions[i].getNum('posA'),
      "posB": xmlPositions[i].getNum('posB'),
      "msA": xmlPositions[i].getNum('msA'),
      "msB": xmlPositions[i].getNum('msB')
    };
    positions.push(newPosition);
  }
  secTotal =  positions[positions.length-1].msA/1000.0;

  slices.length = 0;
  for (var i in xmlSections) {
    let newSlice = {
      "pos": xmlSections[i].getNum('pos'),
      "value": xmlSections[i].getString('value'),
      "pxWidth": 0
    };
    slices.push(newSlice);
  }
}
/*******************************************************************
*
*                               ON XML LOADED
*
*******************************************************************/
function onXMLloaded(xml) {
  parseXML(xml);

  if (bFirstTime == true) {
    schematic_split = createImage(10, 10);
    music = createAudio('auditions/' + composerName + '/' + pieceName + '/' + fileName + '.mp3');
    bFirstTime = false;
  }
  else {
    music.attribute('src', 'auditions/' + composerName + '/' + pieceName + '/' + fileName + '.mp3');
  }
  
  currLang = getCurrentSelectionValue('lang-selector');
  let basename = 'auditions/' + composerName + '/' + pieceName + '/' + fileName + "_";
  schematic = loadImage(basename + currLang + '.jpg', prepareToPlay);
}

/*******************************************************************
*
*                               LOAD DATA
*
*******************************************************************/
function loadData() {
  if (bMusicPlaying) stopMusic();
  bReadyToPlay = false;
  fileName == 'loading';
  if (getCurrentSelectionIndex('movement-selector') > 0) {
    fileName = getCurrentSelectionValue('movement-selector');

    loadXML('auditions/' +
      composerName + '/' +
      pieceName + '/' +
      fileName + '.xml', onXMLloaded);
  }

}
/*******************************************************************
*
*                               LOAD MOVEMENTS
*
*******************************************************************/
function loadMovements() {
  if (bMusicPlaying) stopMusic();
  bReadyToPlay = false;
  if (getCurrentSelectionIndex('piece-selector') > 0) {
    pieceName = getCurrentSelectionValue('piece-selector');
    if (disableElement('movement-selector')) {
      fillSelectorById('movement-selector', 'auditions/' +
        composerName + '/' +
        pieceName, "xml", reLoad);
    }
    enableElement('movement-selector');
  } else {
    disableElement('movement-selector')
    clearElementById('movement-selector');
    
  }
}

/*******************************************************************
*
*                               LOAD PIECES
*
*******************************************************************/
function loadPieces() {
  if (bMusicPlaying) stopMusic();
  bReadyToPlay = false;
  fileName = '';
  if (getCurrentSelectionIndex('composer-selector') > 0) {
    composerName = getCurrentSelectionValue('composer-selector');
    if (disableElement('piece-selector') && disableElement('movement-selector')) {
      fillSelectorById('piece-selector', 'auditions/' + composerName, "", loadMovements);
    }
    enableElement('piece-selector');
  } else {
    disableElement('piece-selector');
    clearElementById('piece-selector');
    disableElement('movement-selector')
    clearElementById('movement-selector');
  }
}

/*******************************************************************
*
*                               PRELOAD
*
*******************************************************************/
function preload() {
  bReadyToPlay = false;
  if (disableElement('piece-selector') && disableElement('movement-selector')) {
    fillSelectorById('composer-selector', 'auditions', "", loadPieces);
  }

}

/*******************************************************************
*
*                              RELOAD
*
*******************************************************************/
function reLoad() {
  if (bReloading) return;
  else {
    fileName = '';
    bThinking = true;
    bReloading = true;
    bReadyToPlay = false;
    if (bMusicPlaying) stopMusic();
    if (getCurrentSelectionIndex('movement-selector') > 0) {
      // in case very fast changes on the file list selector
      do {
        loadData();
      }
      while (fileName != getCurrentSelectionValue('movement-selector'));
    }
    bReloading = false;
    
  }
}

/*******************************************************************
*
*                               SETUP
*
*******************************************************************/

function setup() {
  canvasDiv = document.getElementById('player-canvas-div');
  var canvas = createCanvas(cw, ch);
  canvas.parent(canvasDiv);

  button = createButton('<i class="fa fa-play">');
  button.id('player-button');
  button.parent('player-controls-div');
  button.addClass('disabled');
  button.mousePressed(playPause);

  background(0);

  bMusicPlaying = false;
}

/*******************************************************************
*
*                               PLAY PAUSE
*
*******************************************************************/
function playPause() {
  if (bMusicPlaying) {
    button.html('<i class="fa fa-play">');
    music.pause();
    bMusicPlaying = false;
  } else {
    button.html('<i class="fa fa-pause">');
    music.play().time(currSec);
    bMusicPlaying = true;
  }
}

/*******************************************************************
*
*                               STOP MUSIC
*
*******************************************************************/
function stopMusic() {
  button.html('<i class="fa fa-play">');
  music.stop();
  bMusicPlaying = false;
}

/*******************************************************************
*
*                               PREPARE TO PLAY
*
*******************************************************************/

function prepareToPlay() {


  currPos = 0;
  currSec = 0;
  currPxPos = 0;
  schXpos = 0;
  targetMs = 0;
  dragDist = 0;
  currSec = 0;


  sw = schematic.width;
  sh = schematic.height;

  pxPerPos = sw / posTotal;
  updateCurrSlice();

  // find width of the widest slice
  let maxW = 0;
  for (let i = 1; i < slices.length; i++) {
    let ssx = pxPerPos * slices[i - 1].pos;
    let ssw = pxPerPos * slices[i].pos - ssx;
    if (ssw > maxW) maxW = ssw;
  }
  // create and fill image of slices and add keypoints to music
  schematic_split = createImage(maxW, sh * SLICES_GAP * (slices.length - 1));

  for (let i = 1; i < slices.length; i++) {
    let ssx = pxPerPos * slices[i - 1].pos;
    slices[i - 1].width = pxPerPos * slices[i].pos - ssx;
    if (slices[i - 1].width > maxW) maxW = slices[i - 1].width;
    //    let value = slices[i - 1].value;
    // text(value, 100, i*(sh+22));
    schematic_split.copy(schematic, ssx, 0, slices[i - 1].width, sh, 0, (i - 1) * sh * sliceGAPFactor, slices[i - 1].width, sh);
  }
  slices.pop();

  music.clearCues();
  for (let i = 0; i < positions.length; i++) {
    music.addCue(positions[i].msA / 1000, setPosition, i); //
  }
 
  currDuration = nf(int(secTotal / 60), 2) + ':' + nf(int(secTotal) % 60, 2) + '\'' + nf(int(secTotal * 100) % 100, 2);
  adjustZoom();
  setPosition(0);
  enableElement('composer-selector');
  enableElement('piece-selector');
  enableElement('movement-selector');
  bReadyToPlay = true;

}

/*******************************************************************
*
*                               WINDOW RESIZED
*
*******************************************************************/
function windowResized() {
  adjustZoom();
}

/*******************************************************************
*
*                               ADJUST ZOOM
*
*******************************************************************/

function adjustZoom() {

  cw = canvasDiv.offsetWidth;
  ch = CANVAS_HEIGHT;//canvasDiv.offsetHeight;
  resizeCanvas(cw, ch);


  chc = cw / 2;

  spaceX = cw - 2 * GAP;
  spaceY = ch - sh - 3 * GAP;

  var propXschematic = schematic_split.width / schematic_split.height;
  var propXspace = spaceX / spaceY;

  // var propYschematic = schematic_split.width / schematic_split.height;
  //var propXspace = spaceX / spaceY;


  if (propXschematic > 1) {
    if (propXspace > propXschematic) zoom = spaceY / schematic_split.height;
    else zoom = spaceX / schematic_split.width;
  }
  else {

    if (propXspace < propXschematic) zoom = spaceX / schematic_split.width;
    else zoom = spaceY / schematic_split.height;
  }
  // calculate position of scaled sliced schematic
}


/*******************************************************************
*
*                               UPDATE CURRENT SLICE
*
*******************************************************************/
function updateCurrSlice() {
  let i = slices.length - 1;
  while ((i > 0) && (slices[i].pos >= currPosB)) i--;
  currSlice = i;
}

/*******************************************************************
*
*                               SET Position
*
*******************************************************************/
function setPosition(newPosition) {
  if ((newPosition >= 0) && (newPosition < positions.length)) {
    currPosition = newPosition;
    if (currPosition >= positions.length - 1) {
      stopMusic();
      currSec = 0;
      currPxPos = 0;
      schXpos = 0;
      setPosition(0);
    }
    else {
      currPosA = positions[currPosition].posA;
      currPosB = positions[currPosition].posB;
      currMsA = positions[currPosition].msA;
      currMsB = positions[currPosition].msB;
      currPxPerMs = ((currPosB - currPosA) * pxPerPos) / (currMsB - currMsA);
      if (currPxPerMs < 0) currPxPerMs = 0;
      updateCurrSlice();
    }
  }
}

/*******************************************************************
*
*                              KEY PRESSED
*
*******************************************************************/
function keyPressed() {

}

function mouseOverSchematic() {
  return (mouseY > GAP) && (mouseY < GAP + sh) &&
    (mouseX > chc - (currPxPos + dragDist)) && (mouseX < chc - currPxPos + sw);
}
function mouseOverSlices() {
  return (mouseY > 2 * GAP + sh) && (mouseY < ch - GAP) &&
    (mouseX > (cw - schematic_split.width * zoom) / 2) && (mouseX < (cw + schematic_split.width * zoom) / 2);
}
/*******************************************************************
*
*                               MOUSE PRESSED
*
*******************************************************************/
function mousePressed() {


  if (mouseOverSchematic()) {
    if (bMusicPlaying) {
      stopMusic();
      bWasPlaying = true;
      bMusicPlaying = false;
    }
    else bWasPlaying = false;
    mouseDownX = mouseX;
    bDragging = true;
    mouseDragged();
    return;
  }
  else bDragging = false;


  if (mouseOverSlices()) {
    if (bMusicPlaying) {
      stopMusic();
      bWasPlaying = true;
      bMusicPlaying = false;
    }
    else bWasPlaying = false;
    bDraggingSliced = true;
    mouseDragged();
    return;
  }
  else bDraggingSliced = false;

}

/*******************************************************************
*
*                               MOUSE DRAGGED
*
*******************************************************************/

function mouseDragged() {
  currSec = ((currPxPos + dragDist - currPosA * pxPerPos) / currPxPerMs + currMsA) / 1000.0;
  if (bDragging) {
    let tempDragDist = mouseDownX - mouseX;

    let newPos = currPxPos + tempDragDist;
    if (newPos > sw) dragDist = sw - currPxPos;
    else if (newPos < 0) dragDist = -currPxPos;
    else {
      dragDist = tempDragDist;
    }
  }
  else if (bDraggingSliced &&
    (mouseX >= (cw - schematic_split.width * zoom) / 2) &&
    (mouseX <= (cw + schematic_split.width * zoom) / 2) &&
    (mouseY > (2 * GAP + sh)) &&
    (mouseY < (2 * GAP + sh + schematic_split.height * zoom))) {

    let pressedSlicePx = 0;


    let sliceH = sh * sliceGAPFactor * zoom;

    let draggedSlice = int((mouseY - (2 * GAP + sh)) / sliceH);
    currSec = ((currPxPos - currPosA * pxPerPos) / currPxPerMs + currMsA) / 1000.0;
    for (var i = 0; i < draggedSlice; i++) {
      pressedSlicePx += slices[i].width;
    }


    let slicePxOffset = 1;
    if (mouseX >= (cw - schematic_split.width * zoom) / 2) {
      slicePxOffset = (mouseX - (cw - schematic_split.width * zoom) / 2) / zoom;
      if (slicePxOffset > slices[i].width) slicePxOffset = slices[draggedSlice].width;
    }

    let targetPxPos = pressedSlicePx + slicePxOffset;
    let tempDragDist = targetPxPos - currPxPos;

    let newPos = currPxPos + tempDragDist;
    if (newPos > sw) dragDist = sw - currPxPos;
    else if (newPos < 0) dragDist = -currPxPos;
    else {
      dragDist = tempDragDist;
    }
  }

  //return false;
}

/*******************************************************************
*
*                               MOUSE RELEASED
*
*******************************************************************/
function mouseReleased() {
  if (bDragging || bDraggingSliced) {
    mouseDragged();
    currPxPos = currPxPos + dragDist;
    currSec = ((currPxPos - currPosA * pxPerPos) / currPxPerMs + currMsA) / 1000.0;
    dragDist = 0;
    bResume = true;
    bDraggingSliced = false;
    bDragging = false;
  }
}


/*******************************************************************
*
*                               DRAW
*
*******************************************************************/
function draw() {


  if (bFirstDraw) {
    cw = canvasDiv.offsetWidth;
    ch = CANVAS_HEIGHT;//canvasDiv.offsetHeight;
    resizeCanvas(cw, ch);
    bFirstDraw = false;
  }



  if (bResume) {
    if (bWasPlaying) playPause();
    bResume = false;
  }
  else if (bReadyToPlay) {
    bThinking = false;


    if (bDragging || bDraggingSliced) {
      if (bDragging) cursor('grabbing');
      schXpos = currPxPos + dragDist;
      let targetPos = schXpos / pxPerPos;
      let i = 0;
      while ((i < positions.length) && (positions[i].posB < targetPos)) i++;
      setPosition(i);
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
    else {
      schXpos = currPxPos;
      button.removeClass('disabled');
    }

    if (mouseOverSchematic()) cursor('grab');
    else if (mouseOverSlices()) cursor(HAND);
    else cursor(ARROW);
    background(0);

    /*
        textSize(20);
    textAlign(LEFT);
        text('fileName: ' + fileName + ' slice ' + slices[currSlice].value + ', positions  ' + positions.length + ' posiciones ' + posTotal +
          ' currPosition ' + currPosition + ' currPos ' + int(currPxPos / pxPerPos) + ' Tempo: ' +(1000*currPxPerMs/pxPerPos).toFixed(2)+ 'bars/sec   Time ' +
          int(music.time()) + ' targetms ' + targetMs, 10, 22);
    */

    
    /* textAlign(CENTER);
     text( nf(int(currSec/60), 2) + ':' + nf(int(currSec)%60,2)+'\''+ nf(int(currSec*100)%100,2), cw/2, 22);
     */


    push();
    translate(0, GAP);
    fill(255);
    stroke(0);
    strokeWeight(1);

    image(schematic, chc - schXpos, 0);
    fill(255, 255, 0);
    strokeWeight(2);
    rect(chc, 0, 4, sh);

    translate((cw - schematic_split.width * zoom) / 2, sh + GAP);
    scale(zoom, zoom);

    image(schematic_split, 0, 0);
    strokeWeight(2.0 / zoom);
    rect(schXpos - slices[currSlice].pos * pxPerPos, currSlice * sh * sliceGAPFactor, 4 / zoom, sh);
    pop();


    translate(0, ch-TIME_TEXT_SIZE*1.5);
    noStroke();
    fill(50);
    rect(0, 0, cw, TIME_TEXT_SIZE*1.5);
    fill(75);
    rect(0, 0, cw * currSec / secTotal, TIME_TEXT_SIZE*1.5);
    fill(200);

    textSize(TIME_TEXT_SIZE);
    textAlign(LEFT);
    text(nf(int(currSec / 60), 2) + ':' + nf(int(currSec) % 60, 2) + '\'' + nf(int(currSec * 100) % 100, 2), 10, TIME_TEXT_SIZE*1.1);
    textAlign(RIGHT);
    text(currDuration, cw - 10,  TIME_TEXT_SIZE*1.1);
    
  }
  else {
    button.addClass('disabled');
    background(120);
    fill(255);
    translate(width / 2, height / 2);
    
    if (fileName == 'none') {
      cursor(ARROW);
      textSize(CANVAS_TEXT_SIZE);
      strokeWeight(0);
      textAlign(CENTER);
      if (currLang == 'en') text('NOT AVAILABLE', 0, 0);
      else if (currLang == 'es') text('NO DISPONIBLE', 0, 0);
    }
    else if (fileName == '') {
      cursor(ARROW);
      textSize(CANVAS_TEXT_SIZE);
      strokeWeight(0);
      textAlign(CENTER);
      if (currLang == 'en') {
        if (getCurrentSelectionIndex('composer-selector') == 0) text('SELECT COMPOSER', 0, 0);
        else if (getCurrentSelectionIndex('piece-selector') == 0) text('SELECT WORK', 0, 0);
        else if (getCurrentSelectionIndex('movement-selector') == 0) text('SELECT MOVEMENT', 0, 0);
         
      }
      else if (currLang == 'es') {
        if (getCurrentSelectionIndex('composer-selector') == 0) text('SELECCIONE COMPOSITOR', 0, 0);
        else if (getCurrentSelectionIndex('piece-selector') == 0) text('SELECCIONE OBRA', 0, 0);
        else if (getCurrentSelectionIndex('movement-selector') == 0) text('SELECCIONE MOVIMIENTO', 0, 0);
      }
    }
    else if (bThinking == true) {
      cursor(WAIT);
      rotate(angle);
      strokeWeight(4);
      stroke(255);
      line(0, 0, 50, 0);
      angle += 0.1;
    }
    
    
  }
}

/*******************************END OF FILE*********************************/