# Variables
DB_NAME := mydatabase.db
SCHEMA_FILE := database/schema.sql
SEED_FILE := database/seed.go

# Default target (run with fresh database)
run: fresh-db
	@echo "Starting application with fresh database..."
	go run main.go

# Run with existing database (no cleanup)
run-existing:
	@echo "Starting application with existing database..."
	go run main.go

# Create fresh database (removes existing and creates new)
fresh-db: db-clean prepare-db
	@echo "Fresh database ready."

# Prepare the DB: create schema (assumes clean slate)
prepare-db:
	@echo "Creating new database $(DB_NAME)..."
	sqlite3 $(DB_NAME) < $(SCHEMA_FILE)
	@echo "Database schema initialized."

# Seed the database
db-seed: prepare-db
	@echo "Seeding database..."
	@go run $(SEED_FILE)

# Run with fresh database and seed data
run-seeded: fresh-db db-seed
	@echo "Starting application with fresh seeded database..."
	go run main.go

# Delete database
db-clean:
	@if [ -f $(DB_NAME) ]; then \
		echo "Removing existing database..."; \
		rm -f $(DB_NAME); \
	else \
		echo "No existing database to remove."; \
	fi

# Clean everything
clean: db-clean
	@echo "Clean completed."

# Legacy rebuild (same as run now)
rebuild: run

.PHONY: run run-existing fresh-db prepare-db db-seed run-seeded db-clean clean rebuild
