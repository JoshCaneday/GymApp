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
});