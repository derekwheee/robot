'use strict';

const Five = require('johnny-five');
const Firmata = require('firmata');
const Schmervice = require('@hapipal/schmervice');

const internals = {};

module.exports = class CentralService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    initialize() {

    }

    async start({ io = Firmata } = {}) {

        const { motionService } = this.server.services();

        try {
            const board = await this.createBoard(io);

            motionService.receive({ board });
        }
        catch (err) {
            throw new Error(err);
        }
    }

    createBoard(io) {

        return new Promise((resolve, reject) => {

            console.log('Starting up...');

            const timeout = setTimeout(() => {

                reject('`centralService.createBoard` timed out after 30 seconds');
            }, 30 * 1000);

            const board = new Five.Board({
                io: new io(),
                debug: false,
                repl: false
            });

            if (board.io.constructor.name === 'MockFirmata') {
                clearTimeout(timeout);
                return resolve(board);
            }

            board.on('connect', () => {

                console.log('Board connected');
            });

            board.on('ready', () => {

                console.log('Board is ready');
                resolve(board);
            });
        });
    }
};
