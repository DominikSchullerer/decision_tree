class Node {
    constructor(data, children) {
        this.data = data
        this.children = children
    }

    add(data) {
        this.children.push(new Node(data))
    }
}

class Leave {
    constructor(attribute, status) {
        this.attribute = attribute
        this.status = status
    }
}

class Tree {
    constructor(root) {
        this.root = root
    }
}


function decision_tree(samples, attributes) {
    // Wenn alle Elemente aus T zu einer Klase gehören
    if (areSameClass(samples)) {
        // Erzeuge ein Blatt mit der Klasse als Bezeichner
        return new Leave(attributes[attributes.length - 1], samples[0][samples[0].length - 1])
        //Ansonsten
    } else {
        // Wähle das informativste Merkmal
        let attribute = mostInformativeAttribute(samples)[0]
        let entropy = mostInformativeAttribute(samples)[1]
        // Für alle vorkommenden Werte des Merkmals
        let children = []
        let subSamples = {}
        samples.forEach(sample => {
            if (sample[attribute] in subSamples) {
                let subSample = sample.slice()
                subSample.splice(attribute, 1)
                subSamples[sample[attribute]].push(subSample)
            } else {
                let subSample = sample.slice()
                subSample.splice(attribute, 1)
                subSamples[sample[attribute]] = [subSample]
            }
        });
        
        for (const value in subSamples) {
            // Konstruiere den Entscheidungsbaum einer Teilmenge der Daten
            let next_attributes = attributes.slice()
            next_attributes.splice(attribute, 1)
            children.push(decision_tree(subSamples[value], next_attributes))
        }
        // Konstruiere den Konten des Merkmals
        return new Node([attributes[attribute], entropy], children)
    }
}

function areSameClass(samples) {
    let sampleLength = samples.length
    let areSameClass = true
    let class_type = samples[0][samples[0].length - 1]

    for (let i = 1; i < sampleLength; i++) {
        if (samples[i][samples[i].length - 1] != class_type) {
            areSameClass = false
        }
    }

    return areSameClass
}

function mostInformativeAttribute(samples) {
    let entropy = 2
    let attributeCount = samples[0].length - 1
    let mostInformativeAttribute = NaN

    for (let i = 0; i < attributeCount; i++) {
        let entropyOA = entropyOfAttribute(samples, i)

        if (entropyOA < entropy) {
            mostInformativeAttribute = i
            entropy = entropyOA
        }
    }

    return [mostInformativeAttribute, entropy]
}

function entropyOfAttribute(samples, index) {
    let entropy = 0
    let attributeValues = []
    samples.forEach(sample => {
        if (!attributeValues.includes(sample[index])) {
            attributeValues.push(sample[index])
        }
    });

    for (let i = 0; i < attributeValues.length; i++) {
        let results = {}
        samples.forEach(sample => {
            if (sample[index] == attributeValues[i]) {
                if (sample[sample.length - 1] in results) {
                    results[sample[sample.length - 1]] = results[sample[sample.length - 1]] + 1
                } else {
                    results[sample[sample.length - 1]] = 1
                }
            }
        });

        entropy = entropy + entropyOfHash(results) / samples.length
    }
    return entropy
}

function entropyOfHash(hash) {
    let entropy = 0
    let sum = 0
    for (let [key, value] of Object.entries(hash)) {
        sum = sum + value
    }
    for (let [key, value] of Object.entries(hash)) {
        entropy = entropy - ((value / sum) * Math.log2(value / sum))
    }
    return entropy * sum
}


let samples = []
samples.push([0, 1, 0, 1])
samples.push([1, 0, 0, 1])
samples.push([1, 0, 1, 0])
samples.push([0, 0, 0, 1])
samples.push([0, 0, 1, 0])
samples.push([1, 1, 0, 0])

let tree = new Tree(decision_tree(samples, ["Wind", "Regen", "Schnee", "Rad"]))
console.log("done")