document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('profile_id') === null) {
        window.location.href = '/login';
    }
    const about = document.getElementById('about');
    const login = document.getElementById('login');
    const tutorial = document.getElementById('tutorial');
    const home = document.getElementById('home');
    about.addEventListener('click', (event) => {
        window.location.href = '/about';
    });
    login.textContent = 'PROFILE';
    login.addEventListener('click', (event) => {
        window.location.href = '/profile';
    });
    tutorial.addEventListener('click', (event) => {
        window.location.href = '/tutorial';
    });
    home.addEventListener('click', (event) => {
        window.location.href = '/home';
    });


    var modal = document.getElementById("miniModal");
    var btn = document.getElementById("make-exercise-log");
    var span = document.getElementsByClassName("close")[0];
    var form = document.getElementById("create-new-exercise-log");

    btn.onclick = function() {
        modal.style.display = "block";
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    form.addEventListener('submit', (event) => {
        dataToSend = {}
        fetch('http://localhost:8080/api/logExercise', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        })
        .then(response => response.json())
        .then(data => {
            
        })
        .catch(error => console.error('Error:', error));
        modal.style.display = "none";
    });
});