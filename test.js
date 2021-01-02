/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* UintNArray Test Harness                                                   © Chris Veness 2021  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import UintNArray from './uintnarray.js';

if (typeof window == 'undefined') { // node ($ npm test)
    const chai = await import('chai');
    global.should = chai.should();
} else {                            // browser (movable-type.co.uk/dev/uintnarray-test.html)
    window.should = chai.should();
}

const test = it; // just an alias

describe('construct from numeric (length)', function() {
    test('numeric length',   () => new UintNArray(4, 5).toString().should.equal('0,0,0,0,0'));
    test('string length',    () => new UintNArray(4, '5').toString().should.equal('0,0,0,0,0'));
    test('resulting buffer', () => new UintNArray(4, 5).buffer.byteLength.should.equal(3));
});

describe('construct from iterable', function() {
    test('toString',                  () => new UintNArray(4, [ 1, 2, 3, 4 ]).toString().should.equal('1,2,3,4'));
    test('element overflow',          () => new UintNArray(4, [ 15, 16, 17 ]).toString().should.equal('15,0,1'));
    test('just below 2 bytes',        () => new UintNArray(15, [ 10, 12 ]).toString().should.equal('10,12'));
    test('just below 2 bytes buffer', () => new UintNArray(15, [ 10, 12 ]).buffer.byteLength.should.equal(4));
    test('just above 2 bytes',        () => new UintNArray(17, [ 10, 12 ]).toString().should.equal('10,12'));
    test('just above 2 bytes buffer', () => new UintNArray(17, [ 10, 12 ]).buffer.byteLength.should.equal(5));
});

describe('construct from buffer', function() {
    const ui8 = new Uint8Array([ 1, 2, 3, 4, 255, 254, 253, 252 ]);
    test('default offset & length', () => new UintNArray(4, ui8.buffer).toString().should.equal('0,1,0,2,0,3,0,4,15,15,15,14,15,13,15,12'));
    test('offset & default length', () => new UintNArray(4, ui8.buffer, 4).toString().should.equal('1,0,2,0,3,0,4,15,15,15,14,15,13,15,12'));
    test('offset & length',         () => new UintNArray(4, ui8.buffer, 4, 5).toString().should.equal('1,0,2,0,3'));
    test('offset & zero length',    () => new UintNArray(4, ui8.buffer, 0, 0).toString().should.equal(''));
    test('non-numeric offset -> 0', () => new UintNArray(4, ui8.buffer, 'string').toString().should.equal('0,1,0,2,0,3,0,4,15,15,15,14,15,13,15,12'));
    test('non-numeric length -> 0', () => new UintNArray(4, ui8.buffer, 0, 'string').toString().should.equal(''));
});

describe('construct from other', function() {
    test('default arg2',     () => new UintNArray(4).toString().should.equal(''));
    test('non-numeric arg2', () => new UintNArray(4, 'string').toString().should.equal(''));
});

describe('typed array properties', function() {
    const ui8 = new Uint8Array([ 1, 2, 3, 4, 255, 254, 253, 252 ]);
    test('bytes per elmt', () => should.equal(UintNArray.BYTES_PER_ELEMENT, undefined));
    test('byteLength',     () => new UintNArray(3, [ 1, 2, 3, 4 ]).byteLength.should.equal(1.5));
    test('buffer',         () => new UintNArray(4, ui8.buffer).buffer.should.equal(ui8.buffer));
    test('length',         () => new UintNArray(4, ui8.buffer).length.should.equal(16)); // requires special handling
    test('byteOffset',     () => new UintNArray(4, ui8.buffer, 4).byteOffset.should.equal(0.5));
    test('byteLength',     () => new UintNArray(4, ui8.buffer, 4).byteLength.should.equal(7.5));
});

describe('typed array methods', function() {
    const uiN1 = new UintNArray(4, 6);
    uiN1.set([ 1, 2, 3 ], 2);
    test('set() from array',             () => uiN1.toString().should.equal('0,0,1,2,3,0'));
    const uiN2 = new UintNArray(4, 6);
    uiN2.set(new Uint8Array([ 4, 5, 6 ]), 2);
    test('set() from typed array',       () => uiN2.toString().should.equal('0,0,4,5,6,0'));
    test('subarray() no args',           () => new UintNArray(4, [ 1, 2, 3, 4 ]).subarray().toString().should.equal('1,2,3,4'));
    test('subarray() begin',             () => new UintNArray(4, [ 1, 2, 3, 4 ]).subarray(2).toString().should.equal('3,4'));
    test('subarray() begin+end',         () => new UintNArray(4, [ 1, 2, 3, 4 ]).subarray(2, 3).toString().should.equal('3'));
    test('subarray() begin+end 0',       () => new UintNArray(4, [ 1, 2, 3, 4 ]).subarray(0, 0).toString().should.equal(''));
    test('subarray() -ve begin',         () => new UintNArray(4, [ 1, 2, 3, 4 ]).subarray(-2).toString().should.equal('3,4'));
    test('subarray() -ve end',           () => new UintNArray(4, [ 1, 2, 3, 4 ]).subarray(1, -1).toString().should.equal('2,3'));
    test('subarray() outside range',     () => new UintNArray(4, [ 1, 2, 3, 4 ]).subarray(-99, 99).toString().should.equal('1,2,3,4'));
    test('subarray() non-numeric begin', () => new UintNArray(4, [ 1, 2, 3, 4 ]).subarray('string').toString().should.equal('1,2,3,4'));
    test('subarray() non-numeric end',   () => new UintNArray(4, [ 1, 2, 3, 4 ]).subarray(0, 'string').toString().should.equal(''));
    const uiN3 = new UintNArray(4, [ 1, 2, 3, 4 ]);
    uiN3[-1] = 9;
    uiN3[99] = 9;
    test('ignore out-of-bounds set',     () => uiN3.toString().should.equal('1,2,3,4'));
});

describe('inherited properties (a few)', function() {
    test('name',                  () => UintNArray.name.should.equal('UintNArray'));
    test('length',                () => new UintNArray(4, 5).length.should.equal(5));
    test('instanceof Array',      () => (new UintNArray(1) instanceof Array).should.be.true);
    test('instanceof UintNArray', () => (new UintNArray(1) instanceof UintNArray).should.be.true);
    const uiN = new UintNArray(4);
    uiN.myProperty = 99;
    test('set arbitrary property', () => uiN.myProperty.should.equal(99));
});

describe('inherited methods (a few)', function() {
    const ui8 = new Uint8Array([ 1, 2, 3, 4, 255, 254, 253, 252 ]);
    test('toString',   () => new UintNArray(4, ui8.buffer).toString().should.equal('0,1,0,2,0,3,0,4,15,15,15,14,15,13,15,12'));
    test('includes ✓', () => new UintNArray(4, ui8.buffer).includes(4).should.equal(true));
    test('includes ✗', () => new UintNArray(4, ui8.buffer).includes(5).should.equal(false));
    test('fill',       () => new UintNArray(4, 5).fill(12).toString().should.equal('12,12,12,12,12'));
});

describe('array bracket access', function() {
    test('[0]',    () => new UintNArray(4, [ 1, 2 ])[0].should.equal(1));
    test('[1]',    () => new UintNArray(4, [ 1, 2 ])[1].should.equal(2));
    test('beyond', () => should.equal(new UintNArray(4, [ 1, 2 ])[2]), undefined);
    test('before', () => should.equal(new UintNArray(4, [ 1, 2 ])[-1]), undefined);
});

describe('overridden properties', function() {
    test('from', () => (typeof UintNArray.from([])).should.equal('undefined'));
    test('of',   () => (typeof UintNArray.of(1)).should.equal('undefined'));
});

describe('irregular word boundaries', function() {
    test('3×3',    () => new UintNArray(3, [ 1, 2, 3 ]).toString().should.equal('1,2,3'));
    test('3×3 l',  () => new UintNArray(3, [ 1, 2, 3 ]).buffer.byteLength.should.equal(2));
    test('15×3',   () => new UintNArray(15, [ 1, 2, 3 ]).toString().should.equal('1,2,3'));
    test('15×3 l', () => new UintNArray(15, [ 1, 2, 3 ]).buffer.byteLength.should.equal(6));
    test('17×3',   () => new UintNArray(17, [ 1, 2, 3 ]).toString().should.equal('1,2,3'));
    test('17×3 l', () => new UintNArray(17, [ 1, 2, 3 ]).buffer.byteLength.should.equal(7));
});

describe('truncate oversized iterable inputs', function() {
    test('2-bit array',  () => new UintNArray(2, [ 1, 2, 3, 4, 5, 6 ]).toString().should.equal('1,2,3,0,1,2'));
    test('3-bit array',  () => new UintNArray(3, [ 5, 6, 7, 8, 9, 10 ]).toString().should.equal('5,6,7,0,1,2'));
    test('4-bit array',  () => new UintNArray(4, [ 13, 14, 15, 16, 17, 18 ]).toString().should.equal('13,14,15,0,1,2'));
    test('15-bit array', () => new UintNArray(15, [ 0x7ffd, 0x7ffe, 0x7fff, 0x8000, 0x8001, 0x8002 ]).toString().should.equal('32765,32766,32767,0,1,2'));
});

describe('constructor errors', function() {
    test('0-width',         () => should.Throw(function() { new UintNArray(0); }, RangeError));
    test('+-width',         () => should.Throw(function() { new UintNArray(33); }, RangeError));
    test('no new',          () => should.Throw(function() { UintNArray(4, 5); }, TypeError));
    test('-ve length',      () => should.Throw(function() { new UintNArray(1, -1); }, RangeError));
    const ui8 = new Uint8Array([ 1, 2, 3, 4, 255, 254, 253, 252 ]);
    test('-ve b-offset',    () => should.Throw(function() { new UintNArray(4, ui8.buffer, -1); }, RangeError));
    test('excess b-offset', () => should.Throw(function() { new UintNArray(4, ui8.buffer, 65); }, RangeError));
    test('-ve b-length',    () => should.Throw(function() { new UintNArray(4, ui8.buffer, 0, -1); }, RangeError));
    test('excess b-length', () => should.Throw(function() { new UintNArray(4, ui8.buffer, 0, 17); }, RangeError));
});

describe('method errors', function() {
    test('set() un-iterable',        () => should.Throw(function() { new UintNArray(4).set(1, 1); }, TypeError));
    test('set() non-numeric offset', () => should.Throw(function() { new UintNArray(4).set([ 1 ], 'string'); }, RangeError));
    test('set() -ve offset',         () => should.Throw(function() { new UintNArray(4).set([ 1, 2, 3 ], -1); }, RangeError));
    test('set() excess offset',      () => should.Throw(function() { new UintNArray(4).set([ 1, 2, 3 ], 2); }, RangeError));
});
