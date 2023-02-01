'use strict';

const Five = require('johnny-five');
const Schmervice = require('@hapipal/schmervice');

const internals = {};

module.exports = class CentralService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    expose() {

        return {
            engage: this.engage.bind(this)
        };
    }

    async start({ autoStart = false } = {}) {

        const {
            indicatorService,
            motionService,
            mqttService,
            receiverService,
            telemetryService,
            // visionService,
            stateService
        } = this.server.services();

        const board = await this.createBoard();

        indicatorService.init();
        motionService.init();
        mqttService.init();
        receiverService.init(board);
        telemetryService.init();
        // visionService.init();

        if (autoStart) {
            this.engage();
        }

        board.repl.inject({
            central: this.expose(),
            indicator: indicatorService.expose(),
            motion: motionService.expose(),
            mqtt: mqttService.expose(),
            receiver: receiverService.expose(),
            telemetry: telemetryService.expose(),
            // vision: visionService.expose(),
            state: stateService
        });
    }

    async engage() {

        const {
            indicatorService,
            receiverService
        } = this.server.services();

        await indicatorService.start();
        await receiverService.start();
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
