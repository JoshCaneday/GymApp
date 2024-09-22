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

    dataToSend = { profile_ID: String(localStorage.getItem('profile_id')) }
    fetch('http://localhost:8080/api/getExerciseLogs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
    })
    .then(response => response.json())
    .then(data => {
        if (data.info.length > 0){
            const itemsList = document.getElementById('table');
            let curRow = document.getElementById('top');
            data.info.forEach(item => {
                const tr = document.createElement('tr');
                itemsList.appendChild(tr);
                curRow = tr

                const td = document.createElement('td');
                const button = document.createElement('button');
                td.appendChild(button)
                button.textContent = item;
                button.className = "past-exercise";
                curRow.appendChild(td);
            });
        }
        if (data.info.length > 10) {
            const moreDiv = document.getElementById('more');
            const moreButton = document.createElement('button');
            moreButton.textContent = "Show More";
            moreButton.id = "more-button";
            moreDiv.appendChild(moreButton);
        }
    })

    const getMore = document.getElementById('more-button');
    getMore.addEventListener('click', (event) => {
        // Will do another query, make sure to just get the next 10 and keep track of how many you are already showing
    })


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
        localStorage.setItem('exercise', document.getElementById('exercise').value)
        dataToSend = { profile_ID: String(localStorage.getItem('profile_id')), exercise: String(document.getElementById('exercise').value), 
            metric: String(document.getElementById('metric').value), amount: String(document.getElementById('amount').value),
            reps: String(document.getElementById('reps').value), sets: String(document.getElementById('sets').value)
        }
        fetch('http://localhost:8080/api/logExercise', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        })
        .catch(error => console.error('Error:', error));
        modal.style.display = "none";
    });
});