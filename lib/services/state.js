'use strict';

const { EventEmitter } = require('node:events');
const Schmervice = require('@hapipal/schmervice');
const Lo = require('lodash');
const { SLICES, actionCreator, defaultReducer, patchReducer } = require('./helpers/state');

const internals = {};

module.exports = class StateService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    initialize() {

        this.actions = this.#actions;
        this.events = new EventEmitter();

        this.store = {
            Board: {
                isConnected: false,
                isReady: false
            },
            Receiver: {
                isOn: false,
                isReady: false,
                values: {}
            },
            Motion: {
                isReady: false,
                isEnabled: false
            },
            Telemetry: {
                isReady: false,
                values: {}
            }
        };
    }

    getState() {

        return this.store;
    }

    select(slice) {

        return Lo.get(this.store, slice);
    }

    get #actions() {

        const action = actionCreator(this);

        return {
            Board: {
                setConnectedState: action(SLICES.BOARD_IS_CONNECTED, defaultReducer),
                setReadyState: action(SLICES.BOARD_IS_READY, defaultReducer)
            },
            Receiver: {
                setReadyState: action(SLICES.RECEIVER_IS_READY, defaultReducer),
                setIsOn: action(SLICES.RECEIVER_IS_ON, defaultReducer),
                setValues: action(SLICES.RECEIVER_VALUES, defaultReducer)
            },
            Telemetry: {
                setReadyState: action(SLICES.TELEMETRY_IS_READY, defaultReducer),
                updateTelemetry: action(SLICES.TELEMETRY_VALUES, patchReducer)
            },
            Motion: {
                setReadyState: action(SLICES.MOTION_IS_READY, defaultReducer),
                setIsEnabled: action(SLICES.MOTION_IS_ENABLED, defaultReducer)
            }
        };
    }
};
