document.getElementById('loginButton').addEventListener('click', function () {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  fetch('/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username, password: password })
  })
  .then(response => response.text())
  .then(data => {
      if (data.includes('Invalid')) {
          alert(data);
      } else {
          window.location.href = 'voting.html';
      }
  });
});
