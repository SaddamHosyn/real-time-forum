# Start from the official Go image
FROM golang:1.20-alpine

# Set working directory
WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the project files
COPY . .

# Build the Go app
RUN go build -o main .

# Expose the port your app runs on (change if needed)
EXPOSE 8080

# Run the app
CMD ["./main"]
