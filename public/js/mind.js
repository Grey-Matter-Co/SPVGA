const rgxTxt = /[0-9a-z]/i
const url = "/signup"
let now = new Date()
const periodBreaker = new Date(`${now.getFullYear()}-06-23 00:00:00`)

async function signup(form) {
	form.disabled = true
	let name  = form.name.value.rmLateralSpace().rmTildes(),
		phone = form.phone.value.rmLateralSpace(),
		email = form.email.value.rmLateralSpace()

	decode(form.inscription.files[0])
		.then(inscription => {

			// @TODO chec conditio negattion
			if (!name.toUpperCase().split(" ").every(aElem => inscription.student.name.split(" ").includes(aElem)))
				return Promise.reject(`El comprobante no corresponde a ${name}. Por favor, utiliza un comprobante a tu nombre`)
			now = new Date()
			if (parseInt(inscription.period.substr(0,4)) !== now.getFullYear()+(now<periodBreaker?0:1) || inscription.period.substr(-1)!==(now<periodBreaker?"2":"1"))
				return Promise.reject("El comprobante no corresponde al periodo en curso")

			inscription.student.phone = phone
			inscription.student.email = email

			console.log(JSON.stringify(inscription, null, 4))

			// Opciones por defecto estan marcadas con un *
			fetch(url, {
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
				body: JSON.stringify(inscription) // body data type must match "Content-Type" header
			})
			.then(response => response.json())// parses JSON response into native JavaScript objects
			.then( console.log )

		})
		.catch(err => {
			alert(err)
			form.inscription.value = ""
		})
		.finally(_ => {
			form.disabled = false
		})
}

document.forms[0].onsubmit = ev => {
	ev.preventDefault();
	signup(ev.target)
}

document.forms[0].addEventListener('keyup', (ev) => {
	let form = ev.target.form
	let isNotEmpty = true
	let isNotFillingOptionalInp = true
	for (const formElement of form) {
		if (formElement.type !== "file" && formElement.name && formElement.required)
			if (!formElement.value)
				isNotEmpty = false;
		if (formElement === document.activeElement && !formElement.required)
			isNotFillingOptionalInp = false
	}

	form.inscription.disabled = !form.checkValidity()

	if (!form.checkValidity() && isNotEmpty && isNotFillingOptionalInp)
		form.reportValidity()
})

document.querySelector("[type='file']").addEventListener('change', ev =>
	document.querySelector('#btnSubmit').click()
);

/**
 * @returns {String} same string without beginning and ending spaces [\s]
 */
String.prototype.rmLateralSpace = function () {
	return this.replace(/\s+$/, '').replace(/^\s+/, '')
}

/**
 * @returns {String} same string without tildes excluding ~
 */
String.prototype.rmTildes = function () {
	return this.normalize("NFD").replace(/[\u0300-\u0302\u0304-\u036f]/g, "");
}

/**
 * @param file {File} PDF file to decode
 * @returns {Promise<JSON>} Inscription structure which contains student, institute, school, career, major, period and classes
 */
const decode = (file) => new Promise((resolve, reject) => {
	let reader = new FileReader();
	reader.onload = function() {
		let arrayBuffer = this.result
		let inscriptionData = {student: {}, class: []}
		
		new Pdf2TextClass().pdfToText(arrayBuffer, ()=>{}, (text) => {
			let data = text
				.split(new Pdf2TextClass().spliter) // Splits using the Inscription Decoder's spliter
				.map(elem => elem.rmLateralSpace())	// Trims beginning and ending space
				.filter(elem => elem)			    // Removes any empty field
			
			if (data[0] !== "INSTITUTO POLITECNICO NACIONAL")
				reject("El archivo no corresponde a un Comprobante de inscripción del IPN")
			else {
				inscriptionData.institute = data.shift()
				inscriptionData.school = data.shift()
				while (data.shift() !== "Nombre:") {}
				inscriptionData.student.id = data.shift()
				while (data.shift() !== "Licenciatura:") {}
				inscriptionData.career = data.shift()
				while (data.shift() !== "Especialidad") {}
				inscriptionData.major = data.shift()
				inscriptionData.student.name = data.shift()
				while (data.shift() !== "Salón") { }

				for (let isValidField = true, i=0; isValidField; i++) {
					let classGroup	= data.shift(),
						className	 = data.shift(),
						classTeacher	= data.shift(),
						classSchedule = "",
						isSchedule	= true,
						tmp
					
					while (isSchedule) {
						tmp = data[0]
						isSchedule = /^[\d]{2}:[\d]{2} -[\d]{2}:[\d]{2}/.test(tmp)//=>XX:XX -XX:XX
						if (isSchedule)
							classSchedule += data.shift()+(tmp.includes("//")?" ":"\n")
					}
					
					inscriptionData.class[i] = {
						group: classGroup,
						name: className,
						teacher: classTeacher,
						schedule: classSchedule
					}
					
					tmp = data[0]
					isValidField = !tmp.startsWith("IR")
				}
				data.shift()
				let tmp = data.shift().replace(" Periodo:", "")
				inscriptionData.period = tmp.replace(/\d$/, "-"+tmp.at(-1))
			}
			resolve(inscriptionData)
		})
	}
	reader.readAsArrayBuffer(file);
})