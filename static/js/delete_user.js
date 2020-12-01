const BASE = 'http://127.0.0.1:5000/'
const username = document.getElementById('username').innerText

const delButton = document.getElementById('delete')

async function sendRequest() {
    await axios.delete(`${BASE}/user/${username}/delete`)
}

delButton.addEventListener("click", sendRequest)