FROM golang:1.27.3@sha256:957861185dbf29d93668ace41e011d091c6e779953d47f0316ef2cc58e28fe2b AS builder
WORKDIR /app

ARG CGO_ENABLED=0

COPY go.mod go.sum ./
RUN go mod download

COPY ./cmd ./cmd

RUN go build -o ./build/main ./cmd/...

# ---

FROM ghcr.io/markormesher/scratch:v0.4.28@sha256:4741727f246543706664e27cae7e5cf42ed3184ede63f14201713e5628b11dfd
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
