'use strict';

const { configureStore, createListenerMiddleware } = require('@reduxjs/toolkit');

const Schmervice = require('@hapipal/schmervice');
const Slices = require('./slices');
const Effects = require('./effects');

const internals = {};

module.exports = class StateService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    initialize() {

        this.store = configureStore({
            reducer: Slices.reduce((acc, slice) => {

                acc[slice.name] = slice.reducer;
                return acc;
            }, {}),
            middleware: (getDefaultMiddleware) =>

                getDefaultMiddleware().prepend()
        });

        this.actions = Slices.reduce((acc, slice) => {

            acc[slice.name] = slice.actions;
            return acc;
        }, {});
    }
};

internals.setupMiddleware = () => {

    const listenerMiddleware = createListenerMiddleware();

    const slugToAction = (slug) => {

        const [name, action] = slug.split('.');
        return Slices.find((s) => s.name === name)?.actions[action];
    };

    Effects.forEach(({ slugs, effect }) => {

        slugs.forEach((slug) => {

            listenerMiddleware.startListening({
                actionCreator: slugToAction(slug),
                effect
            });
        });
    });

    return listenerMiddleware;
};
