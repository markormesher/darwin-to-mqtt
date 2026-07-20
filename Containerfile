FROM golang:1.26.5@sha256:3aff6657219a4d9c14e27fb1d8976c49c29fddb70ba835014f477e1c70636647 AS builder
WORKDIR /app

ARG CGO_ENABLED=0

COPY go.mod go.sum ./
RUN go mod download

COPY ./cmd ./cmd

RUN go build -o ./build/main ./cmd/...

# ---

FROM ghcr.io/markormesher/scratch:v0.4.24@sha256:82cfb48166d3129439d10e8f10b79063209ae16cd54de131b6c87173f8eea758
WORKDIR /app

COPY --from=builder /app/build/main /usr/local/bin/darwin-to-mqtt

CMD ["/usr/local/bin/darwin-to-mqtt"]

LABEL image.name=markormesher/darwin-to-mqtt
LABEL image.registry=ghcr.io
LABEL org.opencontainers.image.description=""
LABEL org.opencontainers.image.documentation=""
LABEL org.opencontainers.image.title="darwin-to-mqtt"
LABEL org.opencontainers.image.url=""
LABEL org.opencontainers.image.vendor=""
LABEL org.opencontainers.image.version=""
