'use strict';

const { EventEmitter } = require('node:events');
const Schmervice = require('@hapipal/schmervice');

const Slices = require('../state/slices');

const internals = {};

module.exports = class StateService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    initialize() {

        this.events = new EventEmitter();

        const slices = Slices(this);

        this.actions = slices.reduce((acc, slice) => {

            acc[slice.name] = slice.actions;
            return acc;
        }, {});

        this.selectors = slices.reduce((acc, slice) => {

            acc[slice.name] = slice.selectors;
            return acc;
        }, {});

        this.slugs = slices.reduce((acc, slice) => {

            acc[slice.name] = slice.slugs;
            return acc;
        }, {});
    }
};
