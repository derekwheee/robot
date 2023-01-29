'use strict';

exports.CONTROl_TYPES = {
    TwO_WAY: 'two-way',
    THREE_WAY: 'three-way',
    KNOB: 'knob'
};

exports.pulseToPercent = (pulse) => {

    const r1 = [1000, 2000];
    const r2 = [0, 100];

    return (pulse - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
};

exports.parse = {
    [exports.CONTROl_TYPES.TwO_WAY]: (value) => (value > 1500 ? 1 : 0),
    [exports.CONTROl_TYPES.KNOB]: exports.pulseToPercent,
    [exports.CONTROl_TYPES.THREE_WAY]: (value) => {

        if (value < 1300) {
            return 0;
        }

        return value < 1800 ? 1 : 2;
    }
};


