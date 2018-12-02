# Iot-Hub Bridge

The Iot Hub theoretically can be bridged to any mqtt broker but unfortunately, there are a lot of problems with products like Mosquitto 1.4.10 (officially supported by Raspbian Stretch). This little project solves the problem by manually reflecting Mosquitto messages on the Iot Hub device.

## Usage example

``` bash
node index.js "SharedAccessSignature sr=<iot hub device sas>." mqtt://<mosquitto ip>
```

