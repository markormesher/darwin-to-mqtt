FROM golang:1.22.4@sha256:a66eda637829ce891e9cf61ff1ee0edf544e1f6c5b0e666c7310dce231a66f28 as builder
WORKDIR /app

COPY go.mod go.sum ./
COPY ./cmd ./cmd

RUN go build -o ./build/main ./cmd/*.go

# ---

FROM gcr.io/distroless/base-debian12@sha256:786007f631d22e8a1a5084c5b177352d9dcac24b1e8c815187750f70b24a9fc6
WORKDIR /app

COPY --from=builder /app/build /app/build

CMD ["/app/build/main"]
