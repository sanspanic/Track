let BASE = "http://127.0.0.1:5000";

const username = document.getElementById("username").innerText;

const delButton = document.getElementById("delete");

async function sendRequest() {
  await axios
  .delete(`${BASE}/user/${username}/delete`)
  .then(function(response) {
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

delButton.addEventListener("click", async () => {
    await sendRequest();
});

