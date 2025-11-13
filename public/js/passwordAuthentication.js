const hasLoggedIn = localStorage.getItem('hasLoggedIn');

document.getElementById('password-protected').hidden = !hasLoggedIn;
if (document.getElementById('password-protected-warning') != null) {
    document.getElementById('password-protected-warning').hidden = hasLoggedIn;
}