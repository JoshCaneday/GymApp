package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"

	_ "github.com/lib/pq"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "mE2X6kP6!@#$"
	dbname   = "gymapp"
)

var db *sql.DB

type RequestData struct {
	Username string `json:"user_name"`
	Password string `json:"pass_word"`
}

func renderTemplate(w http.ResponseWriter, tmpl string) {
	t, err := template.ParseFiles(tmpl)
	if err != nil {
		http.Error(w, "Error parsing template", http.StatusInternalServerError)
		return
	}
	t.Execute(w, nil)
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "templates/home.html")
}

func aboutHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "templates/about.html")
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "templates/login.html")
}

func tutorialHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "templates/tutorial.html")
}

func profileHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "templates/profile.html")
}

func exerciseLogHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "templates/exercise_log.html")
}

func measurementLogHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "templates/measurement_log.html")
}

func getInfoHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var data RequestData
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	rows, err := db.Query("SELECT profile_id FROM profile WHERE username = $1 AND password = $2;", data.Username, data.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var info string
	if rows.Next() {
		err := rows.Scan(&info)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		info = "No Data"
	}
	response := map[string]string{"info": info}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	// Serve static files from the "static" directory
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Route Handlers
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/about", aboutHandler)
	http.HandleFunc("/login", loginHandler)
	http.HandleFunc("/tutorial", tutorialHandler)
	http.HandleFunc("/profile", profileHandler)
	http.HandleFunc("/exercise_log", profileHandler)
	http.HandleFunc("/measurement_log", profileHandler)
	http.HandleFunc("/api/getInfo", getInfoHandler)

	// Make sure PostgreSQL connection is working
	var err2 error
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err2 = sql.Open("postgres", psqlInfo)
	if err2 != nil {
		log.Fatal("Error opening database: ", err2)
	}

	err2 = db.Ping()
	if err2 != nil {
		log.Fatal("Error connecting to database: ", err2)
	}
	fmt.Println("Successfully connected to PostgreSQL")

	// Start the server
	fmt.Println("Server started at http://localhost:8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Error starting the server:", err)
	}
}
