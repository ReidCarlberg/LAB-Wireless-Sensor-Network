#include <stdlib.h>

String stationName = "Station1";
int stationFrequency = 2000;

int pinTemperature = 8;
String temperatureName = "Degrees (c)";

int pinOther = 9;
String otherName = "Brightness";

int pinSound = 10;
String soundName = "Sound";


void setup()
{
  Serial.begin(9600);
  pinMode(pinTemperature, INPUT);
  //analogReference(EXTERNAL);
}

void loop()
{

 //getting the voltage reading from the temperature sensor
 int reading = analogRead(pinTemperature);  
 //Serial.println(reading); 
 // converting that reading to voltage, for 3.3v arduino use 3.3
 //float voltage = reading * 5.0;
 float voltage = reading * 5.0; //RSC battery is closer to 4
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
 
  int lightLevel = analogRead(pinOther);    
  int newLightLevel = map(lightLevel, 0, 1000, 0, 100);
  newLightLevel = constrain(newLightLevel, 0, 100); 
  

  String converted = dtostrf(temperatureC, 5, 5, new char[11]);
                
  String tempValue = "{ \"Station\": \"" + stationName + "\", " + 
                        "\"Sensor\": \"" + temperatureName + "\", " +
                        "\"Value\": \"" + converted + "\"} ";

                        
  String otherValue = "{ \"Station\": \"" + stationName + "\", " + 
                        "\"Sensor\": \"" + otherName + "\", " +
                        "\"Value\": \"" + ((String)newLightLevel) + "\"} ";



  int soundLevel = analogRead(pinSound);     
    
  for (int i = 0; i < 50; i++) {
     int testLevel = analogRead(pinSound);
     if (testLevel > soundLevel) {
        soundLevel = testLevel;
     }
    delay(1);
  } 
  
  int newLevel = map(soundLevel, 300, 800, 0, 100);
  newLevel = constrain(newLevel, 0, 100);
                        
  String soundValue = "{ \"Station\": \"" + stationName + "\", " + 
                        "\"Sensor\": \"" + soundName + "\", " +
                        "\"Value\": \"" + ((String)newLevel) + "\"} ";

  Serial.println( tempValue);
  delay(200);
  Serial.println( otherValue );
  delay(200);
  Serial.println( soundValue );


  delay(stationFrequency); 


}


