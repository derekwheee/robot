'use strict';

const Schmervice = require('@hapipal/schmervice');
// const COCO = require('@tensorflow-models/coco-ssd');
// const TFNode = require('@tensorflow/tfjs-node');
const FS = require('fs');
const Jimp = require('jimp');

const DEBUG = {};
const internals = {};

module.exports = class VisionService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    async initialize() {

        // Load object detection model, it's slow
        // this.model = await COCO.load();
        this.interrupt = false;
    }

    expose() {

        return {
            start: this.start.bind(this),
            stop: this.stop.bind(this)
        };
    }

    init() {

    }

    async start({ waitBetween = 0 } = {}) {

        await this.detectObjects();

        if (this.interrupt) {
            this.interrupt = false;
            return;
        }

        await internals.delay(waitBetween);
        this.start({ waitBetween });
    }

    stop() {

        this.interrupt = true;
    }

    async detectObjects() {

        const filepath = this.options.vision.cameraFilepath;
        const detections = await internals.getImageClassification(filepath, this.model);

        if (this.options.vision.outputImages) {
            const layer1 = await Jimp.read(filepath);
            const layer2 = await Jimp.read(await internals.drawBoundingBoxes(detections));
            const comp = layer1.composite(layer2, 0, 0);
            await comp.writeAsync(this.options.vision.objectsFilepath);
        }

        if (this.options.isDebug) {
            DEBUG.logImage(filepath);
            DEBUG.logDetections(detections);
        }

        return detections;
    }
};

internals.delay = (ms) => {

    return new Promise((resolve) => {

        setTimeout(resolve, ms);
    });
};

internals.getImageClassification = async (path, model) => {

    // TODO: Change this to async
    const imageBuffer = FS.readFileSync(path);
    const image = TFNode.node.decodeImage(imageBuffer);

    return await model.detect(image);
};

internals.drawBoundingBoxes = async (boxes, width = 1280, height = 720) => {

    const canvas = new Jimp(width, height);

    const encode = (cvs) => {

        return new Promise((fulfill, reject) => {

            cvs.getBuffer(Jimp.MIME_PNG, (err, img) => (err ? reject(err) : fulfill(img)));
        });
    };

    const drawLine = (cvs, offset) => {

        const limit = width * height * 4 - 4;

        if (offset > limit) {
            offset = limit;
        }

        if (offset < 0) {
            offset = 0;
        }

        cvs.bitmap.data.writeUInt32BE(0xFF00FFFF, offset, true);
    };

    boxes.forEach(({ bbox: [x, y, w, h] }) => {

        canvas.scan(x, y, w, 1, (...args) => drawLine(canvas, args[2]));
        canvas.scan(x, y + h, w, 1, (...args) => drawLine(canvas, args[2]));
        canvas.scan(x, y, 1, h, (...args) => drawLine(canvas, args[2]));
        canvas.scan(x + w, y, 1, h, (...args) => drawLine(canvas, args[2]));
    });

    return await encode(canvas);
};

DEBUG.logDetections = (detections) => {

    console.log(detections.map(({ class: c, score }) => ({ 'class': c, score })));
};

DEBUG.logImage = async (path) => {

    const { default: TerminalImage } = await import('terminal-image');
    console.log(await TerminalImage.file(path, { width: '25%' }));
};
