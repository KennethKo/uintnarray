# UintNArray

[![Build Status](https://travis-ci.org/chrisveness/uintnarray.svg?branch=master)](https://travis-ci.org/chrisveness/uintnarray)
[![Coverage Status](https://coveralls.io/repos/github/chrisveness/uintnarray/badge.svg)](https://coveralls.io/github/chrisveness/uintnarray)

Arbitrary bit-width [typed array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) of unsigned integers.

Unsigned integer arrays of anything between 1 and 32 bit-width words, extending the standard JavaScript Uint8Array, Uint16Array, and Uint32Array.

Usage is equivalent to that of the standard [Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), [Uint16Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array), and [Uint32Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array), except that the constructor takes an initial argument specifying the bit-width of the words in the array.

## Usage

### In browser:

    import UintNArray from 'https://cdn.jsdelivr.net/npm/uintnarray@1.0.0/uintnarray.js';

### In Node.js:

Install from [npm](https://www.npmjs.com/package/uintnarray) and then

    import UintNArray from 'uintnarray';

### Example:

````javascript
const ui8 = new Uint8Array([1, 2, 3, 4, 255, 254, 253, 252]);
const uiN = new UintNArray(4, ui8.buffer);
console.log(uiN.toString()); // "0,1,0,2,0,3,0,4,15,15,15,14,15,13,15,12"
ui8[1] = 99;
console.log(uiN.toString()); // "0,1,6,3,0,3,0,4,15,15,15,14,15,13,15,12"
````

## Reference

Static properties, static methods, instance properties, and instance methods are as per the standard typed arrays  [Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), [Uint16Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array), and [Uint32Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array), with the following exceptions:

### Constructor

`UintNArray(bitWidth)`\
`UintNArray(bitWidth, length)`\
`UintNArray(bitWidth, typedArray)`\
`UintNArray(bitWidth, object)`\
`UintNArray(bitWidth, buffer [, bitOffset [, length]])`

Equivalent to typed array constructors, except that the first argument is the bit width, which may be between 1 and 32.

When the second argument is a buffer, the third argument is a bit offset rather than a byte offset.

### Static properties

`UintNArray.BYTES_PER_ELEMENT` is not available as bit-width is specified on construction.

### Static methods

`UintNArray.from()` and `UintNArray.of()` are not available, as a `UintNArray` cannot be created without specifying bit-width.

### Instance properties

`Uint8Array.prototype.byteLength` may return fractional values.

`Uint8Array.prototype.byteOffset` may return fractional values.

### instanceof

Javascript typed arrays are not instances of Array, but UintNArray is.

````javascript
new Uint8Array([ 1, 2, 3 ]) instanceof Array;    // false
new UintNArray(4, [ 1, 2, 3 ]) instanceof Array; // true
````

## Endian-ness

Since it is working with arbitrary bit-widths, `UintNArray` is intrinsically big-endian.

Little-endian order is useful for flexibility in register storage: an (e.g.) `int8*` pointing to `00001001` will give the same value (9) as an `int16*` pointing to `00001001 00000000`. Most modern computer architectures (32-bit and increasingly 64-bit) are little-endian.

With arbitrary bit-width words, the opposite applies: the value ‘9’ should be the same in (e.g.) a 15-bit, 16-bit, 0r 17-bit word:

15-bit: `. .0000000 00001001`\
16-bit: `. 00000000 00001001`\
17-bit: `0 00000000 00001001`

Also, big-endian works as a byte stream: most network communications are big-endian – referred to as ‘network order’ (binary file formats such as PNG/GIF vary).

If required, little-endian ordering of units within the UintNArray can be obtained by using a [`DataView`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) on the `UintNArray.buffer`.
