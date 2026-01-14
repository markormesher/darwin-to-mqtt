FROM golang:1.25.5@sha256:0f406d34b7cb7255d0700af02ec28a2c88f1e00701055f4c282aa4c3ec0b3245 AS builder
WORKDIR /app

ARG CGO_ENABLED=0

COPY go.mod go.sum ./
RUN go mod download

COPY ./cmd ./cmd

RUN go build -o ./build/main ./cmd/...

# ---

FROM ghcr.io/markormesher/scratch:v0.4.10@sha256:50e90f252c2c5282a4e4895274089ce3b349fb10e77a517fd05721ca4ae1bbe2
WORKDIR /app

LABEL image.registry=ghcr.io
LABEL image.name=markormesher/darwin-to-mqtt

COPY --from=builder /app/build/main /usr/local/bin/darwin-to-mqtt

CMD ["/usr/local/bin/darwin-to-mqtt"]
