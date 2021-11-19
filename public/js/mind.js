const dan = "5548258856"
const gus = "5610338516"
const ed  = "5534315125"
const url = "/signup"
let data = { name: "Gustavo Peduzzi", phone: "5610338516", email: "gpeduzzia1600@alumno.ipn.mx" }
function signup() {
	
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
	})
	.then(response => response.json())// parses JSON response into native JavaScript objects
	.then( console.log )
}