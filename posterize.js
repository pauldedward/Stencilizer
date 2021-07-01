let imageInput;
let imageElement;
let posterImage;

let noiseP;
let sketchP;
let bgP;
let mentionA;

let noiseValSlider;
let sketchColour;
let bgColour;
let stencilize;
let downloadButton;
let transparentBG;
let colors;
let bgAlphaValue;

let pixelArray = [];
let noisePxArray = [];
let noiseValArray = [];
let inc = 0;

function resetPage() {
    imageInput.remove();
    imageElement.remove();
    noiseValSlider.remove();
    sketchColour.remove();
    bgColour.remove();
    stencilize.remove();
    downloadButton.remove();
    transparentBG.remove();
    noiseP.remove();
    sketchP.remove();
    bgP.remove();
    mentionA.remove();

    posterImage = null;
    inc = 0;
    resizeCanvas(100,100);
    setup();
}

function addID() {
    imageInput.id("input-image");
    noiseValSlider.id("noise-slider");
    sketchColour.id("sketch-colour-picker");
    bgColour.id("bg-colour-picker");
    stencilize.id("stencilize-button");
    noiseP.id("noise-p");
    bgP.id("bg-p");
    sketchP.id("sketch-p");
    downloadButton.id("download-button");
    transparentBG.id("transparent-bg");
    mentionA.id("mention-a");
}

function addInputEvents() {
    noiseValSlider.input(()=> stencilize.show());
    sketchColour.input(()=> {
        changeColour();
        loop();
    });
    bgColour.input(()=> {
        changeColour();
        loop();
    });

    transparentBG.changed(()=> {
        if(transparentBG.checked()) {
            bgAlphaValue = 0;
            clear();
        } else {
            bgAlphaValue = 255;
        }
        changeColour();
        loop();
    });

}

function addMouseEvents() {

    noiseValSlider.mousePressed(()=> stencilize.show());
    
    downloadButton.mousePressed(()=> {
        saveCanvas("poster","png");
        imageInput.show();
        downloadButton.hide();
        resetPage();
    });

    stencilize.mousePressed(()=> {
        stencilize.hide();
        calculateAgain();
        changeColour();
        loop();
    });
}

function setup() {

    clear();
    //create DOM Elements
    imageInput = createFileInput(handleFile);
   
    noiseP = createP("Adjust noise using slider");
    noiseValSlider = createSlider(0 ,255 ,100 ,1);

    noiseValSlider.style("width", windowWidth / 1.5 + "px");
    
    sketchP = createP("sketch color");
    sketchColour = createColorPicker(50);
    
    bgP = createP("background colour");
    bgColour = createColorPicker(255);  
    
    transparentBG = createCheckbox("transparent BG", true);
    
    stencilize = createButton("stencilize");
    downloadButton = createButton("download");

    mentionA = createA("https://github.com/pauldedward/Stencilizer", "SourceCode Here", "_blank");


    colors = bgColour.color().levels;
    bgAlphaValue = 0;

    stencilize.hide();
    noiseValSlider.hide();
    downloadButton.hide();
    noiseP.hide();
    
    addID();

    addInputEvents();
    addMouseEvents();
    
    noLoop();
}

function draw() {
    if(inc >= noisePxArray.length - 1) {
        noLoop();
    }
    for(let i = 0; i < noisePxArray.length / 3 && inc < noisePxArray.length; i++) {
        
        // stroke(noisePxArray[inc][2],noisePxArray[inc][3],noisePxArray[inc][4],noisePxArray[inc][5]);
        point(noisePxArray[inc][0],noisePxArray[inc][1])
        inc++;
    }  
  
}

function handleFile(file) {
  if (file.type === 'image') {
    imageElement = createImg(file.data, "input-image", "anonymous");
    imageElement.id("image-element");
    imageElement.hide();

    let imageDOM = document.querySelector("#image-element"); 
    posterImage = loadImage(imageDOM.src, changeSizeOfImage);

    imageInput.hide();
  } else {
    imageElement = null;
    console.log("Not an image");
  }
}

function changeSizeOfImage() {

    if(posterImage.width >= posterImage.height) {
        let canvasWidth = map(posterImage.width, 0 ,posterImage.width, 0, windowWidth/1.5);
        posterImage.resize(canvasWidth, 0);
    } else {
        let canvasHeight = map(posterImage.height, 0 ,posterImage.height, 0, windowHeight/1.5);
        posterImage.resize(0, canvasHeight);
    }
    resizeCanvas(posterImage.width, posterImage.height);

    posterImage.loadPixels();
    stencilize.show();
    noiseValSlider.show();
    downloadButton.show();
    noiseP.show();
    image(posterImage,0,0);
}

function changeColour() {
    inc = 0;
    stroke(sketchColour.color());
    colors = bgColour.color().levels;
    background(colors[0],colors[1], colors[2], bgAlphaValue);
}

function calculateAgain() {
    let noiseSliderVal = noiseValSlider.value();

    pixelArray = [];
    noiseValArray = [];
    noisePxArray = [];
    inc = 0;

    for (let y = 0; y < posterImage.height; y++) {
        for (let x = 0; x < posterImage.width; x++) {
             let index = (x + y * posterImage.width) * 4;
             let r = posterImage.pixels[index + 0];
             let g = posterImage.pixels[index + 1];
             let b = posterImage.pixels[index + 2];
            //  let a = posterImage.pixels[index + 3];
             let avg = (r + g + b) / 3;
            //  let rg = Math.abs(r - g);
            //  let gb = Math.abs(g - b);
            //  let rb = Math.abs(r - b) 
             if(avg <= noiseSliderVal) {
                 // pixels[index + 0] = r;
                 // pixels[index + 1] = g;
                 // pixels[index + 2] = b;
                 // pixels[index + 3] = a;
                //  pixelArray.push([x, y, r, g, b, a]);
                pixelArray.push([x,y])
             }
         }
     }

     let zNoise = 0;

     pixelArray.sort(function(px) { return 0.5 - Math.random() });

     for(let i = 0; i < pixelArray.length; i++) {
         noiseValArray[i] = [noise(pixelArray[i][0], pixelArray[i][1], zNoise), i];
         zNoise += .1;
     }

     noiseValArray.sort((a, b) =>  b[0]-a[0]);
 
     for(let i = 0; i < noiseValArray.length; i++) {
         noisePxArray[i] = pixelArray[noiseValArray[i][1]];
     }
     clear();
}