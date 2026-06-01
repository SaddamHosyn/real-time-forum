# ─── Stage 1: Builder ──────────────────────────────────────────────────────
FROM golang:1.20-alpine AS builder

# gcc & musl-dev required for CGO (SQLite uses cgo via mattn/go-sqlite3)
RUN apk add --no-cache gcc musl-dev

WORKDIR /app

# Copy dependency files first (layer cache optimization)
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source
COPY . .

# CGO_ENABLED=1 needed for SQLite; strip debug info to shrink binary
RUN CGO_ENABLED=1 GOOS=linux go build \
    -ldflags="-w -s" \
    -o main .

# ─── Stage 2: Runtime ──────────────────────────────────────────────────────
FROM alpine:3.18

# ca-certificates: HTTPS outbound calls
# tzdata: named timezone support
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/main .

# Copy static assets served directly by the Go server
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/index.html .

EXPOSE 8080

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["./main"]
