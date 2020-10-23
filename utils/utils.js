import { canvas, width, height, workers, populate } from "../script.js";
const xCoordSpan = document.querySelector("#x-coord-span");
const yCoordSpan = document.querySelector("#y-coord-span");

export let zoomFactor = 2;

// These variables represent the side limits of the canvas: left, right, top, and bottom
export let initialXLeft = -2.5;
export let initialXRight = 1.5;
export let initialYTop = -2;
export let initialYBottom = 2;

// The new edges will vary with zoom level
export let newXLeft;
export let newXRight;
export let newYTop;
export let newYBottom;

// Canvas span adapted to the model's comparatively small coordinate space
export let sideToSide = 4;
export let topToBottom = 4;

export function getValueInNewRange(oldValue, oldMin, oldMax, newMin, newMax) {
    const oldRange = oldMax - oldMin;
    const newRange = newMax - newMin;
    const newValue = (((oldValue - oldMin) * newRange) / oldRange) + newMin;
    // console.log(oldValue, newValue, oldRange, newRange);
    return newValue;
}

export function getCoordFromIndex(index) { // From full image data index / 4, or whatever the for loop uses
    let xBefore = Math.round(index % width);
    let yBefore = Math.round(index / width) - 1;

    let x = getValueInNewRange(xBefore, 0, width, initialXLeft, initialXRight); // -2.5,1.5 (total difference must be same as other axis, to maintain proportions)
    let y = getValueInNewRange(yBefore, 0, width, initialYTop, initialYBottom);  // -2,2 (total difference must be same as other axis, to maintain proportions)

    return {x: x, y: y, xOriginal: xBefore, yOriginal: yBefore};
}

export function getIndexFromCoord(x, y) {
    return (y * width + x) - 1;
}

export function zoom(x,y){
    let convertedX = getValueInNewRange(x, 0, width, initialXLeft, initialXRight);
    let convertedY = getValueInNewRange(y, 0, height, initialYTop, initialYBottom);

    sideToSide /= zoomFactor;
    topToBottom /= zoomFactor;

    // Apply zoom (in each direction, half of the difference between opposite sides)
    initialXLeft = convertedX - sideToSide / 2;
    initialXRight = convertedX + sideToSide / 2;
    initialYTop = convertedY - topToBottom / 2;
    initialYBottom = convertedY + topToBottom / 2;

    console.log(x,y,convertedX,convertedY);
    //console.log(sideToSide, topToBottom);
    populate();
    // console.log(convertedX, convertedY, xDiff, yDiff);
}

// export function pan(x,y){
//     let convertedX = getValueInNewRange(x, 0, width, initialXLeft, initialXRight);
//     let convertedY = getValueInNewRange(y, 0, height, initialYTop, initialYBottom);

//     // Apply new canvas edge coords (in each direction, half of the difference between opposite sides)
//     initialXLeft = convertedX - sideToSide / 2;
//     initialXRight = convertedX + sideToSide / 2;
//     initialYTop = convertedY - topToBottom / 2;
//     initialYBottom = convertedY + topToBottom / 2;
//     populate();
// }


window.onload = () => {    
    canvas.addEventListener("click", e => {
        let xCoord = e.clientX - canvas.offsetLeft;
        let yCoord = e.clientY - canvas.offsetTop;
        
        zoom(xCoord, yCoord);
    })

// canvas.addEventListener("click", e => {
//         let xCoord = e.clientX - canvas.offsetLeft;
//         let yCoord = e.clientY - canvas.offsetTop;
        
//         pan(xCoord, yCoord);
//     })
    
    canvas.addEventListener("mousemove", e => {
        let xCoord = e.clientX - canvas.offsetLeft;
        let yCoord = e.clientY - canvas.offsetTop;

        let newX = getValueInNewRange(xCoord, 0, width, initialXLeft, initialXRight);
        let newY = getValueInNewRange(yCoord, 0, width, initialYTop, initialYBottom);

        xCoordSpan.textContent = `${newX}, ${xCoord}`;
        yCoordSpan.textContent = `${newY}, ${yCoord}`;
    })
}

export function createWorker(file){
    workers.push(new Worker(file));
}
