'use strict';

const Five = require('johnny-five');
const Schmervice = require('@hapipal/schmervice');

const DEBUG = {};
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
            stop: this.stop.bind(this),
            brake: this.brake.bind(this),
            DEBUG_setSpeed: this.options.isDebug ?
                (...args) => DEBUG.setSpeed(this, ...args) :
                undefined
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

        const config = (pin) => ({
            pin,
            startAt: 90
        });

        this.leftDrive = new Five.Servo(config(leftControlPin));
        this.rightDrive = new Five.Servo(config(rightControlPin));

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

        const leftPulse = { /* TODO: get state */ }.channel3;
        const rightPulse = { /* TODO: get state */ }.channel2;

        this.leftDrive.to(leftPulse);
        this.rightDrive.to(rightPulse);
    }

    brake() {

        this.leftDrive.center();
        this.rightDrive.center();
    }
};

DEBUG.setSpeed = (ctx, left, right = null, ms = 0) => {

    ctx.leftDrive.to(left, ms);
    ctx.rightDrive.to(right ?? left, ms);
};

internals.delay = (ms) => {

    return new Promise((resolve) => {

        setTimeout(resolve, ms);
    });
};
