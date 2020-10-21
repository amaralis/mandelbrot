import { getValueInNewRange, getCoordFromIndex, getIndexFromCoord } from "./utils/utils.js";

const iterationSelector = document.querySelector("#max-iterations");
const form = document.querySelector("#options-form");
form.onsubmit = changeOptions;

export const canvas = document.querySelector("#mandelbrot");
const ctx = canvas.getContext("2d");
export const width = canvas.width;
export const height = canvas.height;

let imgData = ctx.getImageData(0, 0, width, height);
const pixels = imgData.data;

/* ========================================================== */

export let maxIterations = 100; // resolution/accuracy
const truePixelCount = pixels.length/4;

export function populate(){

    for(let i=0; i<pixels.length; i+=4){ // set/reset all rgba values in canvas
        pixels[i] = 0;
        pixels[i+1] = 0;
        pixels[i+2] = 0;
        pixels[i+3] = 255;
    }
    
    ctx.putImageData(imgData, 0, 0);
    

    for(let i=0; i<truePixelCount; i++){
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

    //maxIterations += 1000;
}

populate();


function changeOptions(e){
    e.preventDefault();
    maxIterations = parseInt(iterationSelector.value);
    populate();
}
