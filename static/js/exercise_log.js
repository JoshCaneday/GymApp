document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('profile_id') === null) {
        window.location.href = '/login';
    }

    let totalLogs = 0;
    if (localStorage.getItem('numExerciseLogsShown') === null) {
        localStorage.setItem('numExerciseLogsShown', 10);
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

    dataToSend = { profile_ID: String(localStorage.getItem('profile_id')), limit: String(parseInt(localStorage.getItem('numExerciseLogsShown'))+1) }

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
            for (let i = 0; i < data.info.length; i++) {
                if (i > parseInt(localStorage.getItem('numExerciseLogsShown'))-1) {
                    break;
                }
                let item = data.info[i];
                const tr = document.createElement('tr');
                itemsList.appendChild(tr);
                curRow = tr

                const td = document.createElement('td');
                const button = document.createElement('button');
                td.appendChild(button)
                button.textContent = item;
                button.className = "past-exercise";
                button.setAttribute('exercise-log-val', data.info[i][data.info[i].length - 1]);
                
                curRow.appendChild(td);
            }
        }
        if (data.info.length >= parseInt(localStorage.getItem('numExerciseLogsShown'))+1) {
            // total logs will be set to number of logs shown max so that we know to
            totalLogs = parseInt(localStorage.getItem('numExerciseLogsShown'));
            if (document.getElementById('more-button') === null){
                const moreDiv = document.getElementById('more');
                const moreButton = document.createElement('button');
                moreButton.textContent = "Show More";
                moreButton.id = "more-button";
                moreDiv.appendChild(moreButton);
            } else {
                document.getElementById('more-button').style.display = 'inline-block';
            }
            getMore = document.getElementById('more-button')
            if (getMore != null) {
                getMore.addEventListener('click', (event) => {
                    // Will do another query, make sure to just get the next 10 and keep track of how many you are already showing
                    dataToSend = { profile_ID: String(localStorage.getItem('profile_id')), offset: String(totalLogs) }
                    fetch('http://localhost:8080/api/getMoreExerciseLogs', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(dataToSend),
                    })
                    .then(response => response.json())
                    .then(data => {
                        let add = data.info.length;
                        if (add > 10) {
                            // Store the number of exercise that will be shown to be whatever it currently is, plus this added amount
                            localStorage.setItem('numExerciseLogsShown', parseInt(localStorage.getItem('numExerciseLogsShown')) + 10);
                        } else {
                            // Store the number of exercise that will be shown to be whatever it currently is, plus this added amount
                            localStorage.setItem('numExerciseLogsShown', parseInt(localStorage.getItem('numExerciseLogsShown')) + add);
                            document.getElementById('more-button').style.display = 'none';
                        }
                        window.location.reload();
                    })
                })
            }
        }
        //console.log(localStorage.getItem('numExerciseLogsShown'));
        if (parseInt(localStorage.getItem('numExerciseLogsShown')) > 10) {
            const lessDiv = document.getElementById('less');
            const lessButton = document.createElement('button');
            lessButton.textContent = "Show Less";
            lessButton.id = "less-button";
            lessDiv.appendChild(lessButton);
            getLess = document.getElementById('less-button');
            getLess.addEventListener('click', (event) => {
                localStorage.setItem('numExerciseLogsShown', 10);
                window.location.reload();
            })
        }
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