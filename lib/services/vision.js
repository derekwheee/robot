'use strict';

const Schmervice = require('@hapipal/schmervice');
const FS = require('fs/promises');
const Jimp = require('jimp');
const { toBase64 } = require('../utils/image');
const { MQTT_TOPICS } = require('../utils/constants');

const DEBUG = {};
const internals = {};

module.exports = class VisionService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);
    }

    initialize() {

        this.interrupt = false;
    }

    expose() {

        return {
            // visionService can be re-initialized with CV, so expose it
            init: this.init.bind(this),
            start: this.start.bind(this),
            stop: this.stop.bind(this)
        };
    }

    async init({ withCV = false } = {}) {

        this.useComputerVision = withCV;

        if (this.useComputerVision) {
            const COCO = require('@tensorflow-models/coco-ssd');

            // Load object detection model, it's slow
            this.tensor = require('@tensorflow/tfjs-node');
            this.model = await COCO.load();
        }
    }

    async start({ waitBetween = this.options.vision.framerateMs } = {}) {

        if (this.useComputerVision) {
            await this.detectObjects();
        }

        await this.publishFrame();

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

    async publishFrame() {

        const { mqttService } = this.server.services();

        mqttService.register(MQTT_TOPICS.VISION, 'frame');

        const filepath = this.useComputerVision ?
            this.options.vision.objectsFilepath :
            this.options.vision.cameraFilepath;

        const image = await toBase64(filepath);
        const timestamp = new Date();

        mqttService.publish(`${MQTT_TOPICS.VISION}/frame`, { image, timestamp });

        if (this.interrupt) {
            this.interrupt = false;
            return;
        }
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

    const imageBuffer = await FS.readFile(path);
    const image = this.tensor.node.decodeImage(imageBuffer);

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
