package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Settings struct {
	MqttConnectionString string
	MqttTopicPrefix      string
	UpdateInterval       int
	MaxPublishQuantity   int
	ApiToken             string
	DepartureStation     string
	ArrivalStations      []string
}

func getSettings() (*Settings, error) {
	mqttConnectionString := os.Getenv("MQTT_CONNECTION_STRING")
	if len(mqttConnectionString) == 0 {
		mqttConnectionString = "tcp://0.0.0.0:1883"
	}

	mqttTopicPrefix := strings.TrimRight(os.Getenv("MQTT_TOPIC_PREFIX"), "/")
	if len(mqttTopicPrefix) == 0 {
		mqttTopicPrefix = "darwin"
	}

	updateIntervalStr := os.Getenv("UPDATE_INTERVAL")
	if len(updateIntervalStr) == 0 {
		updateIntervalStr = "0"
	}
	updateInterval, err := strconv.Atoi(updateIntervalStr)
	if err != nil {
		return nil, fmt.Errorf("could not parse update interval as an integer: %w", err)
	}

	maxPublishQuantityStr := os.Getenv("MAX_PUBLISH_QUANTITY")
	if len(maxPublishQuantityStr) == 0 {
		maxPublishQuantityStr = "5"
	}
	maxPublishQuantity, err := strconv.Atoi(maxPublishQuantityStr)
	if err != nil {
		return nil, fmt.Errorf("could not parse max publish quantity as an integer: %w", err)
	}

	apiToken := os.Getenv("API_TOKEN")

	departureStation := os.Getenv("DEPARTURE_STATION")

	arrivalStationsRaw := os.Getenv("ARRIVAL_STATIONS")
	arrivalStations := strings.Split(arrivalStationsRaw, ";")

	return &Settings{
		MqttConnectionString: mqttConnectionString,
		MqttTopicPrefix:      mqttTopicPrefix,
		UpdateInterval:       updateInterval,
		MaxPublishQuantity:   maxPublishQuantity,
		ApiToken:             apiToken,
		DepartureStation:     departureStation,
		ArrivalStations:      arrivalStations,
	}, nil
}
