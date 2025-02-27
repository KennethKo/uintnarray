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
    test('bytes per elmt',         () => should.equal(UintNArray.BYTES_PER_ELEMENT, undefined));
    test('byteLength',             () => new UintNArray(3, [ 1, 2, 3, 4 ]).byteLength.should.equal(1.5));
    test('buffer',                 () => new UintNArray(4, ui8.buffer).buffer.should.equal(ui8.buffer));
    test('length',                 () => new UintNArray(4, ui8.buffer).length.should.equal(16)); // requires special handling
    test('byteOffset',             () => new UintNArray(4, ui8.buffer, 4).byteOffset.should.equal(0.5));
    test('byteLength',             () => new UintNArray(4, ui8.buffer, 4).byteLength.should.equal(7.5));
    test('object desc.',           () => ({}).toString.call(new UintNArray(1)).should.equal('[object UintNArray]'));
    test('name',                   () => UintNArray.name.should.equal('UintNArray'));
    test('instanceof Array',       () => (new UintNArray(1) instanceof Array).should.be.true);
    test('instanceof UintNArray',  () => (new UintNArray(1) instanceof UintNArray).should.be.true);
    const uiN = new UintNArray(4);
    uiN.myProperty = 99;
    test('set arbitrary property', () => uiN.myProperty.should.equal(99));
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
    test('subarray() chaining',          () => new UintNArray(4, [ 1, 2, 3, 4 ]).subarray(1, 3).subarray(1).toString().should.equal('3'));
    test('subarray() -ve begin',         () => new UintNArray(4, [ 1, 2, 3, 4 ]).subarray(-2).toString().should.equal('3,4'));
    test('subarray() -ve end',           () => new UintNArray(4, [ 1, 2, 3, 4 ]).subarray(1, -1).toString().should.equal('2,3'));
    test('subarray() outside range',     () => new UintNArray(4, [ 1, 2, 3, 4 ]).subarray(-99, 99).toString().should.equal('1,2,3,4'));
    test('subarray() non-numeric begin', () => new UintNArray(4, [ 1, 2, 3, 4 ]).subarray('string').toString().should.equal('1,2,3,4'));
    test('subarray() non-numeric end',   () => new UintNArray(4, [ 1, 2, 3, 4 ]).subarray(0, 'string').toString().should.equal(''));
    const uiN3 = new UintNArray(4, [ 1, 2, 3, 4 ]);
    uiN3[-1] = 9;
    uiN3[99] = 9;
    test('ignore out-of-bounds set',     () => uiN3.toString().should.equal('1,2,3,4'));
    test('from',                         () => (typeof UintNArray.from([])).should.equal('undefined'));
    test('of',                           () => (typeof UintNArray.of(1)).should.equal('undefined'));
});

describe('overridden Array methods', function() {
    test('copyWithin start+end',    () => new UintNArray(4, [ 1, 2, 3, 4, 5, 6 ]).copyWithin(3, 4, 6).toString().should.equal('1,2,3,5,6,6'));
    test('copyWithin no start/end', () => new UintNArray(4, [ 1, 2, 3, 4, 5, 6 ]).copyWithin(3).toString().should.equal('1,2,3,1,2,3'));
    test('copyWithin beyond end',   () => new UintNArray(4, [ 1, 2, 3, 4, 5, 6 ]).copyWithin(3, 0, 6).toString().should.equal('1,2,3,1,2,3'));
    test('copyWithin no-op',        () => new UintNArray(4, [ 1, 2, 3, 4, 5, 6 ]).copyWithin(3, 4, 4).toString().should.equal('1,2,3,4,5,6'));
    test('copyWithin no end',       () => new UintNArray(4, [ 1, 2, 3, 4, 5, 6 ]).copyWithin(3, 4).toString().should.equal('1,2,3,5,6,6'));
    test('copyWithin -ve start',    () => new UintNArray(4, [ 1, 2, 3, 4, 5, 6 ]).copyWithin(3, -2).toString().should.equal('1,2,3,5,6,6'));
    test('copyWithin beyond -ve s', () => new UintNArray(4, [ 1, 2, 3, 4, 5, 6 ]).copyWithin(3, -9).toString().should.equal('1,2,3,1,2,3'));
    test('copyWithin -ve end',      () => new UintNArray(4, [ 1, 2, 3, 4, 5, 6 ]).copyWithin(3, 4, -1).toString().should.equal('1,2,3,5,5,6'));
    test('copyWithin NaN target',   () => new UintNArray(4, [ 1, 2, 3, 4, 5, 6 ]).copyWithin('string', 0, 6).toString().should.equal('1,2,3,4,5,6'));
    test('filter',                  () => new UintNArray(4, [ 1, 2, 3, 4 ]).filter(i => i==4).toString().should.equal('4'));
    test('indexOf',                 () => new UintNArray(4, [ 1, 2, 3, 4 ]).indexOf(2).should.equal(1));
    test('lastIndexOf',             () => new UintNArray(4, [ 1, 2, 3, 4 ]).lastIndexOf(2).should.equal(1));
    test('map',                     () => new UintNArray(4, [ 1, 2, 3, 4 ]).map((val) => val+1).toString().should.equal('2,3,4,5'));
    test('reduce',                  () => new UintNArray(4, [ 1, 2, 3, 4 ]).reduce((acc, val) => acc + val.toString()).should.equal('1234'));
    test('reduceRight',             () => new UintNArray(4, [ 1, 2, 3, 4 ]).reduceRight((acc, val) => acc + val.toString()).should.equal('4321'));
    test('slice default',           () => new UintNArray(4, [ 1, 2, 3, 4 ]).slice().toString().should.equal('1,2,3,4'));
    test('slice range',             () => new UintNArray(4, [ 1, 2, 3, 4 ]).slice(1, 3).toString().should.equal('2,3'));
    test('slice -ve',               () => new UintNArray(4, [ 1, 2, 3, 4 ]).slice(1, -1).toString().should.equal('2,3'));
    test('sort',                    () => new UintNArray(4, [ 1, 3, 2, 4 ]).sort().toString().should.equal('1,2,3,4'));
    test('reverse',                 () => new UintNArray(4, [ 1, 2, 3, 4 ]).reverse().toString().should.equal('4,3,2,1'));
    test('some',                    () => new UintNArray(4, [ 1, 2, 3, 4 ]).some(i => i%2 == 0).should.be.true);
});

describe('inherited Array methods', function() {
    test('entries',        () => [ ...new UintNArray(4, [ 1, 2, 3, 4 ]).entries() ].should.deep.equal([ [ 0, 1 ], [ 1, 2 ], [ 2, 3 ], [ 3, 4 ] ]));
    test('every',          () => new UintNArray(4, [ 1, 2, 3, 4 ]).every(i => i < 5).should.be.true);
    test('fill',           () => new UintNArray(4, [ 1, 2, 3, 4 ]).fill(12).toString().should.equal('12,12,12,12'));
    test('find',           () => new UintNArray(4, [ 1, 2, 3, 4 ]).find(i => i > 2).should.equal(3));
    test('findIndex',      () => new UintNArray(4, [ 1, 2, 3, 4 ]).findIndex(i => i > 2).should.equal(2));
    test('includes',       () => new UintNArray(4, [ 1, 2, 3, 4 ]).includes(4).should.equal(true));
    test('join',           () => new UintNArray(4, [ 1, 2, 3, 4 ]).join('-').should.equal('1-2-3-4'));
    test('keys',           () => [ ...new UintNArray(4, [ 1, 2, 3, 4 ]).keys() ].should.deep.equal([ 0, 1, 2, 3 ]));
    test('toLocaleString', () => new UintNArray(4, [ 1, 2, 3, 4 ]).toString().should.equal('1,2,3,4'));
    test('toString',       () => new UintNArray(4, [ 1, 2, 3, 4 ]).toString().should.equal('1,2,3,4'));
    test('values',         () => [ ...new UintNArray(4, [ 1, 2, 3, 4 ]).values() ].should.deep.equal([ 1, 2, 3, 4 ]));
});

describe('array bracket access', function() {
    test('[0]',    () => new UintNArray(4, [ 1, 2 ])[0].should.equal(1));
    test('[1]',    () => new UintNArray(4, [ 1, 2 ])[1].should.equal(2));
    test('beyond', () => should.equal(new UintNArray(4, [ 1, 2 ])[2]), undefined);
    test('before', () => should.equal(new UintNArray(4, [ 1, 2 ])[-1]), undefined);
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

describe('legacy bit shifting behavior left aligned', function() {
    const uiN9 = new UintNArray(9, [ 1, 1 ]);
    test('7-bit shift',          () => new UintNArray(7, uiN9.buffer).toString().should.equal('0,32,8'));
    test('6-bit trailing zero',  () => new UintNArray(6, uiN9.buffer).toString().should.equal('0,8,1,0'));
    const uiN4 = new UintNArray(4, [ 1, 0, 0, 1 ]);
    test('9-bit miss lsb',       () => new UintNArray(9, uiN4.buffer).toString().should.equal('32'));
    test('9-bit miss msb',       () => new UintNArray(9, uiN4.buffer, 7).toString().should.equal('1'));
    test('9-bit miss both bits', () => new UintNArray(9, uiN4.buffer, 4).toString().should.equal('0'));
});

describe('right aligned bit shifting behavior', function() {
    const uiN9 = new UintNArray(-9, [ 1, 1 ]);
    test('self consistency',   () => uiN9.toString().should.equal('1,1'));
    test('7-bit align right',  () => new UintNArray(-7, uiN9.buffer).toString().should.equal('0,0,4,1'));
    test('6-bit leading zero', () => new UintNArray(-6, uiN9.buffer).toString().should.equal('0,0,8,1'));
    const uiN4 = new UintNArray(-4, [ 1, 0, 0, 1 ]);
    test('9-bit coverage',     () => new UintNArray(-9, uiN4.buffer).toString().should.equal('8,1'));
    test('9-bit safe offset',  () => new UintNArray(-9, uiN4.buffer, 9).toString().should.equal('1'));
    test('9-bit safe offset and length', () => new UintNArray(-9, uiN4.buffer, 0, 1).toString().should.equal('8'));

    test('subarray() begin+end',         () => new UintNArray(-4, [ 1, 2, 3, 4 ]).subarray(1, 3).toString().should.equal('2,3'));
    test('map',                () => new UintNArray(-4, [ 1, 2, 3, 4 ]).map(i => i+1).toString().should.equal('2,3,4,5'));

    test('7-bit toN util',     () => uiN9.toN(-7).toString().should.equal('0,0,4,1'));
    test('7-bit toN bitLimit', () => uiN9.toN(-7, 9*2).toString().should.equal('0,4,1'));
    test('7-bit toN subarray', () => uiN9.toN(-7).subarray(1, 3).toString().should.equal('0,4'));
    test('7-bit toN trimZeros', () => uiN9.toN(-7).trimZeros().toString().should.equal('4,1'));
    test('7-bit 0 trimZeros',  () => new UintNArray(-7, [ 0, 0 ]).trimZeros().toString().should.equal('0'));
});

describe('right aligned base shifting', function() {
    const getMapper = base => num => {
        const str = new UintNArray(-32, [ num ]).toN(base).toString();
        const numArr = new UintNArray(base, str.split(',')).toN(-32);
        return numArr[numArr.length-1];
    };
    const testNums = [ 0, 1, 33, 512313, 1<<22-1 ];
    test('num to 2-bit base', () => testNums.map(getMapper(-2)).should.deep.equal(testNums));
    test('num to 1-bit base', () => testNums.map(getMapper(-1)).should.deep.equal(testNums));
    test('num to 8-bit base', () => testNums.map(getMapper(-8)).should.deep.equal(testNums));
    test('num to 4-bit base', () => testNums.map(getMapper(-4)).should.deep.equal(testNums));
    test('num to 12-bit base', () => testNums.map(getMapper(-12)).should.deep.equal(testNums));
    test('num to 9-bit base', () => testNums.map(getMapper(-9)).should.deep.equal(testNums));

    const geohash = '9q8yy9mf'; // san francisco
    const base32ghs = '0123456789bcdefghjkmnpqrstuvwxyz';
    const base32lookup = base32ghs.split('').reduce((acc, c, i) => { acc[c] = i; return acc; }, {});
    const base32 = new UintNArray(-5, geohash.split('').map(c => base32lookup[c]));

    const ui8code = base32.toN(-8).toString();
    test('geohash to 8-bit base', () => new UintNArray(-8, ui8code.split(','))
        .toN(-5, 5*geohash.length).map(i => base32ghs[i]).join('').should.equal(geohash));
    const ui12code = base32.toN(-12).toString();
    test('geohash to 12-bit base', () => new UintNArray(-12, ui12code.split(','))
        .toN(-5, 5*geohash.length).map(i => base32ghs[i]).join('').should.equal(geohash));
    const ui9code = base32.toN(-9).toString();
    test('geohash to 9-bit base', () => new UintNArray(-9, ui9code.split(','))
        .toN(-5, 5*geohash.length).map(i => base32ghs[i]).join('').should.equal(geohash));

});

describe('right aligned overflow behavior', function() {
    let uiN9 = new UintNArray(-9, [ 1, 1 ]);
    uiN9 = new UintNArray(-9, uiN9.buffer, undefined, 5);
    const uiN9Str = uiN9.toString();
    test('leading zeros',   () => uiN9Str.should.equal('0,0,0,1,1'));
    const ff = (1<<9) -1;
    uiN9[0] = ff;
    uiN9[2] = ff;
    uiN9[4] = ff;
    const uiN9wStr = uiN9.toString();
    test('writes are ignored outside of the buffer', () => uiN9wStr.should.equal('0,0,63,1,511'));
    const uiN7 = uiN9.toN(-7);
    const uiN7Str = uiN7.toString();
    test('7-bit renders to edge of buffer',          () => uiN7Str.should.equal('7,112,7,127'));
    uiN7[1] = 1;
    uiN7[3] = 1;
    test('7-bit unset unsets aligned bits',          () => uiN7.toString().should.equal('7,1,7,1'));
});

describe('right aligned leading zero creeping', function() {
    const uiN9 = new UintNArray(-9, [ 1, 1 ]);
    const uiN9Str1 = uiN9.toString();
    test('leading buffer zero bits truncated',   () => uiN9Str1.should.equal('1,1'));
    const uiN9Str2 = uiN9.toN(-9).toString();
    test('leading zero added to cover buffer',   () => uiN9Str2.should.equal('0,1,1'));
    let uiN7 = uiN9.toN(-7);
    const uiN7Str3 = uiN7.toString();
    test('leading zeros added to cover buffer',  () => uiN7Str3.should.equal('0,0,4,1'));
    uiN7 = new UintNArray(-7, uiN7).toN(-7);
    const uiN7Str4 = uiN7.toString();
    test('leading zeros creep on alternating iterable/buffer init', () => uiN7Str4.should.equal('0,0,0,4,1'));
    uiN7 = uiN7.toN(-7, 8*2);
    const uiN7Str5 = uiN7.toString();
    test('leading zeros truncated by bitLength', () => uiN7Str5.should.equal('0,4,1'));
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
