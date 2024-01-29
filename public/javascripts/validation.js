let nameError = document.getElementById("error-name");
let emailError = document.getElementById("error-email");
let passwordError = document.getElementById("error-password");
let mobileError = document.getElementById("error-mobile");
let confirmPasswordError = document.getElementById('error-confirmPassword');

function validateName() {
  var name = document.getElementById("name").value;
  var disallowedChars = /[.,\/#!$%\^&\*;:{}=\-_`~()"@'|\\]/; 
  if (name.trim().length === 0) {
    nameError.innerHTML = '<span style="color: red;">Name is required</span>';
    return false;
  } else if (disallowedChars.test(name)) {
    nameError.innerHTML = '<span style="color: red;">Invalid characters in the name</span>';
    return false;
  } else {
    nameError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  }
}

function validateEmail() {
  let email = document.getElementById("email").value;
  let mailFormat =/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;


  if (email.match(mailFormat)) {
    emailError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  } else {
    emailError.innerHTML = '<span style="color: red;">Invalid Email</span>';
    return false;
  }
}

function validatePassword() {
  let password = document.getElementById("password").value;
  if (password.length <= 5) {
    passwordError.innerHTML =
      '<span style="color: red;">Enter more than 5 charecter</span>';
    return false;
  } else {
    passwordError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  }
}

function confirmPassword() {
  let password = document.getElementById("password").value;
  let confirmPassword = document.getElementById("confirmPassword").value;
  if (password !== confirmPassword) {
    confirmPasswordError.innerHTML =
      '<span style="color: red;">Re enter the same password</span>';
    return false;
  } else {
    return true;
  }
}

function validateMobile(){
  let mobileNumber = document.getElementById("mobile").value ; 
  let mobileFormat =  /^\d{10}$/ ; 
  if(mobileNumber.match(mobileFormat)){
    mobileError.innerHTML = '<span style="color: green;">Valid</span>';
    return true ;
  }else{
    mobileError.innerHTML = '<span style="color: red;">Not valid</span>';
    return false ;
  }
}