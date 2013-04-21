import os
import urllib
import urllib2
import json
import pprint
import serial 

# Grab credentials from the environment
consumer_key = os.getenv('CLIENT_ID')
consumer_secret = os.getenv('CLIENT_SECRET')
username = os.getenv('USERNAME')
password = os.getenv('PASSWORD')
login_server = os.getenv('LOGIN_SERVER')


print(os.environ)

print(consumer_key)
print(consumer_secret)
print(username)
print(password)
print(login_server)

#  
# Do OAuth username/password
token_url = login_server+'/services/oauth2/token'
 
params = urllib.urlencode({
  'grant_type': 'password',
  'client_id': consumer_key,
  'client_secret': consumer_secret,
  'username': username,
  'password': password
})

# print(token_url)
 
data = urllib2.urlopen(token_url, params).read()
oauth = json.loads(data)
pprint.pprint(oauth)

ser = serial.Serial('/dev/ttyAMA0',9600,timeout=5)

# http://docs.python.org/2/library/urllib2.html

headers = {
  'Authorization': 'OAuth '+oauth['access_token'],
  'Content-Type': 'application/json'
}

resource_url = oauth['instance_url']+'/services/apexrest/StationReading/'

for x in range (0,500):
  current = ser.readline() 
  print(current)
  try:
    jsonIt = json.loads(current)
    if(jsonIt['Station'] and jsonIt['Sensor'] and jsonIt['Value']):
      print('almost posting...')
      req = urllib2.Request(resource_url, current, headers)
      data = urllib2.urlopen(req).read()
      result = json.loads(data)
      print(result)
  except ValueError:
    print "Error parting to json:" + current

ser.close();
