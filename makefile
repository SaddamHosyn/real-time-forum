# Variables
DB_NAME := mydatabase.db
SCHEMA_FILE := database/schema.sql
SEED_FILE := database/seed.go

# Run the application
run:
	go run main.go

# Prepare the DB: create and init if missing
prepare-db:
	@if [ ! -f $(DB_NAME) ]; then \
		echo "Database not found. Creating $(DB_NAME)..."; \
		sqlite3 $(DB_NAME) < $(SCHEMA_FILE); \
		echo "Database schema initialized."; \
	else \
		echo "$(DB_NAME) already exists. Skipping DB creation."; \
	fi

# Seed the database
db-seed:
	@if [ -f $(DB_NAME) ]; then \
		echo "Seeding database..."; \
		go run $(SEED_FILE); \
	else \
		echo "Database not found. Run 'make prepare-db' first."; \
	fi

# Delete database
db-clean:
	@echo "Removing database..."
	rm -f $(DB_NAME)
	@echo "Database removed."

# Clean (removed binary-related cleanup)
clean:
	@echo "Clean completed."

# Clean and rebuild (without binary)
rebuild: db-clean run

.PHONY: run prepare-db db-seed db-clean clean rebuild
