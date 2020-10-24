// module import still seems iffy for firefox; copy-pasting stuff from utils for safety

self.onmessage = e => {
    let {indexStart, sliceSize, width, maxIterations, initialXLeft, initialXRight, initialYTop, initialYBottom} = e.data.messageObj;
    let imgDataArr = new Array(sliceSize);

    // for(let i=0; i<imgDataArr.length; i+=4){
    //     imgDataArr[i] = 0;
    //     imgDataArr[i+1] = 0;
    //     imgDataArr[i+2] = 255;
    //     imgDataArr[i+3] = 255;
    // }
    // for(let i=sliceSize*4/2; i<imgDataArr.length; i+=4){
    //     imgDataArr[i] = 0;
    //     imgDataArr[i+1] = 255;
    //     imgDataArr[i+2] = 0;
    //     imgDataArr[i+3] = 255;
    // }
    
    populate(imgDataArr, indexStart);

    function populate(arr, startingIndex) {
    
        for(let i=0; i<sliceSize; i++){
            let coords = getCoordFromIndex(i+startingIndex);
            // if(i===0){
            //     console.log(coords.x, coords.y)
            // }
            
            let realPt = coords.x; // - value pans the camera left
            let imaginPt = coords.y;
    
            let originalReal = coords.x; // These need to be saved; they represent C, which is constant in mandelbrot's
            let originalImagin = coords.y; // These need to be saved; they represent C, which is constant in mandelbrot's
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
        
            let hue = getValueInNewRange(iterations, 0, maxIterations, 0, 360);
        
            if(iterations >= maxIterations){
                arr[i] = 0;
            } else {

                // i is already divided by four, so we need to multiply again, to get only the red index in the image data array
                // arr[i*4] = lightness;
                // arr[i*4+1] = lightness-60;
                // arr[i*4+2] = lightness+60;
                arr[i] = hue;
            }
        }
    }
    // console.log(imgDataArr);

    function getValueInNewRange(oldValue, oldMin, oldMax, newMin, newMax) {
        const oldRange = oldMax - oldMin;
        const newRange = newMax - newMin;
        const newValue = (((oldValue - oldMin) * newRange) / oldRange) + newMin;
        // console.log(oldValue, newValue, oldRange, newRange);
        return newValue;
    }
    
    function getCoordFromIndex(index) { // From full image data index / 4, or whatever the for loop uses
        let xBefore = Math.round(index % width);
        let yBefore = Math.round(index / width) - 1;
    
        let x = getValueInNewRange(xBefore, 0, width, initialXLeft, initialXRight); // -2.5,1.5 (total difference must be same as other axis, to maintain proportions)
        let y = getValueInNewRange(yBefore, 0, width, initialYTop, initialYBottom);  // -2,2 (total difference must be same as other axis, to maintain proportions)
    
        return {x: x, y: y, xOriginal: xBefore, yOriginal: yBefore};
    }
    
    function getIndexFromCoord(x, y) {
        return (y * width + x) - 1;
    }

    self.postMessage(imgDataArr);
}