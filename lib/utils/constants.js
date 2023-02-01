'use strict';

exports.PINS = {
    DIGITAL: {
        HIGH: 1,
        LOW: 0
    }
};

exports.RECEIVER_CONFIG = {
    NUM_CHANNELS: 7, // Number of channels read from receiver
    CHANNEL_OFFSET: 5, // Offset between array index and channel number
    I2C_BYTES_TO_READ: 4,
    I2C_REGISTER: {
        SET_POWER: 2,
        SET_CHANNEL: 1
    }
};

exports.INDICATORS = {
    MOTORS_ENABLED: 'motorsEnabled',
    RECEIVING: 'receiving'
};
