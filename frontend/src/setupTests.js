import '@testing-library/jest-dom';

// jsdom (CRA's jest environment) lacks TextEncoder/TextDecoder, which
// react-router v7 needs at import time.
const { TextEncoder, TextDecoder } = require('util');
if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;
