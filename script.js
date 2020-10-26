import { getValueInNewRange, getCoordFromIndex, getIndexFromCoord, createWorker, initialXLeft, initialXRight, initialYTop, initialYBottom } from "./utils/utils.js";

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

let imgData = ctx.getImageData(0, 0, width, height); // ImageData object is an ARRAYBUFFER object
let pixels = imgData.data;

/* ========================================================== */

export let maxIterations = 100; // resolution/accuracy
export let colorMultiplier = 1; // number of times hue can turn around the color wheel
export let hueShift = 0; // original hue angle on the wheel
export let saturation = parseInt(saturationSelectorMandelbrot.value);
export let lightness = parseInt(lightnessSelectorMandelbrot.value);
const truePixelCount = pixels.length/4;

// ===================================================================================

export let workers = [];

if(window.Worker){
    populate();
}

export function populate(){    
    // One logical core is going to have the main thread running in it, right? Yup...
    const numWorkers = navigator.hardwareConcurrency - 1;
    let workIterator = 0;
    let numResponses = 0;

    while(workIterator !== numWorkers){
        createWorker("workers/pixelCruncher.js");
        workIterator++;
    }

    let imgDataChunkArr = new Array(numWorkers);
    let sliceSize = truePixelCount / numWorkers;

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
            console.log(res.data);
            imgDataChunkArr[i] = res.data;
            console.log(imgDataChunkArr);
            //newImgDataArr.set(res.data, sliceSize*4*i);

            if(numResponses === numWorkers){
                console.log("All workers responded");
                //let newImgData = new ImageData(newImgDataArr, width);
                for(let i=0; i<imgDataChunkArr.length; i++){
                    newImgDataArr = [...newImgDataArr, ...imgDataChunkArr[i]];
                    console.log(newImgDataArr);
                }    
                console.log(newImgDataArr);

                for(let rows = 0; rows < height; rows++){
                    for(let cols = 0; cols < width; cols++){
                        // if(rows === 0 && cols === 599){
                        //     console.log(getIndexFromCoord(cols, rows));
                        // }
                        let index = getIndexFromCoord(cols, rows);
                        let hue = Math.round(newImgDataArr[index]);

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
        }
    }
}

// ===================================================================================


// export function populate(){
    // console.log(imgData.data);
    // for(let i=0; i<pixels.length; i+=4){ // set/reset all rgba values in canvas
    //     pixels[i] = 0;
    //     pixels[i+1] = 0;
    //     pixels[i+2] = 0;
    //     pixels[i+3] = 255;
    // }
    // console.log(imgData.data);
    
    // ctx.putImageData(imgData, 0, 0);
    // console.log(imgData.data);
    

//     for(let i=0; i<truePixelCount; i++){
//         let coords = getCoordFromIndex(i);
        
//         let realPt = coords.x; // - value pans the camera left
//         let imaginPt = coords.y;

//         let originalReal = coords.x; // These need to be saved; they represent C which is constant in mandelbrot's
//         let originalImagin = coords.y; // These need to be saved; they represent C which is constant in mandelbrot's
//         //console.log(realPt, imaginPt);
    
//         let iterations = 0;
//         let z = 0; // for julia sets only; C becomes constant, Z changes
    
//         while(iterations<maxIterations){
//             let newReal = realPt*realPt - imaginPt*imaginPt;
//             let newImaginPt = 2 * realPt * imaginPt;
    
//             realPt = newReal + originalReal; 
//             imaginPt = newImaginPt + originalImagin;
    
//             if(realPt+imaginPt > 8){ // Tendency towards infinity
//                 break;
//             }
//             iterations++;
//         }
    
//         let lightness = getValueInNewRange(iterations, 0, maxIterations, 0, 255);
    
//         if(iterations >= maxIterations){
//             lightness = 0;
//         } else {
//             // i is already divided by four, so we need to multiply again, to get only the red index in the image data array
//             pixels[getIndexFromCoord(coords.xOriginal,coords.yOriginal)*4] = lightness;
//             pixels[getIndexFromCoord(coords.xOriginal,coords.yOriginal)*4+1] = lightness-60;
//             pixels[getIndexFromCoord(coords.xOriginal,coords.yOriginal)*4+2] = lightness+60;
//             pixels[getIndexFromCoord(coords.xOriginal,coords.yOriginal)*4+3] = 255;
//             ctx.putImageData(imgData, 0, 0);
//         }
//     }

//     //maxIterations += 1000;
// }

//populate();

function changeOptions(e){
    e.preventDefault();
    maxIterations = parseInt(iterationSelectorMandelbrot.value);
    colorMultiplier = parseInt(colorRangeSelectorMandelbrot.value);
    hueShift = parseInt(hueShiftSelectorMandelbrot.value);
    saturation = parseInt(saturationSelectorMandelbrot.value);
    lightness = parseInt(lightnessSelectorMandelbrot.value);
    populate();
}
