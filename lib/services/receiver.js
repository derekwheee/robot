'use strict';

const Five = require('johnny-five');
const Schmervice = require('@hapipal/schmervice');

const internals = {};

module.exports = class ReceiverService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    expose() {

        return {
            powerOn: this.powerOn.bind(this),
            powerOff: this.powerOff.bind(this)
        };
    }

    init() {

        const { stateService } = this.server.services();

        const {
            pinout: {
                receiver: pinNumber
            }
        } = this.options;

        this.pin = new Five.Pin({
            pin: pinNumber,
            mode: Five.Pin.OUTPUT
        });

        // Ensure the receiver is not powered on at startup
        this.pin.write(0);
        stateService.actions.Receiver.powerOff();

        stateService.actions.Receiver.setReadyState(true);

        return this.pin;
    }

    powerOn() {

        const { stateService } = this.server.services();

        this.pin.write(1);
        stateService.actions.Receiver.powerOn();
    }

    powerOff() {

        const { stateService } = this.server.services();
        this.pin.write(0);
        stateService.actions.Receiver.powerOff();
    }
};
