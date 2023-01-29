#include <Wire.h>

#define I2C_ADDRESS 0x27

const int UNSET = -1;
int READ_CHANNEL = 0;

int CHANNELS[12] = {
    /* CHANNEL 1  */ 13,
    /* CHANNEL 2  */ 12,
    /* CHANNEL 3  */ 11,
    /* CHANNEL 4  */ 10,
    /* CHANNEL 5  */ UNSET,
    /* CHANNEL 6  */ UNSET,
    /* CHANNEL 7  */ UNSET,
    /* CHANNEL 8  */ UNSET,
    /* CHANNEL 9  */ UNSET,
    /* CHANNEL 10 */ UNSET,
    /* CHANNEL 11 */ UNSET,
    /* CHANNEL 12 */ UNSET};

uint32_t DURATIONS[12];

void setup()
{
    Wire.begin(I2C_ADDRESS);
    Wire.onRequest(requestData);
    Wire.onReceive(receiveData);

    for (int i = 0; i < 12; ++i)
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
    for (int i = 0; i < 12; ++i)
    {
        if (CHANNELS[i] > 0)
        {
            DURATIONS[i] = pulseIn(CHANNELS[i], HIGH, 500000);
        }
    }
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
}