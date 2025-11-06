const hasLoggedIn = localStorage.getItem('hasLoggedIn');

document.getElementById('password-protected').hidden = !hasLoggedIn;
document.getElementById('password-protected-warning').hidden = hasLoggedIn;

console.log(hasLoggedIn);
