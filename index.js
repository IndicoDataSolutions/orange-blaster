require('dotenv').config();
let NodeWebcam = require( "node-webcam" );
let indico = require('indico.io');
let SerialPort = require('serialport');

indico.apiKey = process.env.INDICO_API_KEY;

// Set up the webcam connection
const Webcam = NodeWebcam.create({
    width: 640,
    height: 480,
    delay: 0,
    quality: 80,
    output: "jpeg",
    device: process.env.WEBCAM_DEVICE,
    callbackReturn: "buffer",
    verbose: false
});

// Set up the serial connection to the microcontroller
// Note: These settings are defaults for Arduino serial communication
const serialPort = new SerialPort(process.env.CONTROLLER_SERIAL_PORT, {
    baudRate: parseInt(process.env.CONTROLLER_SERIAL_BAUD),
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
});

const serialFireCommand = "fire"; // This has to match exactly with the command in the arduino sketch

let processing = false;
let captureLoop;

/**
 * Calls indico API to analyse captured image
 * @param base64String - base64 encoded image
 * @returns {Promise}
 */
const checkImage = (base64String) => {
    return new Promise((resolve, reject) => {
        //TODO: Use our custom collection instead
        indico.fer(base64String)
            .then((res) => {
                // TODO: Return true/false based on the  result
                console.log(res);
                resolve(true);
            })
            .catch(function (err) {
                console.log('err: ', err);
                reject();
            });
    });
};

const startCapture = () => {
    captureLoop = setInterval(() => {
        if (!processing) {
            processing = true;
            Webcam.capture("captured_image", function (err, data) {

                if (data) {
                    const base64Image = data.toString('base64');
                    checkImage(base64Image)
                        .then((res) => {
                            if (res) {
                                serialPort.write(serialFireCommand);
                                console.log('Fire ze missiles!');
                            }
                            processing = false;
                        })
                        .catch((err) => {
                            console.log('Well have a nap...');
                            processing = false;
                        });
                }
            });
        }
    }, 500);
};

const stopCapture = () => {
    clearInterval(captureLoop);
};

const init = () => {
    serialPort.on("open", function () {
        console.log('Serial Communication Open');
        startCapture();
        processing = false;
    });
};

// Close our connections
process.on('SIGINT', () => {
    stopCapture();
    serialPort.close();
});

// Systems Enable
init();
