package main

import (
	"fmt"
	"html/template"
	"net/http"
)

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

func main() {
	// Serve static files from the "static" directory
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Route Handlers
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/about", aboutHandler)
	http.HandleFunc("/login", loginHandler)
	http.HandleFunc("/tutorial", tutorialHandler)

	// Start the server
	fmt.Println("Server started at http://localhost:8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Error starting the server:", err)
	}
}
