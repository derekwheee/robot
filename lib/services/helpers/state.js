'use strict';

const Lo = require('lodash');

const internals = {};

exports.SLICES = {
    BOARD_IS_CONNECTED: 'Board.isConnected',
    BOARD_IS_READY: 'Board.isReady',
    RECEIVER_IS_ON: 'Receiver.isOn',
    RECEIVER_IS_READY: 'Receiver.isReady',
    RECEIVER_VALUES: 'Receiver.values',
    TELEMETRY_IS_READY: 'Telemetry.isReady',
    TELEMETRY_VALUES: 'Telemetry.values',
    MOTION_IS_READY: 'Motion.isReady',
    MOTION_IS_ENABLED: 'Motion.isEnabled'
};

exports.actionCreator = (state) => {

    return (slice, fn) => {

        return (...args) => {

            fn(state, slice, ...args);
            state.events.emit(slice, Lo.get(state.store, slice));
        };
    };
};

exports.defaultReducer = (state, slice, patch) => internals.setSliceValue(state, slice, patch);

exports.patchReducer = (state, slice, patch) => {

    const prev = Lo.get(state.store, slice);

    internals.setSliceValue({ ...prev, ...patch });
};

internals.setSliceValue = (state, slice, value) => {

    const parts = slice.split('.');
    const key = parts.pop();

    state.store[parts.join('.')][key] = value;
};
