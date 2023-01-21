'use strict';

const Schmervice = require('@hapipal/schmervice');
const NodeWebcam = require('node-webcam');
// const CV = require('@u4/opencv4nodejs');

const internals = {};

module.exports = class VisionService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    initialize() {

    }

    async init() {

        const { default: TerminalImage } = await import('terminal-image');

        this.terminalImage = TerminalImage;
        this.camera = NodeWebcam.create({
            delay: 2,
            width: 1280,
            height: 720,
            quality: 100,
            saveShots: true,
            output: 'jpeg',
            callbackReturn: 'location',
            verbose: false
        });
    }

    capture() {

        this.camera.capture('sight', async (_, filepath) => {

            console.log(await this.terminalImage.file(filepath, { width: '50%' }));
            await this.detectObjects(filepath);
        });
    }

    async detectObjects(filepath) {

        // const classifier = new CV.CascadeClassifier(CV.HAAR_FRONTALFACE_ALT2);

        // try {
        //     const img = await CV.imreadAsync(`./${filepath}`);
        //     const grayImg = await img.bgrToGrayAsync();
        //     const { objects, numDetections } = await classifier.detectMultiScaleAsync(grayImg);

        //     console.log(objects);
        //     console.log(numDetections);
        // }
        // catch (err) {
        //     console.error(err);
        // }
    }
};
