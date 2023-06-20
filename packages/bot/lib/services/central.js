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

    async start({ autoStart = false, giveSight = false } = {}) {

        const {
            communicationService,
            indicatorService,
            locationService,
            motionService,
            receiverService,
            telemetryService,
            visionService,
            stateService
        } = this.server.services();

        const board = await this.createBoard();

        communicationService.init();
        indicatorService.init();
        locationService.init();
        motionService.init();
        receiverService.init(board);
        telemetryService.init();
        visionService.init({ withCV: giveSight });

        if (autoStart) {
            this.engage();
        }

        board.repl.inject({
            central: this.expose(),
            communication: communicationService.expose(),
            indicator: indicatorService.expose(),
            location: locationService.expose(),
            motion: motionService.expose(),
            receiver: receiverService.expose(),
            telemetry: telemetryService.expose(),
            vision: visionService.expose(),
            state: stateService
        });
    }

    engage() {

        const {
            indicatorService,
            locationService,
            receiverService
        } = this.server.services();

        indicatorService.start();
        locationService.start();
        receiverService.start();
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
