'use strict';

const Five = require('johnny-five');
const Schmervice = require('@hapipal/schmervice');

const internals = {};

module.exports = class TelemetryService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    expose() {

        return {
            write: this.write.bind(this)
        };
    }

    init() {

        const { stateService } = this.server.services();

        this.pins = {};

        const {
            pinout: {
                telemetry1: pinNumber1,
                telemetry2: pinNumber2,
                telemetry3: pinNumber3,
                telemetry4: pinNumber4,
                telemetry5: pinNumber5,
                telemetry6: pinNumber6
            }
        } = this.options;

        [
            pinNumber1,
            pinNumber2,
            pinNumber3,
            pinNumber4,
            pinNumber5,
            pinNumber6
        ].forEach((pinNumber, index) => {

            if (!pinNumber) {
                console.log(`Continuing without telemetry${index}: Missing pin number`);
                return;
            }

            this.pins[`telemetry${index}`] = new Five.Pin({
                pin: pinNumber,
                mode: Five.Pin.OUTPUT
            });

            // Reset all telemetry at startup
            this.pins[`telemetry${index}`].write(0);
            stateService.actions.Telemetry.updateTelemetry({ [`telemetry${index}`]: 0 });
        });

        return this.pin;
    }

    write(pin, value) {

        const { stateService } = this.server.services();

        this.pins[`telemetry${pin}`].write(value);
        stateService.actions.Telemetry.updateTelemetry({ [`telemetry${pin}`]: value });
    }
};
