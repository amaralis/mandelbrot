import { getIndexFromCoord, createWorker, initialXLeft, initialXRight, initialYTop, initialYBottom } from "./utils/utils.js";

const iterationSelectorMandelbrot = document.querySelector("#mandelbrot-max-iterations");
const colorRangeSelectorMandelbrot = document.querySelector("#mandelbrot-hue-multiplier");
const hueShiftSelectorMandelbrot = document.querySelector("#mandelbrot-hue-shift");
const saturationSelectorMandelbrot = document.querySelector("#mandelbrot-saturation");
const lightnessSelectorMandelbrot = document.querySelector("#mandelbrot-lightness");
const formMandelbrot = document.querySelector("#mandelbrot-options-form");
formMandelbrot.onsubmit = changeOptions;

export const canvas = document.querySelector("#mandelbrot");
const ctx = canvas.getContext("2d");
export const width = canvas.width;
export const height = canvas.height;

let imgData = ctx.getImageData(0, 0, width, height);
let pixels = imgData.data;

/* ========================================================== */

export let maxIterations = 100; // resolution/accuracy
export let colorMultiplier = 1; // number of times hue can turn around the color wheel
export let hueShift = parseInt(hueShiftSelectorMandelbrot.value); // original hue angle on the wheel
export let saturation = parseInt(saturationSelectorMandelbrot.value);
export let lightness = parseInt(lightnessSelectorMandelbrot.value);
const truePixelCount = pixels.length/4;

// ===================================================================================

export let workers = [];

if(window.Worker){
    populate();
}

export function populate(){    
    // One logical core is going to have the main thread running in it, right?
    const numWorkers = navigator.hardwareConcurrency - 1;
    let workIterator = 0;
    let numResponses = 0;

    while(workIterator !== numWorkers){
        createWorker("workers/pixelCruncher.js");
        workIterator++;
    }

    // Divvy up the image into chunks depending on number of workers
    let imgDataChunkArr = new Array(numWorkers);
    let sliceSize = Math.round(truePixelCount / numWorkers);

    let newImgDataArr = [];

    for(let i = 0; i < numWorkers; i++){
        let indexStart = sliceSize*i;
        let messageObj = {
            indexStart,
            sliceSize,
            width,
            maxIterations,
            colorMultiplier,
            initialXLeft,
            initialXRight,
            initialYTop,
            initialYBottom
        };

        // Don't mix up the chunks in the image data chunk array!
        workers[i].postMessage({messageObj});
        workers[i].onmessage = res => {
            numResponses++;
            imgDataChunkArr[i] = res.data;

            if(numResponses === numWorkers){
                for(let i=0; i<imgDataChunkArr.length; i++){
                    newImgDataArr = [...newImgDataArr, ...imgDataChunkArr[i]];
                }

                for(let rows = 0; rows < height; rows++){
                    for(let cols = 0; cols < width; cols++){
                        let index = getIndexFromCoord(cols, rows);
                        let hue = Math.round(newImgDataArr[index]);

                        if(hue === 0){
                            ctx.fillStyle = `black`;
                            ctx.fillRect(cols, rows, 1, 1);
                        } else {
                            ctx.fillStyle = `hsl(${hue+hueShift}, ${saturation}%, ${lightness}%)`;
                            ctx.fillRect(cols, rows, 1, 1);
                        }
                    }
                }
            }
        }
    }

}

// ===================================================================================

function changeOptions(e){
    e.preventDefault();
    maxIterations = parseInt(iterationSelectorMandelbrot.value);
    colorMultiplier = parseInt(colorRangeSelectorMandelbrot.value);
    hueShift = parseInt(hueShiftSelectorMandelbrot.value);
    saturation = parseInt(saturationSelectorMandelbrot.value);
    lightness = parseInt(lightnessSelectorMandelbrot.value);
    populate();
}
