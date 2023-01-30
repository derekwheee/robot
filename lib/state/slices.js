'use strict';

const internals = {};

module.exports = (state) => {

    const { createSlice } = internals;

    return [
        createSlice(state, 'BOARD', {
            initialState: {
                isConnected: false,
                isReady: false
            },
            actions: {
                setConnectedState: (s, isConnected) => (s.isConnected = isConnected),
                setReadyState: (s, isReady) => (s.isReady = isReady)
            }
        }),
        createSlice(state, 'RECEIVER', {
            initialState: {
                isOn: false,
                isReady: false,
                values: {}
            },
            actions: {
                setReadyState: (s, isReady) => (s.isReady = isReady),
                setIsOn: (s, isOn) => (s.isOn = isOn),
                setValues: (s, values) => (s.values = values)
            }
        }),
        createSlice(state, 'MOTION', {
            initialState: {
                isReady: false,
                isEnabled: false
            },
            actions: {
                setReadyState: (s, isReady) => (s.isReady = isReady),
                setIsEnabled: (s, isEnabled) => (s.isEnabled = isEnabled)
            }
        }),
        createSlice(state, 'TELEMETRY', {
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

internals.createSlice = (state, context, slice) => {

    slice._state = slice._state || {};
    slice.slugs = slice.slugs || {};

    Object.entries(slice.initialState).forEach(([key, value]) => {

        const slug = internals.formatSlug(`${context}_${key}`);
        const handler = internals.proxyHandlerCreator(state, slug);
        slice._state[key] = new Proxy({ value }, handler);
        slice.slugs[key] = key;
    });

    slice.selectors = Object.keys(slice.initialState).reduce((acc, key) => {

        acc[key] = () => slice._state[key].value;
        return acc;
    }, {});


    slice.actions = Object.entries(slice.actions).reduce((acc, [key, reducer]) => {

        acc[key] = internals.action(slice, reducer);
        return acc;
    }, {});

    return {
        name: context,
        ...slice
    };
};

internals.action = (slice, reducer) => {

    return (payload) => reducer(slice._state, payload);
};

internals.proxyHandlerCreator = (state, slug) => ({
    get: (target, key) => {

        if (target[key] && typeof target[key] === 'object') {
            return new Proxy(target[key], internals.proxyHandler);
        }

        return target[key];
    },
    set: (target, key, value) => {

        target[key] = value;
        state.events.emit(slug, value);
    }
});

internals.formatSlug = (name) => name.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`).toUpperCase();
