FROM golang:1.25.3@sha256:bce1e7ec780444d85d041889e7a0e542b0be7b272a7f46a5fb947f0f484b9736 AS builder
WORKDIR /app

ARG CGO_ENABLED=0

COPY go.mod go.sum ./
RUN go mod download

COPY ./cmd ./cmd

RUN go build -o ./build/main ./cmd/...

# ---

FROM ghcr.io/markormesher/scratch:v0.4.3@sha256:d2489417468b5842c0c1aa461e8e3e636ac0b306794577501199bcbc59048e3a
WORKDIR /app

LABEL image.registry=ghcr.io
LABEL image.name=markormesher/darwin-to-mqtt

COPY --from=builder /app/build/main /usr/local/bin/darwin-to-mqtt

CMD ["/usr/local/bin/darwin-to-mqtt"]
