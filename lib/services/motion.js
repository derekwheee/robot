'use strict';

const Five = require('johnny-five');
const Schmervice = require('@hapipal/schmervice');

const internals = {};

module.exports = class MotionService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    initialize() {

        const { stateService } = this.server.services();
        this.state = stateService.actions.Motors;
        this.interrupt = false;
    }

    expose() {

        return {
            start: this.start.bind(this),
            stop: this.stop.bind(this)
        };
    }

    init() {

        const {
            pinout: {
                motors: {
                    left: {
                        control: leftControlPin
                    },
                    right: {
                        control: rightControlPin
                    }
                }
            }
        } = this.options;

        if (!leftControlPin || !rightControlPin) {
            console.log(`Continuing without motors: Missing pin number`);
            return;
        }

        this.leftDrive = new Five.ESC(leftControlPin);
        this.rightDrive = new Five.ESC(rightControlPin);

        this.state.setReadyState(true);
    }

    async start({ waitBetween = 20 } = {}) {

        this.updateSpeed();

        if (this.interrupt) {
            this.interrupt = false;
            return;
        }

        await internals.delay(waitBetween);
        this.start({ waitBetween });
    }

    stop() {

        this.interrupt = true;
    }

    updateSpeed() {

        const throttle = { /* TODO: get state */ }.channel3;
        const direction = { /* TODO: get state */ }.channel4;
        const [left, right] = internals.getMotorSpeeds(throttle, direction);

        this.leftDrive.throttle(left);
        this.rightDrive.throttle(right);
    }
};

internals.getMotorSpeeds = (throttle, direction) => {

    const speed = 100; // TODO: normalize throttle values to speed percentage
    const factor = -0.5; // TODO: normalize direction values to factor

    return [
        speed - (factor < 0 ? factor : 0) * speed,
        speed - (factor > 0 ? factor : 0) * speed
    ];
};
