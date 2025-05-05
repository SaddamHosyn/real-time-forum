package main

import (
	"fmt"
	"log"
	"realtimeforum/database"
	"realtimeforum/server"
)

func main() {
	server.StartServer()
	db, err := database.InitDatabase()
	if err != nil {
		log.Fatal("Database initialization failed:", err)
	}
	defer db.Close()

	database.DB = db
	fmt.Println("Connected and initialized DB!")
	server.StartServer() 
}
