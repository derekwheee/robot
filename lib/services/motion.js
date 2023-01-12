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
                motor1
            }
        } = this.options;

        const motor1Pin = new Five.Pin({
            pin: motor1,
            mode: Five.Pin.INPUT
        });

        motor1Pin.on('low', (err, value) => {

            if (err) {
                console.error(err);
                return;
            }

            /* Do something */
            console.log({ value });
        });

        motor1Pin.on('high', (err, value) => {

            if (err) {
                console.error(err);
                return;
            }

            /* Do something */
            console.log({ value });
        });
    }
};
