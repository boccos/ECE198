document.getElementById("logoutBtn").addEventListener("click", function() {
  const confirmLogout = confirm("Are you sure you want to logout?");
  if (confirmLogout) {
    localStorage.removeItem('hasLoggedIn');
    window.location.href = "index.html";
  }
});