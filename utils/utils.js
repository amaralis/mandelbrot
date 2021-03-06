import { canvas, width, height, workers, populate, numWorkers } from "../script.js";
import { populateJulia } from "../julia.js";

const xCoordSpan = document.querySelector("#x-coord-span-mandelbrot");
const yCoordSpan = document.querySelector("#y-coord-span-mandelbrot");

const xCoordSpanJulia = document.querySelector("#x-coord-span-julia");
const yCoordSpanJulia = document.querySelector("#y-coord-span-julia");

export let zoomFactor = 2;

// Mandelbrot coords for corresponding Julia set
export let coordXMandelbrot = 0;
export let coordYMandelbrot = 0;

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

    return newValue;
}

export function getCoordFromIndex(index) { // From full image data index / 4, or whatever the for loop uses
    let xBefore = Math.round(index % width);
    let yBefore = Math.round(index / width) - 1;

    let x = getValueInNewRange(xBefore, 0, width, initialXLeft, initialXRight); // Total difference between left and right values must be same as other axis, to maintain proportions
    let y = getValueInNewRange(yBefore, 0, width, initialYTop, initialYBottom);  // Total difference between top and bottom values must be same as other axis, to maintain proportions

    return {x: x, y: y, xOriginal: xBefore, yOriginal: yBefore};
}

export function getIndexFromCoord(x, y) {
    return (y * width + x);
}

export function zoom(x,y){
    let convertedX = getValueInNewRange(x, 0, width, initialXLeft, initialXRight);
    let convertedY = getValueInNewRange(y, 0, height, initialYTop, initialYBottom);

    sideToSide /= zoomFactor;
    topToBottom /= zoomFactor;

    // Apply zoom (in each direction, half of the distance between opposite sides)
    initialXLeft = convertedX - sideToSide / 2;
    initialXRight = convertedX + sideToSide / 2;
    initialYTop = convertedY - topToBottom / 2;
    initialYBottom = convertedY + topToBottom / 2;

    populate();
}

window.onload = () => {
    canvas.addEventListener("dblclick", e => {
        let xCoord = e.clientX - canvas.offsetLeft;
        let yCoord = e.pageY - canvas.offsetTop;
        
        zoom(xCoord, yCoord);
    })
    canvas.addEventListener("click", e => {
        let xCoord = e.clientX - canvas.offsetLeft; // This can probably be pageX, too. Just not clientY
        let yCoord = e.pageY - canvas.offsetTop;
        
        let newX = getValueInNewRange(xCoord, 0, width, initialXLeft, initialXRight);
        let newY = getValueInNewRange(yCoord, 0, width, initialYTop, initialYBottom);
        
        coordXMandelbrot = newX;
        coordYMandelbrot = newY;

        xCoordSpanJulia.textContent = `${newX}, ${xCoord}`;
        yCoordSpanJulia.textContent = `${newY}, ${yCoord}`;

        populateJulia();
    })
    
    canvas.addEventListener("mousemove", e => {
        let xCoord = e.clientX - canvas.offsetLeft;
        let yCoord = e.pageY;

        let newX = getValueInNewRange(xCoord, 0, width, initialXLeft, initialXRight);
        let newY = getValueInNewRange(yCoord, 0, width, initialYTop, initialYBottom);

        xCoordSpan.textContent = `${newX}, ${xCoord}`;
        yCoordSpan.textContent = `${newY}, ${yCoord}`;
    })
}

export function createWorkers(file){
    if(workers.length !== numWorkers){
        let workIterator = 0;
        while(workIterator !== numWorkers){
            workers.push(new Worker(file));
            workIterator++;
        }
    }
}
