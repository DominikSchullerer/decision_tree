let tree = undefined

class Leaf {
    constructor(previousDecision, decision, samples) {
        this.previousDecision = previousDecision
        this.decision = decision
        this.samples = samples
        this.sampleQuantity = samples.length
        this.entropy = entropyOf(samples)
    }
}

class Node {
    constructor(previousDecision, attribute, samples, children) {
        this.previousDecision = previousDecision
        this.attribute = attribute
        this.samples = samples
        this.sampleQuantity = samples.length
        this.entropy = entropyOf(samples)
        this.children = children
    }
}

function mostInformativeAttribute(samples) {
    let entropy = 2
    let attributeNumber = samples[0].length - 1
    let bestAttributeIndex = NaN
    for (let i = 0; i < attributeNumber; i++) {
        nextEntropy = totalEntropyOfAttribute(samples, i)
        if (nextEntropy < entropy) {
            entropy = nextEntropy
            bestAttributeIndex = i
        }
    }

    return bestAttributeIndex
}

function totalEntropyOfAttribute(samples, index) {
    let size = samples.length
    let entropy = 0
    let valueKeys = []
    let valueDistribution = {}

    samples.forEach(sample => {
        if (!valueKeys.includes(sample.at(index))) {
            valueKeys.push(sample.at(index))
        }
    });
    valueKeys.sort()

    valueKeys.forEach(key => {
        valueDistribution[key] = []

        samples.forEach(sample => {
            if (sample.at(index) == key) {
                valueDistribution[key].push(sample)
            }
        });
    });

    for (const key in valueDistribution) {
        let freq = valueDistribution[key].length
        entropy += (freq / size) * entropyOf(valueDistribution[key])
    }

    return entropy
}

function getMostFrequent(arr) {
    const hashmap = arr.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1
        return acc
    }, {})
    return Object.keys(hashmap).reduce((a, b) => hashmap[a] > hashmap[b] ? a : b)
}

function entropyOf(samples) {
    let size = samples.length
    let entropy = 0
    let valueKeys = []
    let valueDistribution = {}

    samples.forEach(sample => {
        if (!valueKeys.includes(sample.at(-1))) {
            valueKeys.push(sample.at(-1))
        }
    });
    valueKeys.sort()

    valueKeys.forEach(key => {
        valueDistribution[key] = 0

        samples.forEach(sample => {
            if (sample.at(-1) == key) {
                valueDistribution[key] += 1
            }
        });
    });

    for (const key in valueDistribution) {
        let freq = valueDistribution[key]
        entropy -= (freq / size) * Math.log2(freq / size)
    }

    return entropy
}

function areSameDecision(samples) {
    let areSameDecision = true
    let decision = samples[0].at(-1)

    samples.forEach(sample => {
        if (sample.at(-1) !== decision) {
            areSameDecision = false
        }
    });

    return areSameDecision
}

function decisionTree(samples, attributes, previousDecision = '') {
    if (areSameDecision(samples)) {
        let decision = attributes.at(-1) + ": " + samples[0].at(-1)
        return new Leaf(previousDecision, decision, samples)
    } else if (attributes.length == 1) {
        let values = []
        samples.forEach(sample => {
            values.push(sample.at(-1))
        });
        mostFrequentValue = getMostFrequent(values)
        let decision = attributes.at(-1) + ": " + mostFrequentValue
        return new Leaf(previousDecision, decision, samples)
    } else {
        let children = []
        let bestAttributeIndex = mostInformativeAttribute(samples)
        let attribute = attributes[bestAttributeIndex]
        let valueKeys = []
        let valueDistribution = {}

        samples.forEach(sample => {
            if (!valueKeys.includes(sample.at(bestAttributeIndex))) {
                valueKeys.push(sample.at(bestAttributeIndex))
            }
        });
        valueKeys.sort()

        valueKeys.forEach(key => {
            valueDistribution[key] = []

            samples.forEach(sample => {
                if (sample.at(bestAttributeIndex) == key) {
                    sampleWithoutAttribute = sample.slice()
                    sampleWithoutAttribute.splice(bestAttributeIndex, 1)
                    valueDistribution[key].push(sampleWithoutAttribute)
                }
            });
        });

        let nextAttributes = attributes.slice()
        nextAttributes.splice(bestAttributeIndex, 1)

        for (const value in valueDistribution) {
            let currentDecision = attribute + ": " + value
            children.push(decisionTree(valueDistribution[value], nextAttributes, currentDecision))
        }

        return new Node(previousDecision, attribute, samples, children)
    }
}

function treeToHtml(root) {
    const treeContainer = document.getElementById('treeContainer')
    let rootHTML = document.createElement('ul')
    rootHTML.classList.add('tree')
    if (root instanceof Node) {
        rootHTML.appendChild(getNodeHTML(root))
    } else if (root instanceof Leaf) {
        rootHTML.appendChild(getLeafHTML(root))
    }
    treeContainer.replaceChildren()
    treeContainer.appendChild(rootHTML)
}

function getNodeHTML(node) {
    let nodeHtml = document.createElement('li')
    let content = document.createElement('span')
    content.classList.add('node')
    let previousDecision = document.createElement('p')
    previousDecision.textContent = String(node.previousDecision)
    let attribute = document.createElement('p')
    attribute.textContent = 'Nächste Entscheidung: ' + String(node.attribute)
    let sampleQuantity = document.createElement('p')
    sampleQuantity.textContent = 'Anzahl der Trainingsdaten: ' + String(node.sampleQuantity)
    let entropy = document.createElement('p')
    entropy.textContent = 'Entropie: ' + String(Math.round(node.entropy*100)/100)
    content.appendChild(previousDecision)
    content.appendChild(attribute)
    content.appendChild(sampleQuantity)
    content.appendChild(entropy)
    nodeHtml.appendChild(content)
    
    let children = document.createElement('ul')
    node.children.forEach(child => {
        if (child instanceof Node) {
            children.appendChild(getNodeHTML(child))
        } else if (child instanceof Leaf) {
            children.appendChild(getLeafHTML(child))
        }
    });

    nodeHtml.appendChild(children)

    return nodeHtml
}

function getLeafHTML(leaf) {
    let leafHTML = document.createElement('li')
    let content = document.createElement('span')
    content.classList.add('leaf')
    let previousDecision = document.createElement('p')
    previousDecision.textContent = String(leaf.previousDecision)
    let decision = document.createElement('p')
    decision.textContent = 'Getroffene Entscheidung: ' + String(leaf.decision)
    let sampleQuantity = document.createElement('p')
    sampleQuantity.textContent = 'Anzahl der Trainingsdaten: ' + String(leaf.sampleQuantity)
    let entropy = document.createElement('p')
    entropy.textContent = 'Entropie: ' + String(Math.round(leaf.entropy*100)/100)
    content.appendChild(previousDecision)
    content.appendChild(decision)
    content.appendChild(sampleQuantity)
    content.appendChild(entropy)

    leafHTML.appendChild(content)

    return leafHTML
}

let file = document.getElementById('data')
let data = undefined

file.addEventListener("change", function () {
    var reader = new FileReader()
    reader.onload = function() {
    data = this.result.split(/[\n\r]/)
    data = data.filter((str) => str != '')
      }
    reader.readAsText(this.files[0])
});

let drawButton = document.getElementById('drawTree')
drawButton.addEventListener('click', function() {
    if (data != undefined) {
        let attributes = data[0].split(',')
        let dataCopy = data.slice(1, data.length)
        let samples = []
        dataCopy.forEach(datum => {
            samples.push(datum.split(','))
        });
        let tree = decisionTree(samples, attributes)
        treeToHtml(tree)
    }
})
