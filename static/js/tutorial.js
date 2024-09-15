document.addEventListener('DOMContentLoaded', () => {
    const about = document.getElementById('about');
    const login = document.getElementById('login');
    const tutorial = document.getElementById('tutorial');
    const home = document.getElementById('home');
    tutorial.disabled = true;
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
});