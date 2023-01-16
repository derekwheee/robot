'use strict';

const Dotenv = require('dotenv');
const Confidence = require('@hapipal/confidence');
const Toys = require('@hapipal/toys');

// Pull .env into process.env
Dotenv.config({ path: `${__dirname}/.env` });

// Glue manifest as a confidence store
module.exports = new Confidence.Store({
    server: {
        debug: {
            $filter: 'NODE_ENV',
            $default: {
                log: ['error', 'start'],
                request: ['error']
            },
            production: {
                request: ['implementation']
            }
        }
    },
    register: {
        plugins: [
            {
                plugin: '../lib', // Main plugin
                options: {
                    pinout: {
                        receiver: { $param: 'RECEIVER' },
                        steering: {
                            servo: { $param: 'STEERING_SERVO', $coerce: 'number' },
                            input: { $param: 'STEERING_INPUT' }
                        },
                        motor1: { $param: 'MOTOR_1' },
                        telemetry1: { $param: 'TELEMETRY_1' },
                        telemetry2: { $param: 'TELEMETRY_2' },
                        telemetry3: { $param: 'TELEMETRY_3' },
                        telemetry4: { $param: 'TELEMETRY_4' },
                        telemetry5: { $param: 'TELEMETRY_5' },
                        telemetry6: { $param: 'TELEMETRY_6' }
                    }
                }
            },
            {
                plugin: {
                    $filter: 'NODE_ENV',
                    $default: '@hapipal/hpal-debug',
                    production: Toys.noop
                }
            }
        ]
    }
});
