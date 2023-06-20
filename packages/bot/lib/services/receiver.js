'use strict';

const Schmervice = require('@hapipal/schmervice');
const {
    PINS: {
        DIGITAL
    },
    RECEIVER_CONFIG: {
        NUM_CHANNELS,
        CHANNEL_OFFSET,
        I2C_BYTES_TO_READ,
        I2C_REGISTER
    }
} = require('../utils/constants');

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
            on: this.#setPower.bind(this, DIGITAL.HIGH),
            off: this.#setPower.bind(this, DIGITAL.LOW),
            start: this.start.bind(this),
            stop: this.stop.bind(this),
            receive: this.receive.bind(this)
        };
    }

    init(board) {

        this.board = board;

        const {
            pinout: {
                receiver: { address }
            }
        } = this.options;

        if (!address) {
            console.log(`Continuing without remote control: Missing receiver address`);
            return;
        }

        board.io.i2cConfig();

        this.state.actions.Receiver.setReadyState(true);
    }

    async start({ waitBetween = 20 } = {}, isRunning = false) {

        const isOn = this.state.selectors.Receiver.isOn();

        if (!isOn) {
            this.#setPower(DIGITAL.HIGH);
        }

        if (!isRunning) {
            this.state.actions.Receiver.setIsReceiving(true);
        }

        await this.receive();

        if (this.interrupt) {

            this.state.actions.Receiver.setIsReceiving(false);

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

        const isOn = this.state.selectors.Receiver.isOn();
        const values = this.state.selectors.Receiver.values();

        if (!isOn) {
            return;
        }

        for (let i = 0; i < NUM_CHANNELS; ++i) {

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

            values[`channel${i + CHANNEL_OFFSET}`] = internals.parseData(data) ?? values[`channel${i + CHANNEL_OFFSET}`];
        }

        this.state.actions.Receiver.setValues(values);

        return values;
    }

    #setPower(to = DIGITAL.LOW) {

        const { io } = this.board;

        const {
            pinout: {
                receiver: {
                    address
                }
            }
        } = this.options;

        io.i2cWrite(address, I2C_REGISTER.SET_POWER, to);
        this.state.actions.Receiver.setIsOn(!!to);
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

            io.i2cWrite(address, I2C_REGISTER.SET_CHANNEL, channel);
            io.i2cReadOnce(address, I2C_BYTES_TO_READ, (data) => {

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
