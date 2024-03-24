let nameError = document.getElementById("error-name");
let emailError = document.getElementById("error-email");
let passwordError = document.getElementById("error-password");
let mobileError = document.getElementById("error-mobile");
let confirmPasswordError = document.getElementById("error-confirmPassword");

function validateName() {
  console.log("Validate name is working");
  var name = document.getElementById("name").value;
  var disallowedChars = /[.,\/#!$%\^&\*;:{}=\-_`~())"@'|\\]/;
  if (name.trim().length === 0) {
    nameError.innerHTML = '<span style="color: red;">Name is required</span>';
    return false;
  } else if (disallowedChars.test(name)) {
    nameError.innerHTML =
      '<span style="color: red;">Invalid characters in the name</span>';
    return false;
  } else {
    nameError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  }
}

function validateEmail() {
  let email = document.getElementById("email").value;
  let mailFormat = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

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

function validateMobile() {
  let mobileNumber = document.getElementById("mobile").value;
  let mobileFormat = /^\d{10}$/;
  if (mobileNumber.match(mobileFormat)) {
    mobileError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  } else {
    mobileError.innerHTML = '<span style="color: red;">Not valid</span>';
    return false;
  }
}

//address edit validation
function validateAddressName(index) {
  const nameError = document.getElementById("error-name" + index);
  const name = document.getElementById("name" + index).value;
  var disallowedChars = /[.,\/#!$%\^&\*;:{}=\-_`~())"@'|\\]/;
  if (name.trim().length < 3) {
    nameError.innerHTML = '<span style="color: red;">Name is required</span>';
    return false;
  } else if (disallowedChars.test(name)) {
    nameError.innerHTML =
      '<span style="color: red;">Invalid characters in the name</span>';
    return false;
  } else {
    nameError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  }
}

function validateAddressNumber(index) {
  console.log("Clicked the validate number");
  const numberError = document.getElementById("error-number" + index);
  const number = document.getElementById("number" + index).value;
  const numberFormat = /^\d{10}$/; // Regular expression to match a 10-digit number
  if (number.match(numberFormat)) {
    numberError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  } else {
    numberError.innerHTML =
      '<span style="color: red;">Enter valid number</span>';
    return false;
  }
}

function validateAddress(index) {
  const addressError = document.getElementById("error-address" + index);
  const address = document.getElementById("address" + index).value;
  const disallowedChars = /[.,\/#!$%\^&\*;:{}=\-_`~())"@'|\\]/;
  if (address.length <= 5) {
    addressError.innerHTML =
      '<span style="color: red;">Enter valid address</span>';
    return false;
  } else if (disallowedChars.test(address)) {
    addressError.innerHTML =
      '<span style="color: red;">Invalid characters in the Address</span>';
    return false;
  } else {
    addressError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  }
}

function validateCity(index) {
  const nameError = document.getElementById("error-city" + index);
  const city = document.getElementById("city" + index).value;
  const disallowedChars = /[.,\/#!$%\^&\*;:{}=\-_`~())"@'|\\]/;
  if (city.trim().length < 3) {
    nameError.innerHTML = '<span style="color: red;">City is required</span>';
    return false;
  } else if (disallowedChars.test(city)) {
    nameError.innerHTML =
      '<span style="color: red;">Invalid characters in the City</span>';
    return false;
  } else {
    nameError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  }
}
function validateState(index) {
  const nameError = document.getElementById("error-state" + index);
  const state = document.getElementById("state" + index).value;
  const disallowedChars = /[.,\/#!$%\^&\*;:{}=\-_`~())"@'|\\]/;
  if (state.trim().length < 3) {
    nameError.innerHTML = '<span style="color: red;">State is required</span>';
    return false;
  } else if (disallowedChars.test(state)) {
    nameError.innerHTML =
      '<span style="color: red;">Invalid characters in the State</span>';
    return false;
  } else {
    nameError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  }
}
function validatePincode(index) {
  const pincodeError = document.getElementById("error-pincode" + index);
  const pincode = document.getElementById("pincode" + index).value;
  const pincodeFormat = /^(\d{4}|\d{6})$/;
  if (pincode.match(pincodeFormat)) {
    pincodeError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  } else {
    pincodeError.innerHTML = '<span style="color: red;">Invalid pincode</span>';
    return false;
  }
}

function validateLandmark(index) {
  const nameError = document.getElementById("error-landmark" + index);
  const landmark = document.getElementById("landmark" + index).value;
  const disallowedChars = /[.,\/#!$%\^&\*;:{}=\-_`~())"@'|\\]/;
  if (landmark.trim().length < 3) {
    nameError.innerHTML =
      '<span style="color: red;">Landmark is required</span>';
    return false;
  } else if (disallowedChars.test(landmark)) {
    nameError.innerHTML =
      '<span style="color: red;">Invalid characters in the Landmark</span>';
    return false;
  } else {
    nameError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  }
}

//address add validation

function addressValidateName() {
  const name = document.getElementById("name").value;
  const nameError = document.getElementById("name-error");
  const disallowedChars = /[.,\/#!$%\^&\*;:{}=\-_`~())"@'|\\]/;
  if (name.trim().length < 3) {
    nameError.innerHTML = '<span style="color: red;">Name is required</span>';
    return false;
  } else if (disallowedChars.test(name)) {
    nameError.innerHTML =
      '<span style="color: red;">Invalid characters in the name</span>';
    return false;
  } else {
    nameError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  }
}

function addressValidateNumber() {
  const numberError = document.getElementById("number-error");
  const number = document.getElementById("number").value;
  const numberFormat = /^\d{10}$/; // Regular expression to match a 10-digit number
  if (number.match(numberFormat)) {
    numberError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  } else {
    numberError.innerHTML =
      '<span style="color: red;">Enter valid number</span>';
    return false;
  }
}

function addressValidateAddress() {
  const addressError = document.getElementById("address-error");
  const address = document.getElementById("address").value;
  const disallowedChars = /[.,\/#!$%\^&\*;:{}=\-_`~())"@'|\\]/;
  if (address.length <= 5) {
    addressError.innerHTML =
      '<span style="color: red;">Enter valid address</span>';
    return false;
  } else if (disallowedChars.test(address)) {
    addressError.innerHTML =
      '<span style="color: red;">Invalid characters in the Address</span>';
    return false;
  } else {
    addressError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  }
}

function addressValidateCity() {
  const nameError = document.getElementById("city-error");
  const city = document.getElementById("city").value;
  const disallowedChars = /[.,\/#!$%\^&\*;:{}=\-_`~())"@'|\\]/;
  if (city.trim().length < 3) {
    nameError.innerHTML = '<span style="color: red;">City is required</span>';
    return false;
  } else if (disallowedChars.test(city)) {
    nameError.innerHTML =
      '<span style="color: red;">Invalid characters in the City</span>';
    return false;
  } else {
    nameError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  }
}

function addressValidateState() {
  const nameError = document.getElementById("state-error");
  const state = document.getElementById("state").value;
  const disallowedChars = /[.,\/#!$%\^&\*;:{}=\-_`~())"@'|\\]/;
  if (state.trim().length < 3) {
    nameError.innerHTML = '<span style="color: red;">State is required</span>';
    return false;
  } else if (disallowedChars.test(state)) {
    nameError.innerHTML =
      '<span style="color: red;">Invalid characters in the State</span>';
    return false;
  } else {
    nameError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  }
}

function addressValidatePincode() {
  const pincodeError = document.getElementById("pincode-error");
  const pincode = document.getElementById("pincode").value;
  const pincodeFormat = /^(\d{4}|\d{6})$/;
  if (pincode.match(pincodeFormat)) {
    pincodeError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  } else {
    pincodeError.innerHTML = '<span style="color: red;">Invalid pincode</span>';
    return false;
  }
}

function addressValidateLandmark() {
  const nameError = document.getElementById("landmark-error");
  const landmark = document.getElementById("landmark").value;
  const disallowedChars = /[.,\/#!$%\^&\*;:{}=\-_`~())"@'|\\]/;
  if (landmark.trim().length < 3) {
    nameError.innerHTML =
      '<span style="color: red;">Landmark is required</span>';
    return false;
  } else if (disallowedChars.test(landmark)) {
    nameError.innerHTML =
      '<span style="color: red;">Invalid characters in the Landmark</span>';
    return false;
  } else {
    nameError.innerHTML = '<span style="color: green;">Valid</span>';
    return true;
  }
}

//Add product validation

function addValidatePrice(){
  const price = document.getElementById('addPrice').value
  const priceError = document.getElementById('error-price')
  if (price<=0 || NaN) {
    priceError.innerHTML = 'Enter the price'
    return false
  }else{
    priceError.innerHTML = ''
    toastr.success('Valid Price','Done');
    return true
  }
}

function addValidateDescription(){
const description = document.getElementById('addDescription').value
const error = document.getElementById('error-description')
if(description.trim().length <= 0){
  error.innerHTML = 'Enter descitption'
  return false
}
else if(description.trim().length <= 10){
  error.innerHTML = 'Description must be greater than 10 words'
  return false
}else{
  error.innerHTML = ''
  toastr.success('Valid Description','Done');
  return true
}
}

function addValidateStock(){
const stock = document.getElementById('addStock').value
const error = document.getElementById('error-stock')
if(stock<=0 ||NaN){
  error.innerHTML = 'Enter the stock'
  return false
}else{
  error.innerHTML = ''
  toastr.success('Valid Stock','Done')
  return true
}
}

function addValidateProductName(){
const name = document.getElementById('addProductName').value
const nameError = document.getElementById('error-name')
if (name.trim().length <= 2) {
  nameError.innerHTML = 'Enter Product Name' ;
  return false
}else{
  nameError.innerHTML = '' ;
  toastr.success('Valid Product Name','Done')
  return true
}
}