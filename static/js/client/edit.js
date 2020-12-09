const form = document.querySelector("form");
const client_id = document.querySelector(".client-name").getAttribute("id");

async function sendRequest(id) {
  await axios
    .put(`${BASE}/${username}/client/${id}/edit`, {
      name: document.querySelector("#name").value,
      street: document.querySelector("#street").value,
      postcode: document.querySelector("#postcode").value,
      city: document.querySelector("#city").value,
      country: document.querySelector("#country").value,
    })
    .then(function (response) {
      // handle success
      let alert = document.createElement("div");
      let container = document.querySelector("#edit-container");
      alert.classList.add("alert", "alert-success");
      alert.innerText = response.data[1].message;
      alert.setAttribute("id", "alert");
      container.insertBefore(alert, form);
      let backBtn = document.createElement("a");
      backBtn.innerText = "Back to all clients";
      backBtn.classList.add(
        "btn",
        "btn-success",
        "btn-block",
        "btn-lg",
        "mt-3"
      );
      backBtn.setAttribute("href", `/user/${username}/clients`);
      container.append(backBtn);

      if (document.getElementById("alert")) {
        setTimeout("hideAlert()", 5000);
      }
    })
    .catch(function (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
      }
      console.log(error.config);
    });
}

form.addEventListener("click", function (evt) {
  evt.preventDefault();
  if (evt.target.tagName === "BUTTON") {
    sendRequest(client_id);
    //evt.target.parentElement.parentElement.remove();
  }
});

function hideAlert() {
  document.getElementById("alert").remove();
}
