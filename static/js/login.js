document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('login');
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');

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

        window.location.href = '/profile'
    });
});