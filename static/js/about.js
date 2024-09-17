document.addEventListener('DOMContentLoaded', () => {
    const about = document.getElementById('about');
    const login = document.getElementById('login');
    const tutorial = document.getElementById('tutorial');
    const home = document.getElementById('home');
    about.disabled = true;
    about.addEventListener('click', (event) => {
        window.location.href = '/about';
    });
    if (localStorage.getItem('profile_id') !== null) {
        login.textContent = 'PROFILE';
        login.addEventListener('click', (event) => {
            window.location.href = '/profile';
        });
    } else {
        login.addEventListener('click', (event) => {
            window.location.href = '/login';
        });
    }
    tutorial.addEventListener('click', (event) => {
        window.location.href = '/tutorial';
    });
    home.addEventListener('click', (event) => {
        window.location.href = '/home';
    });
});