#include <Wire.h>

#define I2C_ADDRESS 0x27

const int UNSET = -1;

int CHANNELS[12] = {
    /* CHANNEL 1  */ UNSET,
    /* CHANNEL 2  */ UNSET,
    /* CHANNEL 3  */ UNSET,
    /* CHANNEL 4  */ UNSET,
    /* CHANNEL 5  */ 4,
    /* CHANNEL 6  */ 5,
    /* CHANNEL 7  */ 6,
    /* CHANNEL 8  */ UNSET,
    /* CHANNEL 9  */ UNSET,
    /* CHANNEL 10 */ UNSET,
    /* CHANNEL 11 */ UNSET,
    /* CHANNEL 12 */ UNSET
};

int DURATIONS[12];

void setup()
{
    Wire.begin(I2C_ADDRESS);
    Wire.onRequest(requestData);

    for (int i = 0; i < 12; ++i)
    {
        if (CHANNELS[i] != UNSET) {
            pinMode(CHANNELS[i], INPUT);
        }
    }
}

void loop()
{
    get_durations();
}

void get_durations()
{
    for (int i = 0; i < 12; ++i)
    {
        if (CHANNELS[i] > 0) {
            DURATIONS[i] = pulseIn(CHANNELS[i], HIGH, 500000);
        }
    }
}

void requestData()
{
    for (int i = 0; i < 12; ++i)
    {
        if (CHANNELS[i] > 0) {
            Wire.write(DURATIONS[i]);
        }
    }
}