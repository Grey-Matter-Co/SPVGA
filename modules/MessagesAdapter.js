const fs = require("fs");
knowledgePath = '../knowledge.json'
knowledge = require(knowledgePath)

/**
 * @param {String} str1 First string to compare
 * @param {String} str2 Second string to compare
 * @returns {Number} How much costs transform *str1* to *str2*
 */
function editDistance(str1, str2) {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();

    let costs = [];
    for (let i=0; i<=str1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= str2.length; j++) {
            if (i === 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (str1.charAt(i - 1) !== str2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j-1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[str2.length] = lastValue;
    }
    return costs[str2.length];
}

/**
 *
 * @param {String} str1 First stirng to compare
 * @param {String} str2 Second string to compare
 * @returns {Number} porcentual value of similitary about both strings
 */
function similarity(str1, str2) {
    let longer = str1;
    let shorter = str2;
    if (str1.length < str2.length) {
        longer = str2;
        shorter = str1;
    }
    let longerLength = longer.length;
    if (!longerLength)
        return 1.0;
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

module.exports = {
    minApproximation: 0.4,

    /**
     * @param {String} question message which sent the user
     * @returns {String} answer which match with knowledge base or default reply
     */
    findAnswer(question) {
        let maxAprox = 0, idx = -1
        for (let asnwer in knowledge) {
            let aprox = similarity(question, asnwer)

            if (aprox > maxAprox) {
                maxAprox = aprox
                idx = asnwer
            }
        }

        console.log(`${question} -> max ${idx}[${maxAprox}]`);

        if (maxAprox >= this.minApproximation)
            return knowledge[idx]


        knowledge["☺_Sin responder_☺"].push(question)
        fs.writeFile(knowledgePath, JSON.stringify(knowledge, null, 2), err => {
            if (err) {
                console.error("Problemas al añadir nuevas preguntas a la base", err);
                return
            }
            console.info("Pregunta añadida a la base de conocimientos")
        })
        return "No puedo responder a eso"
    },
}