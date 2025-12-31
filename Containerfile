FROM golang:1.25.5@sha256:31c1e53dfc1cc2d269deec9c83f58729fa3c53dc9a576f6426109d1e319e9e9a AS builder
WORKDIR /app

ARG CGO_ENABLED=0

COPY go.mod go.sum ./
RUN go mod download

COPY ./cmd ./cmd

RUN go build -o ./build/main ./cmd/...

# ---

FROM ghcr.io/markormesher/scratch:v0.4.9@sha256:768793be24576cc7d764a9f0dae447654c7a860be41309de9f2f7855b1af24b7
WORKDIR /app

LABEL image.registry=ghcr.io
LABEL image.name=markormesher/darwin-to-mqtt

COPY --from=builder /app/build/main /usr/local/bin/darwin-to-mqtt

CMD ["/usr/local/bin/darwin-to-mqtt"]
