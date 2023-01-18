'use strict';

const { createSlice, configureStore } = require('@reduxjs/toolkit');

const Schmervice = require('@hapipal/schmervice');

const internals = {};

module.exports = class StateService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    initialize() {

        const slices = this.prepareSlices();

        this.store = configureStore({
            reducer: slices.reduce((acc, slice) => {

                acc[slice.name] = slice.reducer;
                return acc;
            }, {})
        });

        this.actions = slices.reduce((acc, slice) => {

            acc[slice.name] = slice.actions;
            return acc;
        }, {});
    }

    prepareSlices() {

        return [
            createSlice({
                name: 'Board',
                initialState: {
                    isConnected: false,
                    isReady: false
                },
                reducers: {
                    setConnectedState: (state, to) => {

                        state.isConnected = to;
                    },
                    setReadyState: (state, to) => {

                        state.isReady = to;
                    }
                }
            }),
            createSlice({
                name: 'Receiver',
                initialState: {
                    isReady: false,
                    isOn: false,
                    values: {}
                },
                reducers: {
                    setReadyState: (state, to) => {

                        state.isReady = to;
                    },
                    setIsOn: (state, to) => {

                        state.isOn = to;
                    },
                    updateValues: (state, update) => {

                        state.values = { ...state.values, ...update };
                    }
                }
            }),
            createSlice({
                name: 'Telemetry',
                initialState: {
                    isReady: false,
                    telemetry: {}
                },
                reducers: {
                    setReadyState: (state, to) => {

                        state.isReady = to;
                    },
                    updateTelemetry: (state, patch) => {

                        state.telemetry = { ...state.telemetry, ...patch };
                    }
                }
            }),
            createSlice({
                name: 'Steering',
                initialState: {
                    isReady: true,
                    position: 0
                },
                reducers: {
                    setReadyState: (state, to) => {

                        state.isReady = to;
                    },
                    updatePosition: (state, value) => {

                        state.position = value;
                    }
                }
            })
        ];
    }
};
