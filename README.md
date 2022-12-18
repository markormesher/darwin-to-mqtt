![CircleCI](https://img.shields.io/circleci/build/github/markormesher/darwin-to-mqtt)

# darwin-to-mqtt

A simple utility to query the UK National Rail [Darwin API](https://www.nationalrail.co.uk/100296.aspx) for departures from your local station and post the results to an MQTT server. Queries are executed via [@mattsalt](https://github.com/mattsalt)'s [national-rail-darwin](https://github.com/mattsalt/national-rail-darwin) library, which does all the hard work here.

:rocket: Jump to [quick-start example](#quick-start-docker-compose-example).

:whale: See releases on [ghcr.io](https://ghcr.io/markormesher/darwin-to-mqtt).

## Configuration via Environment Variables

All arguments are required if they do not have a default value listed below. 3-letter station codes can be found by searching on National Rail's [journey planner](https://www.nationalrail.co.uk).

- `DARWIN_TOKEN` - your Darwin API token, which you can sign up for [here](http://realtime.nationalrail.co.uk/OpenLDBWSRegistration).
- `MQTT_HOST` - must include the `mqtt://...` prefix and any non-default port number.
- `TOPIC_PREFIX` - MQTT topic prefix, defaults to `darwin/state`.
- `LOCAL_STATION` - 3-letter station code for your local station, which the tool will show departures from.
- `DEST_STATIONS` - comma-separated list of 3-letter station codes to show journeys for.
- `ROWS_TO_PUBLISH` - maximum number of journeys to publish, defaults to 5.
- `REFRESH_INTERVAL_MS` - how often to update the data, defaults to 60,000 (1 minute), which is also the minimum allowed value.
- `HEALTH_CHECK_SERVER_PORT` - HTTP port to provide a health check endpoint on, defaults to 8080.

## MQTT Topics and Messages

### System Information

```
${prefix}/availability = "online" or "offline", retained as birth/last will message
${prefix}/last_seen = ISO datetime string of the last time journeys were published
```

### Per Journey

Note: `rowNum` starts at 1.

```
${prefix}/journey_${rowNum}/departure_station = always the local 3-letter station code
${prefix}/journey_${rowNum}/departure_time_scheduled = hh:mm time
${prefix}/journey_${rowNum}/departure_time_actual = hh:mm time or "Cancelled"
${prefix}/journey_${rowNum}/departure_on_time = "true" or "false"
${prefix}/journey_${rowNum}/arrival_station = 3-letter arrival station code
${prefix}/journey_${rowNum}/arrival_time_scheduled = hh:mm time
${prefix}/journey_${rowNum}/arrival_time_actual = hh:mm time or "Cancelled"
${prefix}/journey_${rowNum}/arrival_on_time = "true" or "false"
```

## Quick-Start Docker-Compose Example

This example would report departures from Barnehurst (BNH) to Charing Cross (CHX), Victoria (VIC) or Cannon Street (CST).

```yaml
version: "3.8"

services:
  darwin-to-mqtt:
    image: ghcr.io/markormesher/darwin-to-mqtt:VERSION
    environment:
      - DARWIN_TOKEN=abc
      - MQTT_HOST=mqtt://your-mqtt-host
      - TOPIC_PREFIX=darwin/state
      - LOCAL_STATION=BNH
      - DEST_STATIONS=CHX,VIC,CST
      - ROWS_TO_PUBLISH=5
```

## Health Check

Unless disabled by setting the environment variable `HEALTH_CHECK_SERVER_PORT` to `-1`, a basic health check endpoint is available at `/health` on the port specified. If a successful update as run in the last `2 * REFRESH_INTERVAL_MS` it will return 200, otherwise 500.
