'use strict';

const Five = require('johnny-five');
const Schmervice = require('@hapipal/schmervice');

const internals = {};

module.exports = class ReceiverService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    initialize() {

        const { stateService } = this.server.services();
        this.state = stateService.actions.Receiver;
        this.interrupt = false;
    }

    expose() {

        return {
            powerOn: this.#setPower.bind(this, 'high'),
            powerOff: this.#setPower.bind(this, 'low'),
            start: this.start.bind(this),
            receive: this.receive.bind(this)
        };
    }

    init(board) {

        this.board = board;

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
            pin: pinNumber
        });

        this.state.setReadyState(true);

        return this.power;
    }

    async start({ waitBetween = 0 } = {}) {

        await this.receive();

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

    async receive() {

        // TODO: Exit if receiver is powered off

        const { io } = this.board;
        const values = {};

        io.i2cConfig();

        for (let i = 0; i < 12; ++i) {

            values[`channel${i}`] = await this.#readChannel(i);
        }

        this.state.updateValues(values);
    }

    #setPower(to) {

        this.power[to]();
        this.state.setIsOn(!!to);
    }

    #readChannel = (channel) => {

        const { io } = this.board;

        const {
            pinout: {
                receiver: {
                    address
                }
            }
        } = this.options;

        return new Promise((resolve) => {

            io.i2cWrite(address, 1, channel);
            io.i2cReadOnce(address, 1, ([value]) => resolve(value));
        });
    }
};
