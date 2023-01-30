// I2C BACKPACK BOILERPLATE
// CHANGE I2C_ADDRESS BEFORE USING

#include <Wire.h>

#define I2C_ADDRESS 0x99

void setup()
{
    Wire.begin(I2C_ADDRESS);
    Wire.onRequest(requestData);
    Wire.onReceive(receiveData);
}

void loop()
{
    do_something();
}

void do_something()
{
    /* do some work */
}

void requestData()
{
    Wire.write(/* something */);
}

void receiveData(int howMany)
{

    int reg = Wire.read();
    int value = Wire.read();

    /* do some work */
}