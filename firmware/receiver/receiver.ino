#include <Wire.h>

#define I2C_ADDRESS 0x27

const int UNSET = -1;
const int ERROR_PULSE = -1;
const int NUM_CHANNELS = 7;
int READ_CHANNEL = 0;

// Pinout
int POWER = 2;
int CHANNELS[NUM_CHANNELS] = {
    /* CHANNEL 5  */ 5,
    /* CHANNEL 6  */ 7,
    /* CHANNEL 7  */ 9,
    /* CHANNEL 8  */ 10,
    /* CHANNEL 9  */ 11,
    /* CHANNEL 10 */ 12,
    /* CHANNEL 11 */ 13};

uint32_t DURATIONS[NUM_CHANNELS];

void setup()
{
    Wire.begin(I2C_ADDRESS);
    Wire.onRequest(requestData);
    Wire.onReceive(receiveData);

    pinMode(POWER, OUTPUT);

    for (int i = 0; i < NUM_CHANNELS; ++i)
    {
        if (CHANNELS[i] != UNSET)
        {
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
    for (int i = 0; i < NUM_CHANNELS; ++i)
    {
        if (CHANNELS[i] > 0)
        {
            int pulse = pulseIn(CHANNELS[i], HIGH, 500000);

            DURATIONS[i] = pulse > 999 && pulse < 2001 ? pulse : ERROR_PULSE;
        }
    }
}

void setPowerPin(bool toHigh)
{

    digitalWrite(POWER, toHigh ? HIGH : LOW);
}

void requestData()
{

    char data[16];
    itoa(DURATIONS[READ_CHANNEL], data, 10);

    Wire.write(data);
}

void receiveData(int howMany)
{

    int reg = Wire.read();
    int value = Wire.read();

    if (reg == 1)
    {
        READ_CHANNEL = value;
    }

    if (reg == 2)
    {
        setPowerPin(value == 1 ? true : false);
    }
}