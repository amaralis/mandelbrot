export function getValueInNewRange(oldValue, oldMin, oldMax, newMin, newMax) {
    const oldRange = oldMax - oldMin;
    const newRange = newMax - newMin;
    const newValue = (((oldValue - oldMin) * newRange) / oldRange) + newMin;
    // console.log(oldValue, newValue, oldRange, newRange);
    return newValue;
}