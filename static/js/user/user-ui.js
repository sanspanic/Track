const billingInfoSection = document.getElementById("billing-info-div");
const delButton = document.getElementById("delete-user");

//removes billing information from db and DOM
billingInfoSection.addEventListener("click", function (evt) {
  if (evt.target.classList.contains("delete")) {
    const billingInfoId = evt.target.dataset.billingInfoId;
    sendRequestToDeleteBillingInfo(billingInfoId, evt);
  }
});

//deletes user
delButton.addEventListener("click", async () => {
  await sendRequestToDeleteUser();
});

async function sendRequestToDeleteBillingInfo(billingInfoId, evt) {
  await axios
    .delete(`${BASE}/${username}/billing-info/${billingInfoId}/delete`)
    .then(function (response) {
      //handle success
      removeInfo(evt);
      makeAlert(response, "danger");
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

//removes billing information from DOM
function removeInfo(evt) {
  let targetDiv;
  if (evt.target.tagName === "BUTTON") {
    targetDiv = evt.target.parentElement.parentElement;
  } else {
    targetDiv = evt.target.parentElement.parentElement.parentElement;
  }
  targetDiv.remove();
}

function makeAlert(response, category) {
  let alert = document.createElement("div");
  let container = document.querySelector(".alert-container");
  alert.classList.add("alert", `alert-${category}`);
  alert.innerText = response.data.message;
  alert.setAttribute("id", "alert");
  container.insertBefore(alert, billingInfoSection);
}

function hideAlert() {
  document.getElementById("alert").remove();
}

async function sendRequestToDeleteUser() {
  await axios
    .delete(`${BASE}/user/${username}/delete`)
    .then(function (response) {
      //handle success
      redirect();
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

function redirect() {
  window.location.pathname = "/user/user-deleted";
}
