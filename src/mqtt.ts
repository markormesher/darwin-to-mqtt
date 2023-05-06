import * as mqtt from "mqtt";

const TOPIC_PREFIX = process.env.TOPIC_PREFIX || "darwin/state";
const MQTT_HOST = process.env.MQTT_HOST;

const statusTopic = `${TOPIC_PREFIX}/status`;

const mqttClient = mqtt.connect(MQTT_HOST, {
  reconnectPeriod: 30_000,
  will: {
    topic: statusTopic,
    payload: "offline",
    qos: 0,
    retain: true,
  },
});
mqttClient.on("connect", () => {
  console.log("MQTT connected");
  mqttClient.publish(statusTopic, "online", { retain: true });
});
mqttClient.on("disconnect", () => {
  console.log("MQTT disconnected");
});
mqttClient.on("reconnect", () => console.log("MQTT reconnecting"));
mqttClient.on("offline", () => console.log("MQTT server offline"));
mqttClient.on("error", (error) => console.log("MQTT error", { error }));

function mqttPublish(topic: string, message: string): void {
  const prefixedTopic = TOPIC_PREFIX + (topic.startsWith("/") ? "" : "/") + topic;
  if (!mqttClient.connected) {
    console.log("Attempted to publish MQTT message without a connection", { prefixedTopic });
    return;
  }

  mqttClient.publish(prefixedTopic, message, {}, (error) => {
    if (error) {
      console.log("MQTT publish failed", { error });
    }
  });
}

export { mqttPublish };
