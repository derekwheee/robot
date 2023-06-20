'use strict';

const { createSlice } = require('./helpers');

module.exports = (state) => {

    return [
        createSlice(state, 'Board', {
            initialState: {
                isConnected: false,
                isReady: false
            },
            actions: {
                setConnectedState: (s, isConnected) => (s.isConnected = isConnected),
                setReadyState: (s, isReady) => (s.isReady = isReady)
            }
        }),
        createSlice(state, 'GPS', {
            initialState: {
                isReady: false,
                isReading: false,
                location: {}
            },
            actions: {
                setReadyState: (s, isReady) => (s.isReady = isReady),
                setIsReading: (s, isReading) => (s.isReading = isReading),
                setLocation: (s, location) => (s.location = location)
            }
        }),
        createSlice(state, 'Receiver', {
            initialState: {
                isOn: false,
                isReady: false,
                isReceiving: false,
                values: {}
            },
            actions: {
                setReadyState: (s, isReady) => (s.isReady = isReady),
                setIsOn: (s, isOn) => (s.isOn = isOn),
                setIsReceiving: (s, isReceiving) => (s.isReceiving = isReceiving),
                setValues: (s, values) => (s.values = values)
            }
        }),
        createSlice(state, 'Motion', {
            initialState: {
                isReady: false,
                isEnabled: false
            },
            actions: {
                setReadyState: (s, isReady) => (s.isReady = isReady),
                setIsEnabled: (s, isEnabled) => (s.isEnabled = isEnabled)
            }
        }),
        createSlice(state, 'MQTT', {
            initialState: {
                isReady: false
            },
            actions: {
                setReadyState: (s, isReady) => (s.isReady = isReady)
            }
        }),
        createSlice(state, 'Telemetry', {
            initialState: {
                isReady: false,
                values: {}
            },
            actions: {
                setReadyState: (s, isReady) => (s.isReady = isReady),
                updateTelemetry: (s, values) => (s.values = { ...s.values, ...values })
            }
        })
    ];
};
