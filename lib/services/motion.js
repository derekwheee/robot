'use strict';

const Five = require('johnny-five');
const Schmervice = require('@hapipal/schmervice');

const internals = {};

module.exports = class MotionService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    receive() {

        const {
            pinout: {
                motor
            }
        } = this.options;

        const motorPin = new Five.Pin({
            pin: motor,
            mode: Five.Pin.INPUT
        });

        motorPin.on('low', (err, value) => {

            if (err) {
                console.error(err);
                return;
            }

            /* Do something */
            console.log({ value });
        });

        motorPin.on('high', (err, value) => {

            if (err) {
                console.error(err);
                return;
            }

            /* Do something */
            console.log({ value });
        });
    }
};
