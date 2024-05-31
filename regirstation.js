document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally
  
    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach(function(elem) {
      elem.style.display = 'none';
    });
  
    let isValid = true;
  
    const firstName = document.getElementById('First Name').value.trim();
    const lastName = document.getElementById('Last Name').value.trim();
    const birthDate = document.getElementById('Birth Date').value;
    const aadhaarNumber = document.getElementById('AADHAAR NUMBER').value.trim();
    const userName = document.getElementById('user name').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm password').value.trim();
  
    // First Name Validation
    if (!firstName) {
      isValid = false;
      showError('First Name', 'First name is required.');
    }
  
    // Last Name Validation
    if (!lastName) {
      isValid = false;
      showError('Last Name', 'Last name is required.');
    }
  
    // Birth Date Validation
    if (!birthDate) {
      isValid = false;
      showError('Birth Date', 'Birth date is required.');
    }
  
    // Aadhaar Number Validation
    if (!aadhaarNumber || aadhaarNumber.length !== 12 || !/^\d+$/.test(aadhaarNumber)) {
      isValid = false;
      showError('AADHAAR NUMBER', 'Valid Aadhaar number is required.');
    }
  
    // Username Validation
    if (!userName) {
      isValid = false;
      showError('user name', 'User name is required.');
    }
  
    // Password Validation
    if (!password) {
      isValid = false;
      showError('password', 'Password is required.');
    }
  
    // Confirm Password Validation
    if (password !== confirmPassword) {
      isValid = false;
      showError('confirm password', 'Passwords do not match.');
    }
  
    // Show success message if form is valid
    if (isValid) {
      document.querySelector('.success-message').style.display = 'block';
    }
  });
  
  function showError(fieldId, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    const inputField = document.getElementById(fieldId);
    inputField.parentElement.appendChild(errorElement);
    errorElement.style.display = 'block';
  }
  