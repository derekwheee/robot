'use strict';

const internals = {};

exports.createSlice = (state, context, slice) => {

    slice._state = slice._state || {};
    slice.slugs = slice.slugs || {};

    Object.entries(slice.initialState).forEach(([key, value]) => {

        const slug = internals.formatSlug(`${context.toLowerCase()}_${key}`);
        const handler = internals.proxyHandlerCreator(state, slug);

        slice._state[key] = new Proxy({}, handler);
        slice._state[key].value = value;
        slice.slugs[slug] = slug;
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

    return (payload) => reducer(internals.mapActionState(slice._state), payload);
};

internals.proxyHandlerCreator = (state, slug) => ({
    get: (target, key) => target[key],
    set: (target, key, value) => {

        target[key] = value;
        state.events.emit(slug, value);

        return true;
    }
});

internals.formatSlug = (name) => name.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`).toUpperCase();

internals.mapActionState = (state) => {

    return Object.entries(state).reduce((acc, [key, target]) => {

        Object.defineProperty(acc, key, {
            get() {

                return target.value;
            },
            set(to) {

                target.value = to;
            }
        });

        return acc;
    }, {});
};
