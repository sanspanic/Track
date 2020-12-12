const BASE = "http://127.0.0.1:5000";
let username; 

//prevents var from initialising on logged out pages
if (document.querySelector("#navbarDropdown")) {
    username = document.querySelector("#navbarDropdown").dataset.username
} else {
    username = null
}
