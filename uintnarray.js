/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* UintNArray                                                                © Chris Veness 2021  */
/*                                                                                   MIT Licence  */
/* Arbitrary bit-width typed array of unsigned integers.                                          */
/*                                                                                                */
/* This provides unsigned integer arrays of anything between 1 and 32 bit-width words, extending  */
/* the standard JavaScript Uint8Array, Uint16Array, and Uint32Array.                              */
/*                                                                                                */
/* Built on the shoulders of giants: credit to Cris Stringfellow (github.com/c9fe/Uint1Array) &   */
/* Anthony Pesch (github.com/inolen/bit-buffer).                                                  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

const internal = Symbol('internal'); // keep internals private


class UintNArray extends Array {

    /**
     * Create a typed array of bitWidth-wide unsigned integer words.
     *
     * Equivalent to JavaScript UInt8Array, UInt16Array, UInt32Array, except that the first argument
     * specifies the bit width (between 1 and 32), and if the second argument is a buffer, the third
     * argument is a bit offset rather than a byte offset.
     *
     * @param   {number} bitWidth - Number of bits in each word.
     * @param   {number|Array|TypedArray|ArrayBuffer} arg2 - Source UintNArray is to be constructed from.
     * @param   {number} bitOffset - If arg2 is a buffer, index into buffer to start extracting values.
     * @param   {number} length - If arg2 is a buffer, number of values to be extracted.
     * @returns {number[]} Array of bitWidth-bit words.
     */
    constructor(bitWidth, arg2, bitOffset=0, length=undefined) {
        if (!(1 <= Number(bitWidth) && Number(bitWidth) <= 32)) throw new RangeError(`UintNArray bit width (${bitWidth}) must be between 1 and 32`);

        super();

        const arg2IsNumeric = !isNaN(arg2); // includes numeric strings, booleans, null
        const arg2IsIterable = Symbol.iterator in Object(arg2) && typeof arg2 != 'string';
        const arg2IsBuffer = ({}).toString.call(arg2) == '[object ArrayBuffer]';
        const arg2IsOther = !arg2IsNumeric && !arg2IsIterable && !arg2IsBuffer; // e.g. (non-numeric) String, Undefined, RegExp, ...

        if (arg2IsNumeric) { // 'length' argument
            if (!(0 <= arg2 && arg2 <= 2**32)) throw new RangeError(`Invalid typed array length: ${arg2}`);

            const len = Math.floor(arg2);
            const byteLength = Math.ceil(bitWidth * len / 8);

            // create new buffer initialised with 0's
            const buffer = new ArrayBuffer(byteLength);
            this[internal] = new UintNArrayInternal(bitWidth, buffer, 0, len);
        }

        if (arg2IsIterable) { // TypedArray, Array, or other iterable object
            const len = arg2.length;
            const byteLength = Math.ceil(bitWidth * len / 8);

            // create new buffer initialised with iterable's values
            const buffer = new ArrayBuffer(byteLength);
            this[internal] = new UintNArrayInternal(bitWidth, buffer, 0, len);
            for (let i=0; i<len; i++) {
                this[internal].setBits(i * bitWidth, bitWidth, arg2[i]);
            }
        }

        if (arg2IsBuffer) {
            const buffer = arg2;
            if (isNaN(bitOffset)) bitOffset = 0;
            if (length == undefined) length = Math.floor((buffer.byteLength - bitOffset/8) * 8 / bitWidth);
            if (isNaN(length)) length = 0;

            if (bitOffset < 0 || bitOffset >= buffer.byteLength*8) throw new RangeError(`Bit offset ${bitOffset} is outside the bounds of the buffer`);
            if (length < 0 || bitOffset + length*bitWidth > buffer.byteLength*8) throw new RangeError(`Invalid typed array length: ${length}`);

            // create view into supplied buffer
            this[internal] = new UintNArrayInternal(bitWidth, buffer, bitOffset, length);
        }

        if (arg2IsOther) {
            // create empty buffer
            const buffer = new ArrayBuffer(0);
            this[internal] = new UintNArrayInternal(bitWidth, buffer, 0, 0);
        }

        // proxy for (bracketed) array getter/setter
        const arrayProxyHandler = {
            get: function(target, property) {
                const i = typeof property == 'string' ? Number(property) : property;
                const int = target[internal];
                if (Number.isInteger(i)) return int.getBits(i * int.bitWidth + int.bitOffset, int.bitWidth);
                if (property == 'length') return int.length; // 'length' seems to be special!
                /* otherwise */ return Reflect.get(target, property); // for properties / methods
            },
            set: function(target, property, value) {
                const i = Number(property);
                const int = target[internal];
                if (Number.isInteger(i)) return int.setBits(i * int.bitWidth + int.bitOffset, int.bitWidth, value);
                /* otherwise */ return Reflect.set(target, property, value); // for extra properties
            },
        };

        return new Proxy(this, arrayProxyHandler);
    }


    // TypedArray static properties (Array static properties are inherited)

    static get BYTES_PER_ELEMENT() { return undefined; } // BYTES_PER_ELEMENT not available for n-ary class


    // TypedArray static methods

    static from() { return undefined; } // cannot create UintNArray without specifying bit-width!

    static of() { return undefined; } // cannot create UintNArray without specifying bit-width!


    // TypedArray instance properties

    get buffer() {
        return this[internal].buffer;
    }

    get byteLength() {
        return this[internal].length * this[internal].bitWidth / 8; // may be fractional
    }

    get byteOffset() {
        return this[internal].bitOffset / 8; // may be fractional
    }

    // note .length seems to be special, has to be handled in arrayProxyHandler not with getter here


    // TypedArray instance methods

    set(arrayLike, offset) {
        // validate arguments
        const arrayLikeIsIterable = Symbol.iterator in Object(arrayLike);
        if (!arrayLikeIsIterable) throw new TypeError('invalid_argument');
        offset = Math.floor(offset) || 0;
        if (offset < 0) throw new RangeError('offset is out of bounds');
        if (arrayLike.length + offset > this[internal].length) throw new RangeError('offset is out of bounds');

        for (let i=0; i<arrayLike.length; i++) {
            this[i+offset] = arrayLike[i];
        }
    }

    subarray(begin=0, end=this[internal].length) {
        // default values
        begin = isNaN(begin) ? 0 : begin;
        end = isNaN(end) ? 0 : end;
        // relative to end
        if (begin < 0) begin = this[internal].length + begin;
        if (end < 0) end = this[internal].length + end;
        // restrict range
        begin = Math.max(begin, 0);
        end = Math.min(end, this[internal].length);

        return new UintNArray(this[internal].bitWidth, this[internal].buffer, begin*this[internal].bitWidth, end - begin);
    }


    // overridden Array methods (some inherited methods work, others have to be overridden!)

    copyWithin(target, start, end) {
        // default values
        target = isNaN(target) ? 0 : target;                  // index at which to copy the sequence to

        start = isNaN(start) ? 0 : start;                     // index to start copying elements from
        if (start < 0) start = this[internal].length + start; // ... if -ve from end
        if (start < 0) start = 0;                             // ... limit to array bounds

        end = isNaN(end) ? this.length : end;                 // index before which which to stop copying elements from
        if (end < 0) end = this[internal].length + end;       //  ... if -ve from end
        if (target + end - start > this[internal].length) end = this[internal].length - target + start; // ... limit to array bounds
        if (end <= start) return this;

        const tmp = new Array(end - start);
        for (let i=start; i<end; i++) tmp[i-start] = this[i];
        this.set(tmp, target);

        return this;
    }

    filter(...args) {
        return new UintNArray(this[internal].bitWidth, Array.from(this).filter(...args));
    }

    indexOf(...args) {
        return Array.from(this).indexOf(...args);
    }

    lastIndexOf(...args) {
        return Array.from(this).lastIndexOf(...args);
    }

    reduce(...args) {
        return Array.from(this).reduce(...args);
    }

    reduceRight(...args) {
        return Array.from(this).reduceRight(...args);
    }

    reverse(...args) {
        return new UintNArray(this[internal].bitWidth, Array.from(this).reverse(...args));
    }

    slice(...args) {
        return new UintNArray(this[internal].bitWidth, Array.from(this).slice(...args));
    }

    some(...args) {
        return Array.from(this).some(...args); // why inherited every() ok but not some()?
    }

    sort(...args) {
        return new UintNArray(this[internal].bitWidth, Array.from(this).sort(...args));
    }

    get [Symbol.toStringTag]() { // default string description for e.g. ({}).toString.call()
        return 'UintNArray';
    }

}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

class UintNArrayInternal {

    constructor(bitWidth, buffer, bitOffset, length) {
        Object.assign(this, {
            buffer:        buffer,
            bitWidth:      bitWidth,
            bitOffset:     bitOffset,
            length:        length,
            internalUint8: new Uint8Array(buffer),
        });
    }

    getBits(offset, nBits) {
        if (offset < 0) return undefined;
        if (offset + nBits > this.internalUint8.byteLength * 8) return undefined;

        let value = 0;
        let i = 0;
        while (i < nBits) {
            const remaining = nBits - i;
            const bitOffset = offset & 7;
            const currentByte = this.internalUint8[offset >> 3]; // o>>3 ≡ ⌊o/8⌋
            const read = Math.min(remaining, 8 - bitOffset); // max bits avail from current byte
            const mask = ~(0xff << read);
            const readBits = (currentByte >> (8 - read - bitOffset)) & mask;

            value <<= read;
            value |= readBits;

            offset += read;
            i += read;
        }

        return value;
    }

    setBits(offset, nBits, value) {
        if (offset < 0) return true;                                     // noop
        if (offset + nBits > this.internalUint8.length * 8) return true; // noop

        let i = 0;
        while (i < nBits) {
            const remaining = nBits - i;
            const bitOffset = offset & 7;
            const byteOffset = offset >> 3;
            const wrote = Math.min(remaining, 8 - bitOffset);
            const mask = ~(~0 << wrote); // create mask with the correct bit width
            const writeBits = (value >> (nBits - i - wrote)) & mask; // shift req'd bits to start of byte & mask the rest
            const destShift = 8 - bitOffset - wrote;
            const destMask = ~(mask << destShift); // destination mask to zero all the bits we're changing first

            this.internalUint8[byteOffset] = (this.internalUint8[byteOffset] & destMask) | (writeBits << destShift);

            offset += wrote;
            i += wrote;
        }

        return true;
    }

}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

export default UintNArray;
