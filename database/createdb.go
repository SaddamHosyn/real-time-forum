package database

import (
    "database/sql"
    "fmt"
    "os"
    "strings"

    _ "github.com/mattn/go-sqlite3"
)

func RunSQLFromFile(db *sql.DB, filepath string) error {
    content, err := os.ReadFile(filepath)
    if err != nil {
        return fmt.Errorf("failed to read %s: %w", filepath, err)
    }

    queries := strings.Split(string(content), ";")
    for _, query := range queries {
        cleaned := strings.TrimSpace(query)
        if cleaned == "" {
            continue
        }
        _, err := db.Exec(cleaned)
        if err != nil {
            return fmt.Errorf("error executing query from %s: %s\nQuery: %s", filepath, err, cleaned)
        }
    }
    return nil
}

func InitDatabase() (*sql.DB, error) {
    db, err := sql.Open("sqlite3", "./mydatabase.db")
    if err != nil {
        return nil, fmt.Errorf("failed to open database: %w", err)
    }

    // Load schema
    if err := RunSQLFromFile(db, "./database/schema.sql"); err != nil {
        return nil, err
    }

    // Load seed data
    if err := RunSQLFromFile(db, "./database/seed.sql"); err != nil {
        return nil, err
    }

    fmt.Println("Database initialized successfully!")
    return db, nil
}
