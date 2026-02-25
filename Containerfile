FROM golang:1.26.0@sha256:9edf71320ef8a791c4c33ec79f90496d641f306a91fb112d3d060d5c1cee4e20 AS builder
WORKDIR /app

ARG CGO_ENABLED=0

COPY go.mod go.sum ./
RUN go mod download

COPY ./cmd ./cmd

RUN go build -o ./build/main ./cmd/...

# ---

FROM ghcr.io/markormesher/scratch:v0.4.14@sha256:6212e9b38cc40ad4520f39a4043ac3f7bd12438449356311b4fa327cabce7db0
WORKDIR /app

COPY --from=builder /app/build/main /usr/local/bin/darwin-to-mqtt

CMD ["/usr/local/bin/darwin-to-mqtt"]

LABEL image.name=markormesher/darwin-to-mqtt
LABEL image.registry=ghcr.io
LABEL org.opencontainers.image.description=""
LABEL org.opencontainers.image.documentation=""
LABEL org.opencontainers.image.title="darwin-to-mqtt"
LABEL org.opencontainers.image.url="https://github.com/markormesher/darwin-to-mqtt"
LABEL org.opencontainers.image.vendor=""
LABEL org.opencontainers.image.version=""
