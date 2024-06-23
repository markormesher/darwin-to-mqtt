package main

import (
	"fmt"
	"slices"
	"time"
)

type PublishedDeparture struct {
	ServiceId    string `json:"serviceId"`
	Cancelled    bool   `json:"cancelled"`
	Platform     string `json:"platform"`
	Operator     string `json:"operator"`
	OperatorCode string `json:"operatorCode"`

	OriginStationCrs  string `json:"originStationCrs"`
	OriginStationName string `json:"originStationName"`

	DestinationStationCrs  string `json:"destinationStationCrs"`
	DestinationStationName string `json:"destinationStationName"`

	DepartureStationCrs    string `json:"departureStationCrs"`
	DepartureStationName   string `json:"departureStationName"`
	DepartureTimeScheduled string `json:"departureTimeScheduled"`
	DepartureTimeExpected  string `json:"departureTimeExpected"`
	DepartureOnTime        bool   `json:"departureOnTime"`

	ArrivalStationCrs    string `json:"arrivalStationCrs"`
	ArrivalStationName   string `json:"arrivalStationName"`
	ArrivalTimeScheduled string `json:"arrivalTimeScheduled"`
	ArrivalTimeExpected  string `json:"arrivalTimeExpected"`
	ArrivalOnTime        bool   `json:"arrivalOnTime"`
}

func doUpdate(settings *Settings) {
	mqttClient, err := setupMqttClient(*settings)
	if err != nil {
		l.Error("Failed to setup MQTT client")
		panic(err)
	}

	publishedDepartures := make([]PublishedDeparture, 0)

	// we can only get 10 events at a time (numRows ignores values over 10)
	// so, we fetch them in a loop with an increasing offset until we get as many as we need, or we hit the end of the day
	fetchAfter := time.Now().Format("15:04")
	loopCount := 0
	for {
		loopCount++

		services, err := getDepartures(settings, fetchAfter)
		if err != nil {
			l.Error("Failed to get train services")
			panic(err)
		}

		for _, service := range services {
			var matchedCallingPoint *CallingPoint
			for _, cp := range service.CallingPoints {
				if slices.Contains(settings.ArrivalStations, cp.Crs) {
					matchedCallingPoint = &cp
					break
				}
			}

			if matchedCallingPoint != nil {
				publishedDeparture := PublishedDeparture{
					ServiceId:              service.ServiceId,
					Cancelled:              service.Cancelled,
					Platform:               service.Platform,
					Operator:               service.Operator,
					OperatorCode:           service.OperatorCode,
					OriginStationCrs:       service.Origin.Crs,
					OriginStationName:      service.Origin.Name,
					DestinationStationCrs:  service.Destination.Crs,
					DestinationStationName: service.Destination.Name,
					DepartureStationCrs:    service.Crs,
					DepartureStationName:   service.Name,
					DepartureTimeScheduled: service.ScheduledDepartureTime,
					DepartureTimeExpected:  service.ExpectedDepartureTime,
					DepartureOnTime:        service.OnTime,
					ArrivalStationCrs:      matchedCallingPoint.Crs,
					ArrivalStationName:     matchedCallingPoint.Name,
					ArrivalTimeScheduled:   matchedCallingPoint.ScheduledTime,
					ArrivalTimeExpected:    matchedCallingPoint.ExpectedTime,
					ArrivalOnTime:          matchedCallingPoint.OnTime,
				}

				publishedDepartures = append(publishedDepartures, publishedDeparture)
			}
		}

		if len(publishedDepartures) >= settings.MaxPublishQuantity || len(services) < 10 || loopCount > 20 {
			break
		} else {
			fetchAfter = services[len(services)-1].ScheduledDepartureTime

			// avoid hammering the API
			time.Sleep(2 * time.Second)
		}
	}

	mqttClient.publish("_meta/last_seen", time.Now().Format(time.RFC3339))
	for i := 1; i <= settings.MaxPublishQuantity; i++ {
		topic := fmt.Sprintf("state/journey_%d", i)
		if i <= len(publishedDepartures) {
			mqttClient.publish(topic, publishedDepartures[i-1])
		} else {
			mqttClient.publish(topic, "")
		}
	}
}

func main() {
	settings, err := getSettings()
	if err != nil {
		l.Error("Failed to get settings")
		panic(err)
	}

	if settings.UpdateInterval <= 0 {
		l.Info("Running once then exiting because update interval is <= 0")
		doUpdate(settings)
	} else {
		l.Info("Running forever", "interval", settings.UpdateInterval)
		for {
			doUpdate(settings)
			time.Sleep(time.Duration(settings.UpdateInterval * int(time.Second)))
		}
	}
}
