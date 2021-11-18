function signup() {
	postData('/signup', { name: "Gustavo Peduzzi", phone: "5610338516", email: "gpeduzzia1600@alumno.ipn.mx" })
		.then(console.log);// JSON data parsed by `data.json()` call
}

async function postData(url = '', data = {}) {
	// Opciones por defecto estan marcadas con un *
	return fetch(url, {
		method: 'PUT', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'same-origin', // include, *same-origin, omit
		headers: {
			'Content-Type': 'application/json'
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
		redirect: 'follow', // manual, *follow, error
		referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		body: JSON.stringify(data) // body data type must match "Content-Type" header
	}).then(res => response.json());// parses JSON response into native JavaScript objects
	
}