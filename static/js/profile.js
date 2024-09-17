document.addEventListener('DOMContentLoaded', () => {
    /* If user somehow gets to this page without logging in, redirect to login page */
    if (localStorage.getItem('profile_id') === null) {
        window.location.href = '/login';
    }
    const about = document.getElementById('about');
    const logout = document.getElementById('logout');
    const tutorial = document.getElementById('tutorial');
    const home = document.getElementById('home');

    const content = document.getElementById('profile-id');

    content.textContent = "User ID: " + localStorage.getItem('profile_id');
    /* Do any other profile stuff here */

    about.addEventListener('click', (event) => {
        window.location.href = '/about';
    });
    /* Slight difference for the login button here in that it is a logout button because user has logged in already */
    logout.addEventListener('click', (event) => {
        localStorage.removeItem('profile_id');
        window.location.href = '/login';
    });
    tutorial.addEventListener('click', (event) => {
        window.location.href = '/tutorial';
    });
    home.addEventListener('click', (event) => {
        window.location.href = '/home';
    });
});