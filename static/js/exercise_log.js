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

    dataToSend = { profile_ID: String(localStorage.getItem('profile_id')) }
    fetch('http://localhost:8080/api/getNumExerciseLogs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('num_workouts').textContent = "Number of Workouts: " + data.info[0];
        document.getElementById('days-of-rest').textContent = "Days of Rest: " + data.info[1];
    })
    

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
                button.addEventListener('click', (event) => {
                    modal = document.getElementById('exerciseLogModal');
                    modal.style.display = "block";
                    document.getElementById('insert-date').textContent = "Date: " + String(data.info[i][0]);
                    document.getElementById('insert-day').textContent = "Day: " + String(data.info[i][1]);
                    document.getElementById('insert-label').textContent = "Exercise: " + String(data.info[i][2]);
                    document.getElementById('insert-weight').textContent = "Weight: " + String(data.info[i][3]);
                    document.getElementById('insert-metric').textContent = "Metrics: " + String(data.info[i][4]);
                    document.getElementById('insert-reps').textContent = "Reps: " + String(data.info[i][5]);
                    document.getElementById('insert-sets').textContent = "Sets: " + String(data.info[i][6]);
                    delLog = document.getElementById('deleteExerciseLog');
                    delLog.addEventListener('click', (event) => {
                        dataToSend = { profile_ID: String(data.info[i][7]) }

                        fetch('http://localhost:8080/api/deleteExerciseLog', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(dataToSend),
                        })
                        .catch(error => console.error('Error:', error));
                        if (parseInt(localStorage.getItem('numExerciseLogsShown')) > 10) {
                            localStorage.setItem('numExerciseLogsShown', parseInt(localStorage.getItem('numExerciseLogsShown'))-1);
                        }
                        window.location.reload();
                    })
                })
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

    var modal = document.getElementById("exerciseLogModal");
    var span = document.getElementsByClassName("closeExerciseLog")[0];
    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    var modal2 = document.getElementById("miniModal");
    var btn2 = document.getElementById("make-exercise-log");
    var span2 = document.getElementsByClassName("close")[0];
    var form2 = document.getElementById("create-new-exercise-log");

    btn2.onclick = function() {
        modal2.style.display = "block";
    }

    span2.onclick = function() {
        modal2.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal2) {
            modal2.style.display = "none";
        }
    }
    form2.addEventListener('submit', (event) => {
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
        modal2.style.display = "none";
    });
});