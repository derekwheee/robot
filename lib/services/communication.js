'use strict';

const Schmervice = require('@hapipal/schmervice');

const internals = {};

module.exports = class CommunicationService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    initialize() {

        const { stateService } = this.server.services();
        this.state = stateService;
    }

    expose() {

        return {
            register: this.register.bind(this),
            publish: this.publish.bind(this)
        };
    }

    init() {

    }

    register(topic, action) {

        this.server.subscription(`${topic}/${action}`);
    }

    async publish(topic, message, cb) {

        await this.server.publish(topic, message);
    }
};
