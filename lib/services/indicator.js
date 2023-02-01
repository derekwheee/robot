'use strict';

const Five = require('johnny-five');
const Schmervice = require('@hapipal/schmervice');
const { INDICATORS } = require('../utils/constants');

const internals = {};

module.exports = class IndicatorService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    initialize() {

        const { stateService } = this.server.services();
        this.state = stateService;
        this.interrupt = false;
    }

    expose() {

        return {
            start: this.start.bind(this),
            stop: this.stop.bind(this)
        };
    }

    init() {

        const {
            pinout: {
                indicators
            }
        } = this.options;

        Object.entries(indicators).forEach(([indicator, pinNumber]) => {

            if (!pinNumber) {
                console.log(`Continuing without Indicator '${indicator}': Missing pin number`);
                return;
            }

            this[indicator] = new Five.Pin(pinNumber);
            this[indicator].strobe(300);
        });
    }

    start() {

        const parsers = internals.getIndicatorParsers(this);
        const slugs = internals.getIndicatorSlugs(this.state.slugs);

        Object.values(INDICATORS).forEach((indicator) => {

            this.state.events.on(slugs[indicator], parsers[indicator]);
        });
    }

    stop() {

        const slugs = internals.getIndicatorSlugs(this.state.slugs);

        Object.values(INDICATORS).forEach((indicator) => {

            this.state.events.off(slugs[indicator]);
            this[indicator].off();
        });
    }
};

internals.toDefaultParser = (ctx, acc, [k ,indicator]) => {

    acc[k] = (bool) => ctx[indicator][bool ? 'on' : 'off'];
    return acc;
};

internals.getIndicatorParsers = (ctx) => ({
    ...Object.values(INDICATORS)
        .reduce((...a) => internals.toDefaultParser(ctx, ...a), {})
    /* Custom parsers go here */
});

internals.getIndicatorSlugs = (slugs) => ({
    [INDICATORS.MOTORS_ENABLED]: slugs.MOTION_IS_ENABLED,
    [INDICATORS.RECEIVING]: slugs.RECEIVER_IS_RECEIVING
});
