# Variables
DB_NAME := mydatabase.db
SCHEMA_FILE := database/schema.sql
SEED_FILE := database/seed.go

# Default target (run the application with fresh DB)
run: db-clean prepare-db
	@echo "Starting application..."
	go run main.go

# Prepare the DB: always create fresh
prepare-db:
	@echo "Creating fresh $(DB_NAME)..."
	@sqlite3 $(DB_NAME) < $(SCHEMA_FILE)
	@echo "Database schema initialized."

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
