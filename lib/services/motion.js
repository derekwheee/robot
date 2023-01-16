'use strict';

const Five = require('johnny-five');
const Schmervice = require('@hapipal/schmervice');

const internals = {};

module.exports = class MotionService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    expose() {

        return {
            center: this.center.bind(this)
        };
    }

    init() {

        const { stateService } = this.server.services();

        const {
            pinout: {
                steering: {
                    servo: servoPinNumber,
                    input: inputPinNumber
                }
            }
        } = this.options;

        if (!servoPinNumber) {
            console.log(`Continuing without steering: Missing servo pin number`);
            return;
        }

        if (!inputPinNumber) {
            console.log(`Continuing without steering: Missing input pin number`);
            return;
        }

        this.input = new Five.Pin({
            pin: inputPinNumber,
            mode: Five.Pin.ANALOG
        });

        this.servo = new Five.Servo({
            pin: servoPinNumber,
            center: true
        });

        stateService.actions.Steering.updatePosition(0);
    }

    center() {

        const { stateService } = this.server.services();

        this.servo.to(0);
        stateService.actions.Steering.updatePosition(0);
    }
};
