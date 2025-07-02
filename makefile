# Variables
DB_NAME := mydatabase.db
SCHEMA_FILE := database/schema.sql
SEED_FILE := database/seed.go

# Default target (run the application with existing DB)
run:
	@echo "Starting application..."
	go run main.go

# Prepare the DB: create schema if needed (does NOT delete existing DB)
prepare-db:
	@echo "Preparing $(DB_NAME)..."
	@if [ ! -f $(DB_NAME) ]; then \
		echo "Creating new database..."; \
		sqlite3 $(DB_NAME) < $(SCHEMA_FILE); \
		echo "Database schema initialized."; \
	else \
		echo "Database already exists. Skipping schema creation."; \
	fi

# Seed the database
db-seed: prepare-db
	@echo "Seeding database..."
	@go run $(SEED_FILE)

# Delete database
db-clean:
	@if [ -f $(DB_NAME) ]; then \
		echo "Removing existing database..."; \
		rm -f $(DB_NAME); \
	fi

# Clean (removed binary-related cleanup)
clean: db-clean
	@echo "Clean completed."

# Rebuild (clean and run with fresh DB)
rebuild: clean run

.PHONY: run prepare-db db-seed db-clean clean rebuild
