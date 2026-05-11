FROM golang:1.26.2@sha256:b54cbf583d390341599d7bcbc062425c081105cc5ef6d170ced98ef9d047c716 AS builder
WORKDIR /app

ARG CGO_ENABLED=0

COPY go.mod go.sum ./
RUN go mod download

COPY ./cmd ./cmd

RUN go build -o ./build/main ./cmd/...

# ---

FROM ghcr.io/markormesher/scratch:v0.4.18@sha256:7fd5a78c17ca05aeb31990b8854c21ccdda58517fee5d61ca1b8937aa2e1916f
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
