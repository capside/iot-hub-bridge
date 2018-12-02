'use strict';

const IotHubProtocol = require('azure-iot-device-mqtt').Mqtt;
const IotHubClient = require('azure-iot-device').Client;
const IotHubMessage = require('azure-iot-device').Message;

const mqtt = require('mqtt')

function onIotHubMessage(msg) {
  console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
};

function onIotHubStart(request, response) {
  console.log('Try to invoke method start(' + request.payload || '' + ')');

  response.send(200, 'Successully start sending message to cloud', function (err) {
    if (err) {
      console.error('[IoT hub Client] Failed sending a method response:\n' + err.message);
    }
  });
}

function ontIotHubStop(request, response) {
  console.log('Try to invoke method stop(' + request.payload || '' + ')')

  response.send(200, 'Successully stop sending message to cloud', function (err) {
    if (err) {
      console.error('[IoT hub Client] Failed sending a method response:\n' + err.message);
    }
  });
}

function iotHubInit(iotHubSAS) {
  console.log('Connecting to IoT Hub.');
  const iotHubClient = IotHubClient.fromSharedAccessSignature(iotHubSAS, IotHubProtocol);
  iotHubClient.open((err) => {
    if (err) {
      console.error('IoT hub client connect error: ' + err.message);
      return;
    }
    console.log('IoTHub connection successful.');
    iotHubClient.on('message', onIotHubMessage);
    iotHubClient.on('error', function (err) {
      console.error(err.message);
    });

    iotHubClient.on('disconnect', function () {
      clearInterval(sendInterval);
      iotHubClient.removeAllListeners();
      iotHubClient.open(connectCallback);
    });
    iotHubClient.onDeviceMethod('start', onIotHubStart);
    iotHubClient.onDeviceMethod('stop', ontIotHubStop);
  });
  return iotHubClient;
}

function mqttInit(mqttServer) {
  console.log('Connecting to mqtt broker.');
  const mqttClient  = mqtt.connect(mqttServer)
  mqttClient.on('connect', function () {
    console.log('Connection to mqtt broker succesful.');
    mqttClient.subscribe('#', function (err) {
      if (err) {
        console.error('Mqtt client connect error: ' + err.message);
      }
    })
  });
  
  mqttClient.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString())    
  });
  return mqttClient;
}

(function (iotHubSAS, mqttServer) {
  if (!mqttServer) {
    mqttServer = 'mqtt://localhost';
  }
  console.log(`Mqtt server: ${mqttServer}.`);
  iotHubSAS = iotHubSAS || process.env['AzureIoTHubDeviceSAS'];
  if (!iotHubSAS) {
    console.error('Please define AzureIoTHubDeviceSAS env var or pass it as first param.');
    return;
  }
  const iotHubClient = iotHubInit(iotHubSAS);
  const mqttClient = mqttInit(mqttServer);

  mqttClient.on('message', function (topic, message) {
    const iotHubMessage = new IotHubMessage(topic + ' ' + message);
    // iotHubMessage.properties.add('randomPropertyName',  'randomPropertyValue');      
    iotHubClient.sendEvent(iotHubMessage);
  });

})(process.argv[2], process.argv[3]);