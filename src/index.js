const Darwin = require("national-rail-darwin");
const mqtt = require("mqtt");
const darwin = new Darwin();

const MQTT_HOST = process.env.MQTT_HOST;
const TOPIC_PREFIX = process.env.TOPIC_PREFIX || "darwin/state";
const LOCAL_STATION = process.env.LOCAL_STATION;
const DEST_STATIONS = process.env.DEST_STATIONS.split(",");
const ROWS_TO_PUBLISH = parseInt(process.env.ROWS_TO_PUBLISH || "5");

const availabilityTopic = `${TOPIC_PREFIX}/availability`;

const mqttClient = mqtt.connect(MQTT_HOST, {
  will: {
    topic: availabilityTopic,
    payload: "offline",
    qos: 0,
    retain: true,
  },
});
mqttClient.on("connect", () => {
  console.log("MQTT connected");
  mqttClient.publish(availabilityTopic, "online", { retain: true });
});
mqttClient.on("disconnect", () => {
  console.log("MQTT disconnected");
  mqttClient.publish(availabilityTopic, "offline", { retain: true });
});
mqttClient.on("reconnect", () => console.log("MQTT reconnecting"));
mqttClient.on("offline", () => console.log("MQTT server offline"));
mqttClient.on("error", (error) => logger.error("MQTT error", { error }));

function mqttPublish(topic, message) {
  if (!mqttClient.connected) {
    console.log("Attempted to publish MQTT message without a connection", { topic });
  }

  mqttClient.publish(topic, message, {}, (error) => {
    if (error) {
      console.log("MQTT publish failed", { error });
    }
  });
}

function updateDepartures() {
  darwin.getDepartureBoardWithDetails(LOCAL_STATION, {}, (err, data) => {
    if (err) {
      console.log("Error getting departures", err);
      mqttPublish(availabilityTopic, "offline");
      return;
    }

    const departures = data["trainServices"];
    let rowNum = 0;
    for (const departure of departures) {
      const destination = departure["destination"]["crs"];
      if (DEST_STATIONS.indexOf(destination) < 0) {
        continue;
      }

      ++rowNum;
      if (rowNum > ROWS_TO_PUBLISH) {
        break;
      }

      const scheduledDepartureTime = departure["std"];
      const expectedDepartureTime = departure["etd"];
      const departureOnTime = expectedDepartureTime == "On time";
      const departureTime = departureOnTime ? scheduledDepartureTime : expectedDepartureTime;

      const arrivalStop = departure["subsequentCallingPoints"][departure["subsequentCallingPoints"].length - 1];
      const scheduledArrivalTime = arrivalStop["st"];
      const expectedArrivalTime = arrivalStop["et"];
      const arrivalOnTime = expectedArrivalTime == "On time";
      const arrivalTime = arrivalOnTime ? scheduledArrivalTime : expectedArrivalTime;

      mqttPublish(`${TOPIC_PREFIX}/journey_${rowNum}/departure_station`, LOCAL_STATION);
      mqttPublish(`${TOPIC_PREFIX}/journey_${rowNum}/departure_time_scheduled`, scheduledDepartureTime);
      mqttPublish(`${TOPIC_PREFIX}/journey_${rowNum}/departure_time_actual`, departureTime);
      mqttPublish(`${TOPIC_PREFIX}/journey_${rowNum}/departure_on_time`, departureOnTime + "");
      mqttPublish(`${TOPIC_PREFIX}/journey_${rowNum}/arrival_station`, destination);
      mqttPublish(`${TOPIC_PREFIX}/journey_${rowNum}/arrival_time_scheduled`, scheduledArrivalTime);
      mqttPublish(`${TOPIC_PREFIX}/journey_${rowNum}/arrival_time_actual`, arrivalTime);
      mqttPublish(`${TOPIC_PREFIX}/journey_${rowNum}/arrival_on_time`, arrivalOnTime + "");
    }

    mqttPublish(`${TOPIC_PREFIX}/last_seen`, new Date().toISOString());
    console.log(`Published journeys at ${new Date().toISOString()}`);
  });
}

updateDepartures();
setInterval(updateDepartures, 60 * 1000);
