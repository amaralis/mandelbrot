import { getValueInNewRange, getCoordFromIndex, getIndexFromCoord, createWorker, initialXLeft, initialXRight, initialYTop, initialYBottom } from "./utils/utils.js";

const iterationSelector = document.querySelector("#max-iterations");
const form = document.querySelector("#options-form");
form.onsubmit = changeOptions;

export const canvas = document.querySelector("#mandelbrot");
const ctx = canvas.getContext("2d");
export const width = canvas.width;
export const height = canvas.height;

let imgData = ctx.getImageData(0, 0, width, height); // ImageData object is an ARRAYBUFFER object
let pixels = imgData.data;

/* ========================================================== */

export let maxIterations = 100; // resolution/accuracy
const truePixelCount = pixels.length/4;

// ===================================================================================

export let workers = [];

if(window.Worker){
    populate();
}

export function populate(){    
    // One logical core is going to have the main thread running in it, right? Yup...
    const numWorkers = navigator.hardwareConcurrency - 1;
    // const numWorkers = 1;
    let workIterator = 0;
    let numResponses = 0;

    while(workIterator !== numWorkers){
        createWorker("workers/pixelCruncher.js");
        workIterator++;
    }

    let imgDataChunkArr = new Array(numWorkers);
    let sliceSize = truePixelCount / numWorkers;

    let newImgDataArr = new Uint8ClampedArray(sliceSize*4*numWorkers);

    // Populate image data chunk array with as many uint8 arrays (sliced off our image data) as there are workers
    // Ship them off to their respective workers
    // Afterwards, merge them into one uint8 typed array, to build a new image data object with
    for(let i = 0; i < numWorkers; i++){
        let indexStart = sliceSize*i;
        let messageObj = {
            indexStart,
            sliceSize,
            width,
            maxIterations,
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
            newImgDataArr.set(res.data, sliceSize*4*i);

            if(numResponses === numWorkers){
                console.log("All workers responded");
                let newImgData = new ImageData(newImgDataArr, width);
                console.log(newImgData);
                ctx.putImageData(newImgData, 0, 0);

                
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
    maxIterations = parseInt(iterationSelector.value);
    populate();
}
