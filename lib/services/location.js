'use strict';

const Schmervice = require('@hapipal/schmervice');
const { SerialPort } = require('serialport');

const internals = {};

module.exports = class LocationService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    initialize() {

    }

    init() {

        const {
            location: {
                port: usbPath
            }
        } = this.options;

        this.port = new SerialPort({
            path: usbPath,
            baudRate: 9600
        });
    }

    read() {

        this.port.on('data', (data) => {

            console.log(data);
            console.log('\n');
        });
    }
};
