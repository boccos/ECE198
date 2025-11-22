const USERNAME = 'admin';
const PASSWORD = 'password';

document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  document.getElementById('password').value = "";

  if (username === USERNAME && password === PASSWORD) {
    document.getElementById('message').textContent = 'Welcome!';
    document.getElementById('password-protected').hidden = false;
    localStorage.setItem('hasLoggedIn', 'true');
  } else {
    document.getElementById('message').textContent = 'Invalid username or password.';
  }
});