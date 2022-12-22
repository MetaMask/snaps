require('ses');

// toggle this to see how it works
const WITH_LOCKDOWN = false;
const WITH_HARDEN = false;
// Note: harden is only defined after calling lockdown

if (WITH_LOCKDOWN) {
    lockdown();
}


const testSubjects = {
    BigInt: {
        Subject: BigInt,
        functor: () => BigInt(3),
    },
    // SubtleCrypto: {
    //     Subject: SubtleCrypto,
    //     functor: () => new SubtleCrypto(),
    // }, //not in Node, hard to test
    TextDecoder: {
        Subject: TextDecoder,
        functor: () => new TextDecoder(),
    },
    TextEncoder: {
        Subject: TextEncoder,
        functor: () => new TextEncoder(),
    },
    URL: {
        Subject: URL,
        functor: () => new URL('https://naugtur.pl'),
    },
    Int8Array: {
        Subject: Int8Array,
        functor: () => new Int8Array(),
    },
    Uint8Array: {
        Subject: Uint8Array,
        functor: () => new Uint8Array(),
    },
    Uint8ClampedArray: {
        Subject: Uint8ClampedArray,
        functor: () => new Uint8ClampedArray(),
    },
    Int16Array: {
        Subject: Int16Array,
        functor: () => new Int16Array(),
    },
    Uint16Array: {
        Subject: Uint16Array,
        functor: () => new Uint16Array(),
    },
    Int32Array: {
        Subject: Int32Array,
        functor: () => new Int32Array(),
    },
    Uint32Array: {
        Subject: Uint32Array,
        functor: () => new Uint32Array(),
    },
    Float32Array: {
        Subject: Float32Array,
        functor: () => new Float32Array(),
    },
    Float64Array: {
        Subject: Float64Array,
        functor: () => new Float64Array(),
    },
    BigInt64Array: {
        Subject: BigInt64Array,
        functor: () => new BigInt64Array(),
    },
    BigUint64Array: {
        Subject: BigUint64Array,
        functor: () => new BigUint64Array(),
    },
    DataView: {
        Subject: DataView,
        functor: () => new DataView(new ArrayBuffer()),
    },
    ArrayBuffer: {
        Subject: ArrayBuffer,
        functor: () => new ArrayBuffer(),
    },
    AbortController: {
        Subject: AbortController,
        functor: () => new AbortController(),
    },
    AbortSignal: {
        Subject: AbortSignal,
        functor: () => AbortSignal.abort(),
    },
}

function code(Subject, functor) {
    Subject.__flag = 13371;
    const s = functor();
    s.__flag = 13372;
    Subject.prototype.__flag = 13373;
    s.__proto__.__flag = 13374;
}

Object.entries(testSubjects).forEach(([name, { Subject, functor }]) => {
    try {
        if (WITH_HARDEN) {
            harden(Subject)
        }

        const c1 = new Compartment({ [name]: Subject }, {}, {})
        const source = `;(${code})(${name},${functor})`;
        // console.log(source)
        // eval(source)
        c1.evaluate(source)

        const s = functor();
        console.log('!!', name, Subject.__flag, s.__flag)
    } catch (e) {
        if (e.message === 'Cannot add property __flag, object is not extensible') {
            console.log('ok', name)
        } else {
            console.error(name, e)
        }
    }

})
