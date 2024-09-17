document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('login-button');

    const about = document.getElementById('about');
    const login = document.getElementById('login');
    const tutorial = document.getElementById('tutorial');
    const home = document.getElementById('home');
    login.disabled = true;
    about.addEventListener('click', (event) => {
        window.location.href = '/about'
    });
    login.addEventListener('click', (event) => {
        window.location.href = '/login'
    });
    tutorial.addEventListener('click', (event) => {
        window.location.href = '/tutorial'
    });
    home.addEventListener('click', (event) => {
        window.location.href = '/home'
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        console.log('Username:', username, 'Password:', password);
        /* Make hash function to call and secure the password */
        const dataToSend = { user_name: String(username), pass_word: String(password) };
        fetch('http://localhost:8080/api/getInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        })
        .then(response => response.json())
        .then(data => {
            if (data.info !== "No Data"){
                localStorage.setItem('profile_id', data.info)
                window.location.href = '/profile';
            }
            else{
                document.getElementById('login-fail').textContent = "Incorrect Username or Password";
                document.getElementById('login-fail').style.color = 'red';
            }
        })
        .catch(error => console.error('Error:', error));
    });
});