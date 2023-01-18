'use strict';

const Five = require('johnny-five');
const Schmervice = require('@hapipal/schmervice');

const internals = {};

module.exports = class ReceiverService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);

        const { stateService } = server.services();
        this.state = stateService.actions.Receiver;
    }

    expose() {

        return {
            powerOn: this.setPower.bind(this, 1),
            powerOff: this.setPower.bind(this, 0),
            receive: this.receive.bind(this)
        };
    }

    init() {

        const {
            pinout: {
                receiver: {
                    power: pinNumber
                }
            }
        } = this.options;

        if (!pinNumber) {
            console.log(`Continuing without remote control: Missing receiver pin number`);
            return;
        }

        this.power = new Five.Pin({
            pin: pinNumber,
            mode: Five.Pin.ANALOG
        });

        this.state.setReadyState(true);

        return this.power;
    }

    setPower(to) {

        this.power.write(to);
        this.state.setIsOn(!!to);
    }

    receive() {

        // TODO: Exit if receiver is powered off

        const {
            pinout: {
                receiver: {
                    address
                }
            }
        } = this.options;

        this.i2cConfig({
            address
        });

        setInterval(() => {

            this.io.i2cReadOnce(address, 2, (data) => {

                this.state.updateValues(internals.parseData(data));
            });
        }, 50);
    }
};

internals.parseData = (data) => {

    // TODO: Figure out what this data actually looks like
    return data;
};
