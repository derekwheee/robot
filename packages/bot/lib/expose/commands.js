'use strict';

const internals = {};

module.exports = {
    value: {
        dummy(server, args) {

            console.log(`dummy called with args [${args.join(', ')}]`);
        }
    }
};
