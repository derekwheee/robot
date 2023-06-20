#include <Wire.h>

#define I2C_ADDRESS 0x28

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