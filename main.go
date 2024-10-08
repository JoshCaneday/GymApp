package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"time"

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

type RequestNewExercise struct {
	Profile_ID string `json:"profile_ID"`
	Exercise   string `json:"exercise"`
	Metric     string `json:"metric"`
	Amount     string `json:"amount"`
	Reps       string `json:"reps"`
	Sets       string `json:"sets"`
}

type RequestExerciseLogs struct {
	Profile_ID string `json:"profile_ID"`
	Limit      string `json:"limit"`
}

type RequestMoreExerciseLogs struct {
	Profile_ID string `json:"profile_ID"`
	Offset     string `json:"offset"`
}

type RemoveData struct {
	Profile_ID string `json:"profile_ID"`
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

func getNumExerciseLogsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	var data RemoveData // Reusing the RemoveData struct because it has exactly what is needed to perform same action
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	rows, err2 := db.Query(`SELECT COUNT(*) FROM profile p INNER JOIN log l on p.profile_id = l.profile_id
						INNER JOIN exercise_log e on e.log_id = l.log_id WHERE p.profile_id = $1;`, data.Profile_ID)
	if err2 != nil {
		http.Error(w, err2.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var info string
	if rows.Next() {
		rows.Scan(&info)
	} else {
		info = "-1"
	}
	rows2, err3 := db.Query(`SELECT COUNT(*) FROM profile p INNER JOIN log l on p.profile_id = l.profile_id
						INNER JOIN exercise_log e on e.log_id = l.log_id WHERE p.profile_id = $1;`, data.Profile_ID)
	if err3 != nil {
		http.Error(w, err3.Error(), http.StatusInternalServerError)
		return
	}
	defer rows2.Close()
	var info2 string
	if rows2.Next() {
		rows2.Scan(&info2)
	} else {
		info2 = "-1"
	}

	rows5, _ := db.Query(`
    SELECT e.label, MAX(e.weight) FROM profile p INNER JOIN log l on p.profile_id = l.profile_id
	INNER JOIN exercise_log e ON e.log_id = l.log_id WHERE p.profile_id = $1 GROUP BY e.label;
	`, data.Profile_ID)

	defer rows5.Close()
	// TODO attach the latest query results to ans and change the js and html files to accomodate the extra info
	var ans = []string{info, info2}
	response := map[string][]string{"info": ans}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func logExerciseHandler(w http.ResponseWriter, r *http.Request) {
	// Not to be confused with exerciseLogHandler which just switches to the page for all things exercise logs
	days := map[time.Weekday]string{1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday", 0: "Sunday"}
	currentTime := time.Now()
	date := currentTime.Format("2006-01-02")
	day := currentTime.Weekday()
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	var data RequestNewExercise
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	rows, err := db.Query("SELECT l.log_id FROM profile p INNER JOIN log l ON p.profile_id = l.profile_id WHERE l.date = $1;", date)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	if rows.Next() {
		// add to already made log
		var check string
		rows.Scan(&check)
		_, err := db.Exec("INSERT INTO exercise_log(log_id, label, weight, metric, reps, sets) VALUES ($1, $2, $3, $4, $5, $6);", check,
			data.Exercise, data.Amount, data.Metric, data.Reps, data.Sets)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		// Create a new log and return its ID immediately
		var logID int
		err := db.QueryRow("INSERT INTO log(date, day, log_type, profile_id) VALUES ($1, $2, 'exercise', $3) RETURNING log_id;", date, days[day], data.Profile_ID).Scan(&logID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		fmt.Println(logID)

		// Insert into exercise_log using the retrieved log_id
		_, err2 := db.Exec("INSERT INTO exercise_log(log_id, label, weight, metric, reps, sets) VALUES ($1, $2, $3, $4, $5, $6);", logID,
			data.Exercise, data.Amount, data.Metric, data.Reps, data.Sets)
		if err2 != nil {
			http.Error(w, err2.Error(), http.StatusInternalServerError)
			return
		}
		fmt.Println("Here")
	}

	response := map[string]string{"info": date}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

}

func getExerciseLogsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	var data RequestExerciseLogs
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	rows, err := db.Query(`
    SELECT l.date, l.day, e.label, e.weight, e.metric, e.reps, e.sets, e.exercise_id
    FROM profile p
    INNER JOIN log l ON p.profile_id = l.profile_id
    INNER JOIN exercise_log e ON e.log_id = l.log_id
    WHERE p.profile_id = $1
	ORDER BY e.exercise_id DESC
	LIMIT $2;
	`, data.Profile_ID, data.Limit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var info [][]string
	for rows.Next() {
		var date, day, label, metric, weight, reps, sets, returnid string

		// Scan the row's columns into variables
		err := rows.Scan(&date, &day, &label, &weight, &metric, &reps, &sets, &returnid)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		info = append(info, []string{date, day, label, weight, metric, reps, sets, returnid})
	}
	response := map[string][][]string{"info": info}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func getMoreExerciseLogsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	var data RequestMoreExerciseLogs
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	rows, err := db.Query(`
    SELECT l.date, l.day, e.label, e.weight, e.metric, e.reps, e.sets
    FROM profile p
    INNER JOIN log l ON p.profile_id = l.profile_id
    INNER JOIN exercise_log e ON e.log_id = l.log_id
    WHERE p.profile_id = $1
	ORDER BY e.exercise_id DESC
	LIMIT 11
	OFFSET $2;
	`, data.Profile_ID, data.Offset)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var info [][]string
	for rows.Next() {
		var date, day, label, metric, weight, reps, sets string

		// Scan the row's columns into variables
		err := rows.Scan(&date, &day, &label, &weight, &metric, &reps, &sets)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		info = append(info, []string{date, day, label, weight, metric, reps, sets})
	}
	response := map[string][][]string{"info": info}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func deleteExerciseLogHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	var data RemoveData
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	_, err2 := db.Exec("DELETE FROM exercise_log WHERE exercise_id = $1;", data.Profile_ID)
	if err2 != nil {
		http.Error(w, err2.Error(), http.StatusInternalServerError)
		return
	}

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
	http.HandleFunc("/exercise_log", exerciseLogHandler)
	http.HandleFunc("/measurement_log", measurementLogHandler)
	http.HandleFunc("/api/getNumExerciseLogs", getNumExerciseLogsHandler)
	http.HandleFunc("/api/logExercise", logExerciseHandler)
	http.HandleFunc("/api/getExerciseLogs", getExerciseLogsHandler)
	http.HandleFunc("/api/getMoreExerciseLogs", getMoreExerciseLogsHandler)
	http.HandleFunc("/api/deleteExerciseLog", deleteExerciseLogHandler)
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
