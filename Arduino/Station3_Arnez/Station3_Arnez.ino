#include <stdlib.h>

String stationName = "Arnez1";
int stationFrequency = 2000;

int pinTemperature = 5;
String temperatureName = "Degrees (c)";

//int pinSound = 1;
//String soundName = "Sound"; //10-80cm



void setup()
{
  Serial.begin(9600);
  pinMode(pinTemperature, INPUT);
}

void loop()
{

 //getting the voltage reading from the temperature sensor
 int reading = analogRead(pinTemperature);  
 
 // converting that reading to voltage, for 3.3v arduino use 3.3
//float voltage = reading * 5.0;
float voltage = reading * 5.0; // battery power
 voltage /= 1024.0; 
 
 // print out the voltage
 //Serial.print(voltage); Serial.println(" volts");
 
 // now print out the temperature
 float temperatureC = (voltage - 0.5) * 100 ;  //converting from 10 mv per degree wit 500 mV offset
                                               //to degrees ((volatge - 500mV) times 100)
 //Serial.print(temperatureC); Serial.println(" degrees C");
 
 // now convert to Fahrenheight
 float temperatureF = (temperatureC * 9.0 / 5.0) + 32.0;
 //Serial.print(temperatureF); Serial.println(" degrees F");

 
  String converted = dtostrf(temperatureC, 5, 5, new char[11]);
                
  String tempValue = "{ \"Station\": \"" + stationName + "\", " + 
                        "\"Sensor\": \"" + temperatureName + "\", " +
                        "\"Value\": \"" + converted + "\"} ";

  Serial.println(tempValue);
//   delay(100);
//  Serial.println(soundValue);
 
  delay(stationFrequency); 


}


