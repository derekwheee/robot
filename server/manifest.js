'use strict';

const Dotenv = require('dotenv');
const Confidence = require('@hapipal/confidence');
const Toys = require('@hapipal/toys');
const { INDICATORS } = require('../lib/utils/constants');

// Pull .env into process.env
Dotenv.config({ path: `${__dirname}/.env` });

// Glue manifest as a confidence store
module.exports = new Confidence.Store({
    server: {
        host: '0.0.0.0',
        port: {
            $param: 'PORT',
            $coerce: 'number',
            $default: 4000
        },
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
                    isDebug: { $param: 'DEBUG', $default: false, 1: true },
                    vision: {
                        framerateMs: { $param: 'VISION_FRAMERATE', $default: 1000 },
                        outputImages: { $param: 'VISION_OUTPUT_IMAGES', $default: false, 1: true },
                        cameraFilepath: { $param: 'VISION_CAMERA_FILEPATH' },
                        objectsFilepath: { $param: 'VISION_OBJECTS_FILEPATH' }
                    },
                    location: {
                        port: { $param: 'GPS_PORT' }
                    },
                    pinout: {
                        receiver: {
                            address: { $param: 'RECEIVER_ADDRESS', $coerce: 'number' }
                        },
                        motors: {
                            enableChannel: { $param: 'MOTOR_ENABLE_CHANNEL' },
                            enableSwitch: { $param: 'MOTOR_ENABLE_SWITCH' }
                        },
                        telemetry1: { $param: 'TELEMETRY_1' },
                        telemetry2: { $param: 'TELEMETRY_2' },
                        telemetry3: { $param: 'TELEMETRY_3' },
                        telemetry4: { $param: 'TELEMETRY_4' },
                        telemetry5: { $param: 'TELEMETRY_5' },
                        telemetry6: { $param: 'TELEMETRY_6' },
                        indicators: {
                            [INDICATORS.MOTORS_ENABLED]: { $param: 'INDICATOR_MOTORS_ENABLED' },
                            [INDICATORS.RECEIVING]: { $param: 'INDICATOR_RECEIVING' }
                        }
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
