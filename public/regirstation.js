document.getElementById('registrationForm').addEventListener('submit', function (event) {
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmpassword').value;
  if (password !== confirmPassword) {
      event.preventDefault();
      alert('Passwords do not match.');
  }
});
