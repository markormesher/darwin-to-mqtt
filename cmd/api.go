package main

import (
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"time"
)

type ApiResponse struct {
	TrainServices []RawTrainService `json:"trainServices"`
	LocationName  string            `json:"locationName"`
}

type RawTrainService struct {
	ServiceId              string `json:"serviceID"`
	ScheduledDepartureTime string `json:"std"`
	ExpectedDepartureTime  string `json:"etd"`
	Cancelled              bool   `json:"isCancelled"`
	Platform               string `json:"platform"`
	Operator               string `json:"operator"`
	OperatorCode           string `json:"operatorCode"`

	Origin []struct {
		Crs  string `json:"crs"`
		Name string `json:"locationName"`
	} `json:"origin"`

	Destination []struct {
		Crs  string `json:"crs"`
		Name string `json:"locationName"`
	} `json:"destination"`

	SubsequentCallingPoints []struct {
		CallingPoints []struct {
			Crs           string `json:"crs"`
			Name          string `json:"locationName"`
			ScheduledTime string `json:"st"`
			ExpectedTime  string `json:"et"`
		} `json:"callingPoint"`
	} `json:"subsequentCallingPoints"`
}

type CallingPoint struct {
	Crs           string
	Name          string
	ScheduledTime string
	ExpectedTime  string
	OnTime        bool
}

type TrainService struct {
	ServiceId              string
	Crs                    string
	Name                   string
	ScheduledDepartureTime string
	ExpectedDepartureTime  string
	OnTime                 bool
	Cancelled              bool
	Platform               string
	Operator               string
	OperatorCode           string
	Origin                 CallingPoint
	Destination            CallingPoint
	CallingPoints          []CallingPoint
}

var baseUrl = "https://api1.raildata.org.uk/1010-live-departure-board-dep/LDBWS/api/20220120/GetDepBoardWithDetails"

func getDepartures(settings *Settings, fetchAfter string) ([]TrainService, error) {
	var fetchAfterHour, fetchAfterMinute int
	_, err := fmt.Sscanf(fetchAfter, "%02d:%02d", &fetchAfterHour, &fetchAfterMinute)
	if err != nil {
		return nil, fmt.Errorf("Failed to parse fetch-after time: %w", err)
	}

	now := time.Now()
	fetchAfterTime := time.Date(now.Year(), now.Month(), now.Day(), fetchAfterHour, fetchAfterMinute, now.Second(), now.Nanosecond(), now.Location())

	if fetchAfterTime.Compare(now) < 0 {
		// we've wrapped around to tomorrow, so return empty to end the looping
		return []TrainService{}, nil
	}

	offsetMinutes := math.Floor(fetchAfterTime.Sub(now).Minutes())
	l.Info("Fetching journeys with offset", "fetchAfter", fetchAfter, "offsetMinutes", offsetMinutes)

	url := fmt.Sprintf("%s/%s?timeOffset=%d", baseUrl, settings.DepartureStation, int(offsetMinutes))
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("x-apikey", settings.ApiToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("Failed to fetch departures: %w", err)
	}

	resBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("Failed to read API response: %w", err)
	}

	var rawData ApiResponse
	err = json.Unmarshal(resBytes, &rawData)
	if err != nil {
		return nil, fmt.Errorf("Failed to unmarshal API response: %w", err)
	}

	result := make([]TrainService, 0)
	for _, rawService := range rawData.TrainServices {
		service := TrainService{
			ServiceId:              rawService.ServiceId,
			Crs:                    settings.DepartureStation,
			Name:                   rawData.LocationName,
			ScheduledDepartureTime: rawService.ScheduledDepartureTime,
			Cancelled:              rawService.Cancelled,
			Platform:               rawService.Platform,
			Operator:               rawService.Operator,
			OperatorCode:           rawService.OperatorCode,
			Origin: CallingPoint{
				Crs:  rawService.Origin[0].Crs,
				Name: rawService.Origin[0].Name,
			},
			Destination: CallingPoint{
				Crs:  rawService.Destination[0].Crs,
				Name: rawService.Destination[0].Name,
			},
			CallingPoints: make([]CallingPoint, 0),
		}

		if rawService.ExpectedDepartureTime == "On time" {
			service.ExpectedDepartureTime = service.ScheduledDepartureTime
			service.OnTime = true
		} else {
			service.ExpectedDepartureTime = rawService.ExpectedDepartureTime
			service.OnTime = false
		}

		for _, rawCp := range rawService.SubsequentCallingPoints[0].CallingPoints {
			cp := CallingPoint{
				Crs:           rawCp.Crs,
				Name:          rawCp.Name,
				ScheduledTime: rawCp.ScheduledTime,
			}

			if rawCp.ExpectedTime == "On time" {
				cp.ExpectedTime = cp.ScheduledTime
				cp.OnTime = true
			} else {
				cp.ExpectedTime = rawCp.ExpectedTime
				cp.OnTime = false
			}

			service.CallingPoints = append(service.CallingPoints, cp)
		}

		result = append(result, service)
	}

	return result, nil
}
