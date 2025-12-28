![CircleCI](https://img.shields.io/circleci/build/github/markormesher/darwin-to-mqtt)

# Darwin to MQTT

⚠️ **Upgrading from 0.x?** 1.x is a complete re-write, so configuration, output format and the API token you need have all changed! See below for details of the new tool.

A simple utility to query the UK [Rail Data Marketplace](https://raildata.org.uk) for departures from your local station and post the results to an MQTT server.

## Configuration

Configuration is via environment variables:

- `MQTT_CONNECTION_STRING` - MQTT connection string, including protocol, host and port (default: `mqtt://0.0.0.0:1883`).
- `MQTT_TOPIC_PREFIX` - topix prefix (default: `darwin`).
- `UPDATE_INTERVAL` - interval in seconds for updates; if this is <= 0 then the program will run once and exit (default: `0`).
- `MAX_PUBLISH_QUANTITY` - maximum number of journeys that will be published (default: `5`).
  - The number of journeys published may be less than this, as the API only exposes journeys in the next two hours.
  - If fewer journey are available an empty string will be published to the remaining topics.
- `API_TOKEN` - client key from the Rail Data Marketplace (see [API Access](#api-access)).
- `DEPARTURE_STATION` - 3-letter CRS code for your local station; the tool will show departures from here.
- `ARRIVAL_STATIONS` - semicolon-separated list of 3-letter CRS codes that you want to see journeys towards.

3-letter station CRS codes can be found by searching on National Rail's [journey planner](https://www.nationalrail.co.uk). They must always be specified in upper-case.

## MQTT Topics

- `${prefix}/_meta/last_seen` - RFC3339 timestamp of when the program last ran.
- `${prefix}/state/journey_$i` - JSON representation of journey `i`, starting at 1 and going up to `$MAX_PUBLISH_QUANTITY`.
- `${prefix}/state/all_journeys` - As above, but with all journeys presented in a single JSON array.

Each journey takes the following form:

```jsonc
{
  "serviceId": "abcd1234",
  "cancelled": false,
  "platform": "1",
  "operator": "Full Operator Name",
  "operatorCode": "ABC",

  // origin: the first calling point of this service, which may be before $DEPARTURE_STATION
  "originStationCrs": "ABC",
  "originStationName": "Full Station Name",

  // destination: the final calling point of this service, which may be after any $ARRIVAL_STATIONS
  "destinationStationCrs": "ABC",
  "destinationStationName": "Full Station Name",

  // departure from your $DEPARTURE_STATION
  "departureStationCrs": "ABC",
  "departureStationName": "Full Station Name",
  "departureTimeScheduled": "hh:mm",
  "departureTimeExpected": "hh:mm",
  "departureOnTime": true,

  // arrival at the first of your $ARRIVAL_STATIONS that this service visits
  "arrivalStationCrs": "ABC",
  "arrivalStationName": "Full Station Name",
  "arrivalTimeScheduled": "hh:mm",
  "arrivalTimeExpected": "hh:mm",
  "arrivalOnTime": true
}
```

## API Access

Access to the [Rail Data Marketplace](https://raildata.org.uk) is free for the service that powers this tool. Follow these steps to get access:

1. Register for a new account on the marketplace and activate it. You only need "consumer" access, not "publisher".
1. Subscribe to the "Live Departure Board" service. It should be approved immediately.
1. From your subscriptions page, click through to the "Live Departure Board" service, select the "Specification" tab, and use the "Consumer key" as your `API_TOKEN`.

Note: there is an older National Rail API called Darwin - v0 of this tool used that API, hence the name.
