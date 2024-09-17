document.addEventListener('DOMContentLoaded', () => {
    const about = document.getElementById('about');
    const login = document.getElementById('login');
    const tutorial = document.getElementById('tutorial');
    const home = document.getElementById('home');

    const content = document.getElementById('profile-id');
    if (localStorage.getItem('profile_id') !== null) {
        content.textContent = localStorage.getItem('profile_id');
        /* Do any other profile stuff here */

        

        /* This removal of the item must come last */
        localStorage.removeItem('profile_id');
    }
    else{
        content.textContent = "No Profile ID";
    }
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