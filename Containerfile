FROM golang:1.23.3@sha256:73f06be4578c9987ce560087e2e2ea6485fb605e3910542cadd8fa09fc5f3e31 as builder
WORKDIR /app

COPY go.mod go.sum ./
COPY ./cmd ./cmd

RUN go build -o ./build/main ./cmd/*.go

# ---

FROM gcr.io/distroless/base-debian12@sha256:7a4bffcb07307d97aa731b50cb6ab22a68a8314426f4e4428335939b5b1943a5
WORKDIR /app

COPY --from=builder /app/build /app/build

CMD ["/app/build/main"]
