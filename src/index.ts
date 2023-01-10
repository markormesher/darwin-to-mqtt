import * as http from "http";
import { CallingPoint } from "./types/darwin-types";
import { mqttPublish } from "./mqtt";
import { getDepartureBoard, getServiceDetails } from "./darwin";

const LOCAL_STATION = process.env.LOCAL_STATION;
const DEST_STATIONS = process.env.DEST_STATIONS?.split(",") || [];
const ROWS_TO_PUBLISH = parseInt(process.env.ROWS_TO_PUBLISH) || 5;
const REFRESH_INTERVAL_MS = Math.max(parseInt(process.env.REFRESH_INTERVAL_MS) || 60000, 60000);
const HEALTH_CHECK_SERVER_PORT = parseInt(process.env.HEALTH_CHECK_SERVER_PORT) || 8080;

// health check
let lastSuccessMs = 0;
if (HEALTH_CHECK_SERVER_PORT > 0) {
  http
    .createServer((req, res) => {
      if (req.method == "GET" && req.url == "/health") {
        const nowMs = new Date().getTime();
        const sinceLastSuccessMs = nowMs - lastSuccessMs;
        if (sinceLastSuccessMs <= REFRESH_INTERVAL_MS * 2) {
          res.writeHead(200).end();
        } else {
          res.writeHead(500).end();
        }
      } else {
        res.writeHead(404).end();
      }
    })
    .listen(HEALTH_CHECK_SERVER_PORT);
}

async function updateDepartures() {
  try {
    const departures = await getDepartureBoard(LOCAL_STATION, { rows: 50 });
    console.log("Fetched " + departures.trainServices.length + " departures");

    let rowNum = 0;
    for (const service of departures.trainServices) {
      const details = (await getServiceDetails(service.serviceId)).serviceDetails;

      let arrivalStation: CallingPoint = null;
      for (const callingPoint of details.subsequentCallingPoints) {
        if (DEST_STATIONS.includes(callingPoint.crs)) {
          arrivalStation = callingPoint;
        }
      }

      if (!arrivalStation) {
        // this train doesn't call at anywhere we're going
        continue;
      }

      ++rowNum;
      if (rowNum > ROWS_TO_PUBLISH) {
        break;
      }

      const scheduledDepartureTime = service.std;
      const expectedDepartureTime = service.etd;
      const departureOnTime = expectedDepartureTime == "On time";
      const departureTime = departureOnTime ? scheduledDepartureTime : expectedDepartureTime;

      const scheduledArrivalTime = arrivalStation.st;
      const expectedArrivalTime = arrivalStation.et;
      const arrivalOnTime = expectedArrivalTime == "On time";
      const arrivalTime = arrivalOnTime ? scheduledArrivalTime : expectedArrivalTime;

      publishJourney(
        rowNum,
        arrivalStation.crs,
        scheduledDepartureTime,
        departureTime,
        departureOnTime,
        scheduledArrivalTime,
        arrivalTime,
        arrivalOnTime,
      );
    }

    // publish blank departures to "clean up" when fewer than ROWS_TO_PUBLISH remain
    for (let i = rowNum + 1; i <= ROWS_TO_PUBLISH; ++i) {
      publishJourney(i);
    }

    lastSuccessMs = new Date().getTime();
    mqttPublish("/last_seen", new Date().toISOString());
    console.log(`Published journeys at ${new Date().toISOString()}`);
  } catch (error) {
    console.log("Failed to update departures", { error });
  }
}

function publishJourney(
  rowNum: number,
  destination?: string,
  scheduledDepartureTime?: string,
  departureTime?: string,
  departureOnTime?: boolean,
  scheduledArrivalTime?: string,
  arrivalTime?: string,
  arrivalOnTime?: boolean,
) {
  mqttPublish(`/journey_${rowNum}/departure_station`, LOCAL_STATION);
  mqttPublish(`/journey_${rowNum}/departure_time_scheduled`, scheduledDepartureTime || "");
  mqttPublish(`/journey_${rowNum}/departure_time_actual`, departureTime || "");
  mqttPublish(
    `/journey_${rowNum}/departure_on_time`,
    departureOnTime === undefined || departureOnTime === null ? "" : "" + departureOnTime,
  );

  mqttPublish(`/journey_${rowNum}/arrival_station`, destination || "");
  mqttPublish(`/journey_${rowNum}/arrival_time_scheduled`, scheduledArrivalTime || "");
  mqttPublish(`/journey_${rowNum}/arrival_time_actual`, arrivalTime || "");
  mqttPublish(
    `/journey_${rowNum}/arrival_on_time`,
    arrivalOnTime === undefined || arrivalOnTime === null ? "" : "" + arrivalOnTime,
  );
}

updateDepartures();
setInterval(updateDepartures, REFRESH_INTERVAL_MS);
