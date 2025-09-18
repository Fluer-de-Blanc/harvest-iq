document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const messageEl = document.getElementById('message');

  // Get admins and users from localStorage
  const admins = JSON.parse(localStorage.getItem('admins')) || [];
  const users = JSON.parse(localStorage.getItem('users')) || {};

  // Check if admin
  const admin = admins.find(admin => admin.email === email && admin.password === password);

  if (admin) {
    // Successful admin login
    sessionStorage.setItem('loggedInUser', email);
    sessionStorage.setItem('userRole', 'admin');

    messageEl.textContent = 'Admin login successful! Redirecting...';
    messageEl.style.color = 'green';

    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 1000);

    return;
  }

  // Check if regular user
  const user = users[email];
  if (!user) {
    messageEl.textContent = 'User not found. Please register first.';
    messageEl.style.color = 'red';
    return;
  }

  if (user.password !== password) {
    messageEl.textContent = 'Incorrect password.';
    messageEl.style.color = 'red';
    return;
  }

  // Successful user login
  sessionStorage.setItem('loggedInUser', email);
  sessionStorage.setItem('userRole', user.role || 'user');

  messageEl.textContent = 'Login successful! Redirecting...';
  messageEl.style.color = 'green';

  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1000);
});
