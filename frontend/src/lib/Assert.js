// /src/lib/Assert.js

export const assertStrings = (expectedValue, actualValue) => {
    if (typeof expectedValue !== 'string' || typeof actualValue !== 'string') {
        throw new Error(`This function can only compare strings`);
    }

    if (expectedValue !== actualValue) {
        throw new Error(`Expected ${expectedValue}, got ${actualValue}`);
    }
    return; // assertion passed
};

export const assertValueRange = (value, minValue, maxValue) => {
    assertType(value, 'number');
    if (minValue <= value && value <= maxValue) {
        return; // assertion succeeds
    } else {
        throw new Error(`Value "${value}" is out of bounds. Acceptable range: [${minValue}, ${maxValue}]`);
    }
};

export const assertType = (value, expectedType) => {
    if (typeof value !== expectedType) throw TypeError(`Expected ${expectedType}, got ${typeof value}.`)
};