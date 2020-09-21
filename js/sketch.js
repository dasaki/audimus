
let music;
let cw;
let ch;
let w;
let h = 100;
let chc;
let leftPos = 0;
let topPos = (ch-h)/2;
let mouseDownX = 0;
let songDownPos = 0;
let dragDist = 0;
let secPerPx = 0.0;
let bFirstFrame = false;

let schematic;
let schematic_split;
let xml;
let cTotal;
let posTotal;
let pxTotal;
let pxPerPos;
let zoom ;
let gap = 25;
let spaceX;
let spaceY;


function preload() {
  xml = loadXML('images/bee1_sp1.xml');
  schematic = loadImage('images/bee1_sp1.jpg');
  music = loadSound('audio/bee1_sp1.mp3');
}

function windowResized() {
  adjustZoom();
  resizeCanvas(cw, ch);
  
}


function adjustZoom() {
  cw = windowWidth-2*gap;
  ch = windowHeight-gap;
  chc = cw/2;

  spaceX = cw-2*gap;
  spaceY = ch-schematic.height-3*gap;
  
  let propXschematic = schematic_split.width/schematic_split.height;
  let propXspace = spaceX/spaceY;
  if (propXschematic > 1) {
      if (propXspace > propXschematic) zoom = spaceY/schematic_split.height; 
      else zoom = spaceX/schematic_split.width;
  }
  else {
    if (propYspace > propYschematic) zoom = spaceX/schematic_split.width; 
    else zoom = spaceY/schematic_split.height;
  }


}

function setup() {
  

  dragDist = 0;
  bFisrtfFrame = false;
  w = schematic.width;
  secPerPx = music.duration()/w;
  


  //  createCanvas(displayWidth, displayHeight);
    background(255,0,255);

  
  let positions = xml.getChildren('position');
  let score = positions[0].getParent().getParent();
  cTotal   = score.getNum('cTotal');
  posTotal = score.getNum('posTotal');
  pxTotal  = score.getNum('pxTotal');
  pxPerPos = pxTotal/posTotal;

 /* fill(0,0,0);
  textSize(20);
  text('cTotal ' + cTotal+', posTotal '+posTotal+', pxTotal '+pxTotal, 10, 22);
*/

  let maxW = 0;
  for (let i = 1; i < positions.length; i++) {
    let sx = pxPerPos*positions[i-1].getNum('pos');
    let sw = pxPerPos*positions[i].getNum('pos')-sx;
    if (sw > maxW) maxW = sw;
  }
  schematic_split = createImage(maxW, schematic.height*(positions.length-1));

  for (let i = 1; i < positions.length; i++) {
    let sx = pxPerPos*positions[i-1].getNum('pos');
    let sw = pxPerPos*positions[i].getNum('pos')-sx;
    if (sw > maxW) maxW = sw;
    let value = positions[i-1].getString('value');
    schematic_split.copy(schematic, sx, 0, sw, schematic.height, 0, (i-1)*schematic.height, sw, schematic.height);
   // text(value, 100, i*(schematic.height+22));
  }
  adjustZoom();
  createCanvas(cw, ch);
  music.loop(); 
}


function mousePressed() {
  if (music.isPlaying()) {
    // .isPlaying() returns a boolean
    music.stop(); // .play() will resume from .pause() position
  }
  mouseDownX = mouseX;
  musicDownPos = music.currentTime();
}

function mouseClicked() {
  /*
  if (music.isPlaying()) {
    // .isPlaying() returns a boolean
    music.pause(); // .play() will resume from .pause() position
    background(255, 0, 0);
  } else {
    music.play();
    background(0, 255, 0);
  }
  */
}

function mouseDragged() {
  let tempDragDist =  mouseDownX-mouseX;

  let newPos = leftPos+tempDragDist;
  if (newPos > w) dragDist = w-leftPos;
  else if (newPos < 0) dragDist = -leftPos;
  else  {
    dragDist = tempDragDist;
    
  }
  // prevent default
  return false;
}

function mouseReleased() {
  leftPos = leftPos + dragDist;
  dragDist = 0;
  bFirstFrame = true;
 music.play(0, music.rate(), 1.0, leftPos*secPerPx);
}


function draw() {
  translate(0,gap);
  if (bFirstFrame == false) {
      background(255, 0, 0);
      fill(0,128,255);
    // rect(chc-w*music.currentTime()/music.duration()  , topPos, w, h);
    if (music.isPlaying()) {
      leftPos = music.currentTime()/secPerPx;
//      rect(chc-w*music.currentTime()/music.duration()  , topPos, w, h);
        image(schematic, chc-w*music.currentTime()/music.duration(), 0);

    }
    else //rect(chc-(leftPos + dragDist), topPos, w, h);
        image(schematic, chc-(leftPos + dragDist), 0);
        
    
      fill(255,255,0);
      rect(chc, 0, 4,schematic.height);
      fill(255);
      textSize(20);
     // text('x '+spaceX+', y '+spaceY+', p '+propXspace, 10, 22);//(leftPos + dragDist)*secPerPx, 10, 22);
     // text('ps', 10, 52);//(leftPos + dragDist)*secPerPx, 10, 22);
      // put drawing code here*/
  }
  else bFirstFrame = false;
  
  translate((cw-schematic_split.width*zoom)/2,schematic.height+gap);
  scale(zoom,zoom);
  image(schematic_split, 0,0);
}
