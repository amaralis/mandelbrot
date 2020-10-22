import { getValueInNewRange, getCoordFromIndex, getIndexFromCoord, createWorker } from "./utils/utils.js";

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
    // One logical core is going to have the main thread running in it, right?
    const numWorkers = navigator.hardwareConcurrency - 1;
    let workIterator = 0;

    while(workIterator !== numWorkers){
        createWorker("workers/pixelCruncher.js");
        workIterator++;
    }
    workIterator = 0;

    // const myWorker = new Worker("workers/pixelCruncher.js");
    // myWorker.postMessage(imgData, [imgData.data.buffer]);
    // myWorker.onmessage = e => {
    //     console.log(e.data);
        let newArr = new Uint8ClampedArray([...imgData.data]);
        let newImgData = new ImageData(newArr, width, height);
    //     ctx.putImageData(newImgData, 0, 0);
    // }

    // This was a dummy image data object, red canvas with a green strip
    // for(let i=0; i<newImgData.data.length; i+=4){ // set all rgba values in canvas
    //     newImgData.data[i] = 255;
    //     newImgData.data[i+1] = 0;
    //     newImgData.data[i+2] = 0;
    //     newImgData.data[i+3] = 255;
    // }
    // for(let i=50000; i<130000; i+=4){ // set all rgba values in canvas
    //     newImgData.data[i] = 150;
    //     newImgData.data[i+1] = 150;
    //     newImgData.data[i+2] = 150;
    //     newImgData.data[i+3] = 255;
    // }
    // console.log(newImgData.data.length/numWorkers, numWorkers);


    let imgDataChunkArr = [];
    let sliceSize = imgData.data.length/numWorkers;
    let sliceFrom = 0;
    let sliceTo = sliceSize;

    // Populate image data chunk array with as many uint8 arrays (sliced off our image data) as there are workers
    // Ship them off to their respective workers
    // Afterwards, merge them into one uint8 typed array, to build a new image data object with
    for(let i = 0; i < numWorkers; i++){
        imgDataChunkArr[i] = imgData.data.slice(sliceFrom, sliceTo);
        let tempImgData = new ImageData(imgDataChunkArr[i], width);

        // Don't mix up the chunks in the image data chunk array!
        workers[i].postMessage(tempImgData, [tempImgData.data.buffer]);
        workers[i].onmessage = res => {
            console.log(res);
            imgDataChunkArr[i] = res.data.data;
            console.log("New chunk array:", imgDataChunkArr);
        }

        sliceFrom = sliceTo;
        sliceTo += sliceSize;
        
        
    }



    // let arr1 = newImgData.data.slice(sliceFrom, sliceTo);
    // sliceFrom = sliceTo;
    // sliceTo = sliceFrom + sliceSize;
    // imgDataChunkArr.push(arr1);
    // let arr2 = newImgData.data.slice(sliceFrom, sliceTo);
    // sliceFrom = sliceTo;
    // sliceTo = sliceFrom + sliceSize;
    // imgDataChunkArr.push(arr2);
    // let arr3 = newImgData.data.slice(sliceFrom, sliceTo);
    // sliceFrom = sliceTo;
    // sliceTo = sliceFrom + sliceSize;
    // imgDataChunkArr.push(arr3);
    // let arr4 = newImgData.data.slice(sliceFrom, sliceTo);
    // sliceFrom = sliceTo;
    // sliceTo = sliceFrom + sliceSize;
    // imgDataChunkArr.push(arr4);
    // let arr5 = newImgData.data.slice(sliceFrom, sliceTo);
    // sliceFrom = sliceTo;
    // sliceTo = sliceFrom + sliceSize;
    // imgDataChunkArr.push(arr5);

    // console.log(arr1);
    // console.log(arr2);
    // console.log(arr3);
    // console.log(arr4);
    // console.log(arr5);
    // console.log(imgDataChunkArr);

    let newImgDataArr = new Uint8ClampedArray(newImgData.data.length);
    // console.log(newImgDataArr);

    let numArraysPushed = 0;

    // for(let i = 0; i < imgDataChunkArr.length; i++) {
    //     newImgDataArr.set(imgDataChunkArr[i], sliceSize*numArraysPushed);
    //     numArraysPushed++;
    // }

    numArraysPushed = 0;
    // console.log(newImgDataArr);
    let testNewImageData = new ImageData(newImgDataArr, width, height);
    // ctx.putImageData(newImgData, 0, 0); // Dummy image data
    // ctx.putImageData(testNewImageData, 0, 0);



    
    // let test1 = "test";
    // for(let i = 0; i < numWorkers; i++){
    //     createWorker("workers/pixelCruncher.js");
    //     workers[i].postMessage([test1]);
    // }

    //console.log(workers);

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
