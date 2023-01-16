'use strict';

const Five = require('johnny-five');
const Schmervice = require('@hapipal/schmervice');

const internals = {};

module.exports = class CentralService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    async start() {

        const { motionService, receiverService, telemetryService } = this.server.services();

        const board = await this.createBoard();

        receiverService.init();
        telemetryService.init();
        motionService.init();

        board.repl.inject({
            receiver: receiverService.expose(),
            telemetry: telemetryService.expose(),
            motion: motionService.expose()
        });
    }

    createBoard() {

        const { stateService } = this.server.services();

        return new Promise((resolve) => {

            console.log('Starting up...');

            const timeout = setTimeout(() => {

                throw new Error('`centralService.createBoard` timed out after 5 seconds');
            }, 5 * 1000);

            const board = new Five.Board();

            board.on('connect', () => {

                stateService.actions.Board.setConnectedState(true);
                console.log('Board connected');
            });

            board.on('ready', () => {

                stateService.actions.Board.setReadyState(true);
                console.log('Board is ready');
                clearTimeout(timeout);
                resolve(board);
            });
        });
    }
};
