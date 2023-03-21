class Leave {
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
        this.children = children
        this.sampleQuantity = samples.length
        this.entropy = entropyOf(samples)
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

function decisionTree(samples, attributes, previousDecision) {
    if (areSameDecision(samples)) {
        let decision = attributes.at(-1) + ": " + samples[0].at(-1)
        return new Leave(previousDecision, decision, samples)
    } else if (attributes.length == 1) {
        let values = []
        samples.forEach(sample => {
            values.push(sample.at(-1))
        });
        mostFrequentValue = getMostFrequent(values)
        let decision = attributes.at(-1) + ": " + mostFrequentValue
        return new Leave(previousDecision, decision, samples)
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
    
}

samples = []
samples.push(["nein", "ja", "nein", "ja"])
samples.push(["ja", "nein", "nein", "ja"])
samples.push(["ja", "nein", "ja", "nein"])
samples.push(["nein", "nein", "nein", "ja"])
samples.push(["nein", "nein", "ja", "nein"])
samples.push(["ja", "ja", "nein", "nein"])

let tree = decisionTree(samples, ["Wind", "Regen", "Schnee", "Fahrrad"], "")
console.log("done")