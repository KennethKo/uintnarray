export default UintNArray;
/** @extends {Array<number>} */
declare class UintNArray extends Array<number> {
    static get BYTES_PER_ELEMENT(): any;
    static from(): any;
    static of(): any;
    /**
     * Create a typed array of bitWidth-wide unsigned integer words.
     *
     * Equivalent to JavaScript UInt8Array, UInt16Array, UInt32Array, except that the first argument
     * specifies the bit width (between 1 and 32), and if the second argument is a buffer, the third
     * argument is a bit offset rather than a byte offset.
     *
     * @param   {number} bitWidth  - Number of bits in each word.
     *                             - If negative, the absolute value is the number of bits in each word, and this represents a "Right Aligned" array.
     *                             -   That is, regardless of the bitWidth, we try to place the big endian rightmost array elements into the lsb of the
     *                             -   buffer, allowing different mutually prime bitWidths to align on the same buffer by prepending leading zeros
     *                             -   (rather than appending trailing zeros).
     *                             -   Right alignment also allows the array length to exceed the buffer width (to capture all bits in the buffer).
     *                             -   Element bits to the left of the buffer limit are rendered as leading zeros (and are no-oped during writes).
     * @param   {number|Array|ArrayBufferView|ArrayBuffer} arg2 - Source UintNArray is to be constructed from.
     * @param   {number} bitOffset - If arg2 is a buffer, index into buffer to start extracting values.
     * @param   {number} length - If arg2 is a buffer, number of values to be extracted.
     * @returns {number[]} Array of bitWidth-bit words.
     */
    constructor(bitWidth: number, arg2: number | any[] | ArrayBufferView | ArrayBuffer, bitOffset?: number, length?: number);
    /**
     * Extra helper for shifting bitWidths on the same buffer. Equivalent to `new UintNArray(bitwidth, this.buffer)`.
     *
     * NOTE - this drops any offset/length constraints on the current array. Notable if executed on a shallow subarray.
     * @param {number} bitWidth - The base N to cast this array to.
     * @param {number|undefined} bitLength - The total number of relevant bits known to be held in the current buffer.
     *                                     - If the original buffer's original bitLength is known, it's strongly recommended
     *                                     -  you pass it in here to truncate unnecessary leading zeros.
     * @returns {UintNArray} - Array of bitWidth-bit words.
     */
    toN(bitWidth: number, bitLength?: number | undefined): UintNArray;
    /**
     * Returns a shallow subarray of this array with zeroes trimmed - from the left if rightAligned or from the right if leftAligned
     * @returns {UintNArray} - Array of bitWidth-bit words.
     */
    trimZeros(): UintNArray;
    /** @type {ArrayBuffer} */
    get buffer(): ArrayBuffer;
    get byteLength(): number;
    get byteOffset(): number;
    set(arrayLike: any, offset: any): void;
    subarray(begin?: number, end?: any): UintNArray;
    copyWithin(target: any, start: any, end: any): this;
    filter(...args: any[]): UintNArray;
    indexOf(...args: any[]): any;
    lastIndexOf(...args: any[]): any;
    map(...args: any[]): any;
    reduce(...args: any[]): any;
    reduceRight(...args: any[]): any;
    reverse(...args: any[]): UintNArray;
    slice(...args: any[]): UintNArray;
    some(...args: any[]): any;
    /** @returns {this} */
    sort(...args: any[]): this;
}
//# sourceMappingURL=uintnarray.d.ts.map