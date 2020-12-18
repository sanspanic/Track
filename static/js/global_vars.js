const BASE = `${window.location.protocol}//${window.location.host}`;
let username;

//prevents var from initialising on logged out pages
if (document.querySelector("#navbarDropdown")) {
  username = document.querySelector("#navbarDropdown").dataset.username;
} else {
  username = null;
}
