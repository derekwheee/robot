'use strict';

const FS = require('fs/promises');

exports.toBase64 = async (filepath) => {

    return await FS.readFile(filepath, 'base64');
};
