FROM golang:1.22.3@sha256:f43c6f049f04cbbaeb28f0aad3eea15274a7d0a7899a617d0037aec48d7ab010 as builder
WORKDIR /app

COPY go.mod go.sum ./
COPY ./cmd ./cmd

RUN go build -o ./build/main ./cmd/*.go

# ---

FROM gcr.io/distroless/base-debian12@sha256:88e0a2ac7c9b54f1ef941e7978c21fd45b46cc6e768f4bc28f3618a51438dc5d
WORKDIR /app

COPY --from=builder /app/build /app/build

CMD ["/app/build/main"]
