let PDFJS = window['pdfjs-dist/build/pdf']; // Loaded via <script> tag, create shortcut to access PDF.js exports.
PDFJS.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js'; // The workerSrc property shall be specified.

const rgxGrpClassTeacher = /\d[\w]{2}[\d]{1,2} [A-ZÀ-Ý .]+/g
// @WARNING: recortar al final una E
const rgxMajor = /Licenciatura: [A-ZÀ-Ý .]+/
// @WARNING: recortar al final una C
const rgxSchool = /INSTITUTO POLITECNICO NACIONAL[A-ZÀ-Ý .]+/
const rgxPeriod = /[\d]{5}Periodo/i

function Pdf2TextClass(){
	let self = this;
	this.complete = 0;
	
	/**
	 * @param data ArrayBuffer of the pdf file content
	 * @param callbackPageDone To inform the progress each time when a page is finished. The callback function's input parameters are:
	 *        1) number of pages done;
	 *        2) total number of pages in file.
	 * @param callbackAllDone The input parameter of callback function is the result of extracted text from pdf file.
	 */
	this.pdfToText = function(data, callbackPageDone, callbackAllDone){
		console.assert( data  instanceof ArrayBuffer  || typeof data == 'string' );
		PDFJS.getDocument( data ).promise.then( function(pdf) {
			//let div = document.getElementById('viewer');
			
			let total = pdf.numPages;
			callbackPageDone( 0, total );
			let layers = {};
			for (let i = 1; i <= total; i++){
				pdf.getPage(i).then( function(page){
					let n = page.pageNumber;
					page.getTextContent().then( function(textContent){
						if( null != textContent.items ){
							let page_text = "";
							let last_block = null;
							for( let k = 0; k < textContent.items.length; k++ ){
								let block = textContent.items[k];
								console.log(`text found: ${block.str}`)
								if (!block.str.at(-1))
									continue
								if( last_block != null && last_block.str.at(-1) !== ' '){
									console.log(`|`)
									page_text += "|"
									if( block.x < last_block.x )
										page_text += "\r\n";
									else if ( last_block.y !== block.y && ( last_block.str.match(/^(\s?[a-zA-Z])$|^(.+\s[a-zA-Z])$/) == null ))
										page_text += '°';
								}
								page_text += block.str;
								last_block = block;
							}
							
							console.log("page " + n + " finished."); //" content: \n" + page_text);
							layers[n] =  page_text + "\n\n";
						}
						++ self.complete;
						callbackPageDone( self.complete, total );
						if (self.complete === total){
							window.setTimeout(function(){
								let full_text = "";
								let num_pages = Object.keys(layers).length;
								for( let j = 1; j <= num_pages; j++)
									full_text += layers[j] ;
								callbackAllDone(full_text);
							}, 1000);
						}
					}); // end  of page.getTextContent().then
				}); // end of page.then
			} // of for
		});
	}; // end of pdfToText()
} // end of class

const spliter = "||"

/**
 * @param file {File} PDF file to decode
 * @returns {Promise<JSON>} Inscription structure wich contains institute, scholl, major, period and classes
 */
let inscriptionDecode = (file) => {
	return new Promise(resolve => {
		let reader = new FileReader();
		reader.onload = function() {
			let arrayBuffer = this.result
			let inscriptionData = {}

			new Pdf2TextClass().pdfToText(arrayBuffer, ()=>{}, text => {
				console.info(text)

				inscriptionData.institute = "INSTITUTO POLITECNICO NACIONAL"
				inscriptionData.school = text.match(rgxSchool)[0].replace("INSTITUTO POLITECNICO NACIONAL", "").slice(0, -1)
				inscriptionData.major = text.match(rgxMajor)[0].replace("Licenciatura: ", "").slice(0, -1)
				inscriptionData.period = text.match(rgxPeriod)[0].replace("Periodo", "")
				inscriptionData.period = `${inscriptionData.period.slice(0, -1)}-${pinscriptionData.period.slice(-1)}`

				let i=0;
				for(let _grpClass of text.matchAll(rgxGrpClassTeacher)) {
					let grpClass = _grpClass[0],
						grp = grpClass.slice(0, grpClass.search(" ")),
						classTeach = grpClass.slice(grpClass.search(" ")).replace("SIN ASIGNAR", "")

					inscriptionData.class[i] = { classgroup: grp, classname: classTeach }
					i++;
				}
				resolve(inscriptionData)
			})
			reader.readAsArrayBuffer(file);
		}
	})
}

const dan = "5548258856"
const gus = "5610338516"
const ed  = "5534315125"
const url = "/signup"
let data = { name: "Gustavo Peduzzi", phone: "5610338516", email: "gpeduzzia1600@alumno.ipn.mx" }
async function signup(form) {
	let name = form.name,
		phone = form.phone,
		email = form.email,
		inscription = await inscriptionDecode(form.inscription.files[0])


	reader.readAsArrayBuffer(this.files[0]);


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
	return false
}
let form = document.querySelector("form");
form.addEventListener('keyup', () => {
	let isNotEmpty = true
	for (const formElement of form)
		if (formElement.type !== "file" && formElement.name)
			if (!formElement.value) {
				isNotEmpty = false;
				break;
			}
	form.elements.namedItem("inscription").disabled = !isNotEmpty
})

form.inscription.addEventListener('change', function() {
	console.log(this.files[0])
	const spliter = "||"

	reader.readAsArrayBuffer(this.files[0]);
	
}, false);