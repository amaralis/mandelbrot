import { getValueInNewRange } from "./utils/utils.js";

const canvas = document.querySelector("#mandelbrot");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

let imgData = ctx.getImageData(0, 0, width, height);
const pixels = imgData.data;

// canvas.addEventListener("mousemove", (e) => {
//     xCoord = e.clientX - canvas.offsetLeft;
//     yCoord = e.clientY - canvas.offsetTop;
//     let index = getIndexFromCoord(xCoord, yCoord);
//     // console.log(yCoord);
//     // console.log(index);
//     console.log(getCoordFromIndex(index));
//     // console.log(xCoord);
//     // console.log(yCoord);
    
//     pixels[getIndexFromCoord(xCoord,yCoord)*4] = 255; // set red pixel value; add 1, 2, 3, for g, b, a

//     ctx.putImageData(imgData, 0, 0);
// });

function getCoordFromIndex(index) { // From full image data index / 4
    let xBefore = Math.round(index % width);
    let yBefore = Math.round(index / width) - 1;

    let x = getValueInNewRange(xBefore, 0, width, -2.5,1.5); // -2,2 (total difference must be same as other axis, to maintain proportions)
    let y = getValueInNewRange(yBefore, 0, width, -2,2);  // -2,2 (total difference must be same as other axis, to maintain proportions)

    return {x: x, y: y, xOriginal: xBefore, yOriginal: yBefore};
}

function getIndexFromCoord(x, y) {
    return (y * width + x) - 1;
}

for(let i=0; i<pixels.length; i+=4){ // set all rgba values in canvas
    pixels[i] = 0;
    pixels[i+1] = 0;
    pixels[i+2] = 0;
    pixels[i+3] = 255;
}

ctx.putImageData(imgData, 0, 0);

/* ========================================================== */

let maxIterations = 150; // resolution/accuracy

for(let i=0; i<pixels.length/4; i++){
    let coords = getCoordFromIndex(i);
    
    let realPt = coords.x; // - value pans the camera left
    let imaginPt = coords.y;
    let originalReal = coords.x; // These need to be saved; they represent C which is constant in mandelbrot's
    let originalImagin = coords.y; // These need to be saved; they represent C which is constant in mandelbrot's
    //console.log(realPt, imaginPt);

    let iterations = 0;
    let z = 0; // for julia sets only; C becomes constant, Z changes

    while(iterations<maxIterations){
        let newReal = realPt*realPt - imaginPt*imaginPt;
        let newImaginPt = 2 * realPt * imaginPt;

        realPt = newReal + originalReal; 
        imaginPt = newImaginPt + originalImagin;

        if(realPt+imaginPt > 8){ // Tendency towards infinity
            break;
        }
        iterations++;
    }

    let lightness = getValueInNewRange(iterations, 0, maxIterations, 0, 255);

    if(iterations >= maxIterations){
        lightness = 0;
    } else {
        // i is already divided by four, so we need to multiply again, to get only the red index in the image data array
        pixels[getIndexFromCoord(coords.xOriginal,coords.yOriginal)*4] = lightness;
        pixels[getIndexFromCoord(coords.xOriginal,coords.yOriginal)*4+1] = lightness-60;
        pixels[getIndexFromCoord(coords.xOriginal,coords.yOriginal)*4+2] = lightness+60;
        pixels[getIndexFromCoord(coords.xOriginal,coords.yOriginal)*4+3] = 255;
        ctx.putImageData(imgData, 0, 0);
    }
}