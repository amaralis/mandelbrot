import { getIndexFromCoord, getCoordFromIndex, getValueInNewRange, initialXLeft, initialXRight, initialYTop, initialYBottom, coordXMandelbrot, coordYMandelbrot } from "./utils/utils.js";
import { canvas as canvasMandelbrot } from "./script.js";

const iterationSelector = document.querySelector("#julia-max-iterations");
const colorRangeSelector = document.querySelector("#julia-hue-multiplier");
const hueShiftSelector = document.querySelector("#julia-hue-shift");
const saturationSelector = document.querySelector("#julia-saturation");
const lightnessSelector = document.querySelector("#julia-lightness");
const form = document.querySelector("#julia-options-form");
form.onsubmit = changeOptions;

const canvas = document.querySelector("#julia");
const ctx = canvas.getContext("2d");
export const width= canvas.width;
export const height = canvas.height;

let imgData = ctx.getImageData(0, 0, width, height);

export let maxIterations = 100; // resolution/accuracy
export let colorMultiplier = 1; // number of times hue can turn around the color wheel
export let hueShift = parseInt(hueShiftSelector.value); // original hue angle on the wheel
export let saturation = parseInt(saturationSelector.value);
export let lightness = parseInt(lightnessSelector.value);
const truePixelCount = imgData.data.length/4;

export function populateJulia() {
    let pixArr = [];
    for(let i=0; i<truePixelCount; i++){

        let coords = getCoordFromIndex(i);
            
        let realPt = coords.x; // - value pans the camera left
        let imaginPt = coords.y;
        
        let iterations = 0;
        let z = 0; // for julia sets only; C becomes constant, Z changes
    
        while(iterations<maxIterations){
            let newReal = realPt*realPt - imaginPt*imaginPt;
            let newImaginPt = 2 * realPt * imaginPt;
            
            realPt = newReal + coordXMandelbrot; // This is where the julia set differs from the mandelbrot set
            imaginPt = newImaginPt + coordYMandelbrot; // This is where the julia set differs from the mandelbrot set
            
            if(realPt+imaginPt > 8){ // Tendency towards infinity
                break;
            }
    
            iterations++;
        }
    
        /**
         *let hue = getValueInNewRange(iterations, 0, maxIterations, -180*(maxIterations/100), 180*(maxIterations/100)); 
         * 
         * This makes it more colorful, although it's arguable if it's prettier. It allows the hue angle to go beyond 0-360,
         * repeating hues as iterations fluctuate between 0 and max
         */
        
        let hue = getValueInNewRange(iterations, 0, maxIterations, 180, 360*colorMultiplier); // Reduce hue range for less colors
    
        if(iterations >= maxIterations){
            pixArr[i] = 0;
        } else {
            pixArr[i] = hue;
        }

    }
    
    for(let rows = 0; rows < height; rows++){
        for(let cols = 0; cols < width; cols++){
            // if(rows === 0 && cols === 599){
            //     console.log(getIndexFromCoord(cols, rows));
            // }
            let index = getIndexFromCoord(cols, rows);
            let hue = Math.round(pixArr[index]);

            if(hue === 0){
                ctx.fillStyle = `black`;
                ctx.fillRect(cols, rows, 1, 1);
            } else {
                ctx.fillStyle = `hsl(${hue+hueShift}, ${saturation}%, ${lightness}%)`;
                //ctx.clearRect(rows, cols, 1, 1);
                ctx.fillRect(cols, rows, 1, 1);
            }
        }
    }
}

function changeOptions(e){
    e.preventDefault();
    maxIterations = parseInt(iterationSelector.value);
    colorMultiplier = parseInt(colorRangeSelector.value);
    hueShift = parseInt(hueShiftSelector.value);
    saturation = parseInt(saturationSelector.value);
    lightness = parseInt(lightnessSelector.value);
    populateJulia();
}


export {canvas as canvasJulia};