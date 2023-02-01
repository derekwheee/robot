'use strict';

const MQTT = require('mqtt');
const Schmervice = require('@hapipal/schmervice');

const internals = {};

module.exports = class MqttService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    initialize() {

        const { stateService } = this.server.services();
        this.state = stateService;
    }

    expose() {

        return {
            publish: this.publish.bind(this),
            subscribe: this.subscribe.bind(this)
        };
    }

    init() {

        return new Promise((resolve, reject) => {

            const { mqttHost } = this.options;

            const timeout = setTimeout(() => {

                console.log(`Continuing without MQTT: Connection timed out after 5 seconds`);
                reject();
            }, 5000);

            this.topics = {};
            this.client = MQTT.connect(mqttHost);

            this.client.on('connect', () => {

                clearTimeout(timeout);

                this.client.on('message', this.#routeMessage);
                this.state.actions.MQTT.setReadyState(true);
                resolve();
            });
        });
    }

    publish(topic, message, cb) {

        this.client.publish(topic, message, cb);
    }

    subscribe(topic, cb) {

        this.client.subscribe(topic, (err) => {

            if (err) {
                console.error(err);
                return;
            }

            if (!err) {
                if (topic in this.topics) {
                    this.topics[topic].subscribers.push(cb);
                }
                else {
                    this.topics[topic] = {
                        subscribers: [cb]
                    };
                }
            }
        });
    }

    #routeMessage(topic, buffer) {

        if (!(topic in this.topics)) {
            console.log(`Unhandled MQTT topic: ${topic}`);
            console.log(`Message received: ${buffer.toString()}`);
            return;
        }

        this.topics[topic].subscribers.forEach((fn) => fn(topic, buffer));
    }
};
