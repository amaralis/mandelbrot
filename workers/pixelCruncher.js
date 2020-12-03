// module import still seems iffy for firefox; copy-pasting stuff from utils for safety

self.onmessage = e => {
    let {indexStart, sliceSize, width, maxIterations, colorMultiplier, initialXLeft, initialXRight, initialYTop, initialYBottom} = e.data.messageObj;
    let imgDataArr = new Array(sliceSize);
    
    populate(imgDataArr, indexStart);

    function populate(arr, startingIndex) {
    
        for(let i=0; i<sliceSize; i++){
            let coords = getCoordFromIndex(i+startingIndex); // Remember each worker's array starts at different coords
            
            let realPt = coords.x;
            let imaginPt = coords.y;
    
            let originalReal = coords.x; // These need to be saved; they represent C, which is constant in mandelbrot's set
            let originalImagin = coords.y; // These need to be saved; they represent C, which is constant in mandelbrot's set
            
            let iterations = 0;
        
            while(iterations<maxIterations){
                let newReal = realPt*realPt - imaginPt*imaginPt;
                let newImaginPt = 2 * realPt * imaginPt;
        
                realPt = newReal + originalReal; 
                imaginPt = newImaginPt + originalImagin;

                // if (realPt*realPt + imaginPt*imaginPt > 8) { // Tendency towards infinity; experimental; needs work
                //     let delta = log(log(sqrt(realPt*realPt + imaginPt*imaginPt)))/log(2);
                //     hue = ((iterations - delta)/colorMultiplier) % 360;
                //     break;
                // }

                if (realPt + imaginPt > 8) { // Tendency towards infinity
                    break;
                }

                iterations++;
            }
            
            let hue = getValueInNewRange(iterations, 0, maxIterations, 180, 360*colorMultiplier); // Reduce hue range for less colors
        
            if(iterations >= maxIterations){
                arr[i] = 0;
            } else {
                arr[i] = hue;
            }
        }
    }

    function getValueInNewRange(oldValue, oldMin, oldMax, newMin, newMax) {
        const oldRange = oldMax - oldMin;
        const newRange = newMax - newMin;
        const newValue = (((oldValue - oldMin) * newRange) / oldRange) + newMin;
        return newValue;
    }
    
    function getCoordFromIndex(index) {
        let xBefore = Math.round(index % width);
        let yBefore = Math.round(index / width) - 1;
    
        let x = getValueInNewRange(xBefore, 0, width, initialXLeft, initialXRight); // Total difference between left and right values must be same as other axis, to maintain proportions
        let y = getValueInNewRange(yBefore, 0, width, initialYTop, initialYBottom);  // Total difference between top and right bottom must be same as other axis, to maintain proportions
    
        return {x: x, y: y, xOriginal: xBefore, yOriginal: yBefore};
    }
    
    self.postMessage(imgDataArr);
}