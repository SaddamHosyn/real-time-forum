package main

import (
	"fmt"
	"log"
	"realtimeforum/database"
	"realtimeforum/model"
)

func main() {
	db, err := database.InitDatabase()
	if err != nil {
		log.Fatal("Database initialization failed:", err)
	}
	defer db.Close()

	model.DB = db
	fmt.Println("Connected and initialized DB!")
}
