module github.com/markormesher/darwin-to-mqtt

go 1.24.3

require github.com/eclipse/paho.mqtt.golang v1.5.0

require (
	github.com/BurntSushi/toml v1.4.1-0.20240526193622-a339e1f7089c // indirect
	github.com/gorilla/websocket v1.5.3 // indirect
	github.com/kisielk/errcheck v1.9.0 // indirect
	golang.org/x/exp/typeparams v0.0.0-20231108232855-2478ac86f678 // indirect
	golang.org/x/mod v0.23.0 // indirect
	golang.org/x/net v0.35.0 // indirect
	golang.org/x/sync v0.11.0 // indirect
	golang.org/x/tools v0.30.0 // indirect
	honnef.co/go/tools v0.6.1 // indirect
)

tool (
	github.com/kisielk/errcheck
	honnef.co/go/tools/cmd/staticcheck
)
