FROM golang:1.22.3@sha256:f43c6f049f04cbbaeb28f0aad3eea15274a7d0a7899a617d0037aec48d7ab010 as builder
WORKDIR /app

COPY go.mod go.sum ./
COPY ./cmd ./cmd

RUN go build -o ./build/main ./cmd/*.go

# ---

FROM gcr.io/distroless/base-debian12@sha256:1aae189e3baecbb4044c648d356ddb75025b2ba8d14cdc9c2a19ba784c90bfb9
WORKDIR /app

COPY --from=builder /app/build /app/build

CMD ["/app/build/main"]
