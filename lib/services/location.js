'use strict';

const Schmervice = require('@hapipal/schmervice');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const internals = {};

module.exports = class LocationService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    initialize() {

        const { stateService } = this.server.services();
        this.state = stateService;
        this.interrupt = false;
    }

    expose() {

        return {
            start: this.start.bind(this)
        };
    }

    init() {

        const {
            location: {
                port: usbPath
            }
        } = this.options;

        if (!usbPath) {
            console.log(`Continuing without location data: Missing serial path`);
            return;
        }

        this.port = new SerialPort({
            path: usbPath,
            baudRate: 9600
        });

        this.state.actions.GPS.setReadyState(true);
    }

    start() {

        this.state.actions.GPS.setIsReading(true);

        this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

        this.parser.on('data', (data) => {

            const mapped = internals.mapDataToObject(data);

            if (mapped) {
                this.state.actions.GPS.setLocation(mapped);
            }
        });
    }

    stop() {

        this.parser?.off('data');

        this.state.actions.GPS.setIsReading(false);
    }
};

internals.RNC_REGEX = /\$GNRMC,(\d+.\d+),([AV]),(\d{1,4}.\d{1,4})?,([NS])?,(\d{1,4}.\d{1,4})?,([EW])?,(\d+.\d+),(\d+.\d+),(\d{6}),[^,]*,([ADE])?,/;

internals.mapDataToObject = (data) => {

    const matches = data.match(internals.RNC_REGEX);

    if (!matches) {
        return null;
    }

    matches.shift();

    return [
        'time',
        'status',
        'latitude',
        'ns',
        'longitude',
        'ew',
        'speed',
        'course',
        'date',
        'mode'
    ].reduce((acc, key, index) => {

        acc[key] = matches[index];
        return acc;
    }, {});
};
