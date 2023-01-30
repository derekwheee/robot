'use strict';

const Five = require('johnny-five');
const Schmervice = require('@hapipal/schmervice');
const { CONTROl_TYPES, parse } = require('./helpers/receiver');

const internals = {};

module.exports = class MotionService extends Schmervice.Service {

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
            enable: this.enable.bind(this),
            disable: this.disable.bind(this)
        };
    }

    init() {

        const {
            pinout: {
                motors: {
                    enableChannel,
                    enableSwitch
                }
            }
        } = this.options;

        if (!enableChannel) {
            console.log(`Continuing without motors: Missing receiver enable channel`);
        }

        if (!enableSwitch) {
            console.log(`Continuing without motors: Missing receiver enable pin`);
            return;
        }

        this.enableSwitch = new Five.Pin(enableSwitch);

        const { RECEIVER_VALUES } = this.state.slugs.Receiver;
        this.state.events.on(RECEIVER_VALUES, this.enableSwitchListener.bind(this));
        this.state.actions.Motion.setReadyState(true);
    }

    enable() {

        this.enableSwitch.write('high');
        this.state.actions.Motion.setIsEnabled(true);
    }

    disable() {

        this.enableSwitch.write('low');
        this.state.actions.Motion.setIsEnabled(false);
    }

    enableSwitchListener(received) {

        const {
            pinout: {
                motors: {
                    enableChannel
                }
            }
        } = this.options;

        const pulse = received[`channel${enableChannel}`] ?? 0;
        const isOn = !!parse[CONTROl_TYPES.TwO_WAY](pulse);
        const isEnabled = this.state.selectors.Motion.isEnabled();

        if (isOn && !isEnabled) {
            this.enable();
        }
        else if (!isOn && isEnabled) {
            this.disable();
        }
    }
};
