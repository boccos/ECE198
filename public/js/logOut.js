document.getElementById("logoutBtn").addEventListener("click", function() {
  localStorage.removeItem('hasLoggedIn');
  window.location.href = "index.html";
});