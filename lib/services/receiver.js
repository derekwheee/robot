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
        this.state = stateService;
        this.interrupt = false;
    }

    expose() {

        return {
            on: this.#setPower.bind(this, 'high'),
            off: this.#setPower.bind(this, 'low'),
            start: this.start.bind(this),
            stop: this.stop.bind(this),
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

        board.io.i2cConfig();

        this.state.actions.Receiver.setReadyState(true);

        return this.power;
    }

    async start({ waitBetween = 20 } = {}, isRunning = false) {

        this.#setPower('high');
        await this.receive();

        if (this.interrupt) {
            this.interrupt = false;
            return;
        }

        await internals.delay(waitBetween);
        this.start({ waitBetween }, true);
    }

    stop() {

        this.interrupt = true;
    }

    async receive() {

        // TODO: Exit if receiver is powered off
        const values = this.state.getState().Receiver.values;

        for (let i = 0; i < 12; ++i) {

            let data = [];
            try {
                data = await this.#readChannel(i);
            }
            catch (err) {
                if (err.includes('timed out')) {
                    console.log(err);
                    continue;
                }
                else {
                    throw err;
                }
            }

            values[`channel${i + 1}`] = internals.parseData(data) ?? values[`channel${i + 1}`];
        }

        this.state.actions.Receiver.setValues(values);
    }

    #setPower(to) {

        this.power[to]();
        this.state.actions.Receiver.setIsOn(to === 'high' ? true : false);
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

        return new Promise((resolve, reject) => {

            const timeout = setTimeout(() => {

                reject('`receiverService.#readChannel` timed out after 200ms');
            }, 200);

            io.i2cWrite(address, 1, channel);
            io.i2cReadOnce(address, 4, (data) => {

                clearTimeout(timeout);
                resolve(data);
            });
        });
    }
};

internals.parseData = (buffer) => {

    const str = String.fromCharCode(...buffer);
    const num = Number(str);

    return isNaN(num) ? null : num;
};

internals.delay = (ms) => {

    return new Promise((resolve) => {

        setTimeout(resolve, ms);
    });
};
