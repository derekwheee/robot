'use strict';

const { createSlice } = require('@reduxjs/toolkit');

module.exports = [
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
        name: 'Motors',
        initialState: {
            isReady: true
        },
        reducers: {
            setReadyState: (state, to) => {

                state.isReady = to;
            }
        }
    })
];
