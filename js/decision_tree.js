/* Leaf of the decision tree */
class Leaf {
    constructor(previousDecision, decision, samples) {
        this.previousDecision = previousDecision
        /* Final decision */
        this.decision = decision
        this.samples = samples
        this.sampleQuantity = samples.length
        this.entropy = entropyOf(samples)
    }
}

/* Node of the decision tree */
class Node {
    constructor(previousDecision, attribute, samples, children) {
        this.previousDecision = previousDecision
        /* Attribute of the next decision */
        this.attribute = attribute
        this.samples = samples
        this.sampleQuantity = samples.length
        this.entropy = entropyOf(samples)
        this.children = children
    }
}

/*
Looks for the most informative attribute in a list of samples.
Input: Array of samples
Output: Index of the most informative attribute
*/
function mostInformativeAttribute(samples) {
    /* Initialization. 2 is a upper limit for the calculated entropy */
    let entropy = 2
    let attributeNumber = samples[0].length - 1
    let bestAttributeIndex = NaN

    /* Iterate over all attibutes */
    for (let i = 0; i < attributeNumber; i++) {

        /* Update the index if the current index is more informative */
        let nextEntropy = totalEntropyOfAttribute(samples, i)
        if (nextEntropy < entropy) {
            entropy = nextEntropy
            bestAttributeIndex = i
        }
    }

    /* Return the index of the most informative attribute */
    return bestAttributeIndex
}

/*
Calculate the total entropy for samples after using an attribute for classification.
Input: Array of samples, Index of the used attribute
Output: Calculated Entropy
*/
function totalEntropyOfAttribute(samples, index) {
    /* Initialization */
    let size = samples.length
    let entropy = 0
    let valueKeys = []
    let valueDistribution = {}

    /* Create a list of all classes of the chosen attribute present in samples */
    samples.forEach(sample => {
        if (!valueKeys.includes(sample.at(index))) {
            valueKeys.push(sample.at(index))
        }
    });
    valueKeys.sort()

    /* Create a dictionary using valueKeys and their corresponding samples */
    valueKeys.forEach(key => {
        valueDistribution[key] = []

        samples.forEach(sample => {
            if (sample.at(index) == key) {
                valueDistribution[key].push(sample)
            }
        });
    });

    /* Calculate the entropy */
    for (const key in valueDistribution) {
        let freq = valueDistribution[key].length
        entropy += (freq / size) * entropyOf(valueDistribution[key])
    }

    /* Return the output value */
    return entropy
}

/*
Looks for the most frequent value in an array
Input: Array
Output: Most frequent value
*/
function getMostFrequent(arr) {
    /* Create a map of all values in the input array*/
    let map = arr.reduce((acc, value) => {
        acc[value] = (acc[value] || 0) + 1
        return acc
    }, {})

    /* Determine the most common value und return it */
    return Object.keys(map).reduce((a, b) => map[a] > map[b] ? a : b)
}

/*
Calculates the entropy of an array of Samples.
Input: Array of samples
Output: Entropy 
*/
function entropyOf(samples) {
    /* Initialization */
    let size = samples.length
    let entropy = 0
    let valueKeys = []
    let valueDistribution = {}

    /* Create a list of all final decisions present in samples */
    samples.forEach(sample => {
        if (!valueKeys.includes(sample.at(-1))) {
            valueKeys.push(sample.at(-1))
        }
    });
    valueKeys.sort()

    /* Create a dictionary using valueKeys and their frequency in samples */
    valueKeys.forEach(key => {
        valueDistribution[key] = 0

        samples.forEach(sample => {
            if (sample.at(-1) == key) {
                valueDistribution[key] += 1
            }
        });
    });

    /* Calculate the entropy */
    for (const key in valueDistribution) {
        let freq = valueDistribution[key]
        entropy -= (freq / size) * Math.log2(freq / size)
    }

    /* Return output */
    return entropy
}

/*
Checks if all input samples lead to the same decision
Input: Array of samples
Output: True if all samples lead to the same decision; False if not
*/
function areSameDecision(samples) {
    /* Initialization */
    let areSameDecision = true
    let decision = samples[0].at(-1)

    /* Set the output variable to false if any decision differs from the first one */
    samples.forEach(sample => {
        if (sample.at(-1) !== decision) {
            areSameDecision = false
        }
    });

    /* Return the output variable */
    return areSameDecision
}

/*
Creates a decision tree. Recursive.
Input: Array of samples, array of attributes, String containing the previous Decision
Output: Node that is the root of the decision tree
*/
function decisionTree(samples, attributes, previousDecision = '') {
    /* Basecase: All samples are of the same class */
    if (areSameDecision(samples)) {
        /* Create a Leaf using the common class */
        let decision = attributes.at(-1) + ": " + samples[0].at(-1)
        return new Leaf(previousDecision, decision, samples)
    
    /* Basecase: Only the class attribute is left */
    } else if (attributes.length == 1) {
        /* Determine the most frequent class */
        let values = []
        samples.forEach(sample => {
            values.push(sample.at(-1))
        });
        mostFrequentValue = getMostFrequent(values)
        /* Create a Leaf using the most frequent class */
        let decision = attributes.at(-1) + ": " + mostFrequentValue
        return new Leaf(previousDecision, decision, samples)
    
    /* A recursive call of decisionTree is necessary */
    } else {
        /* Initialization */
        let children = []
        let bestAttributeIndex = mostInformativeAttribute(samples)
        let attribute = attributes[bestAttributeIndex]
        let valueKeys = []
        let valueDistribution = {}

        /* Create a list of all values of the most informative attribute */
        samples.forEach(sample => {
            if (!valueKeys.includes(sample.at(bestAttributeIndex))) {
                valueKeys.push(sample.at(bestAttributeIndex))
            }
        });
        valueKeys.sort()

        /* Create a dictionary using valueKeys and an array of samples classified by the respective key */
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

        /* Create the list of attributes used for the next function call */
        let nextAttributes = attributes.slice()
        nextAttributes.splice(bestAttributeIndex, 1)

        /* Recursive call of decision tree for each value in valueKeys */
        for (const value in valueDistribution) {
            let currentDecision = attribute + ": " + value
            children.push(decisionTree(valueDistribution[value], nextAttributes, currentDecision))
        }

        /* Return the created Node */
        return new Node(previousDecision, attribute, samples, children)
    }
}

/*
Create the HTML representation of a tree and add it to the DOM.
Input: A Node or a Leaf. It is used as the root of the displayed tree.
Output: None.
*/
function treeToHtml(root) {
    /* Initialization */
    const treeContainer = document.getElementById('treeContainer')
    let rootHTML = document.createElement('ul')
    rootHTML.classList.add('tree')

    /* Start the creation of the HTML representation of the tree */
    if (root instanceof Node) {
        rootHTML.appendChild(getNodeHTML(root))
    } else if (root instanceof Leaf) {
        rootHTML.appendChild(getLeafHTML(root))
    }

    /* Delete the previous tree from the DOM and add the new one to the DOM */
    treeContainer.replaceChildren()
    treeContainer.appendChild(rootHTML)
}

/*
Creates the HTML representation of a Node
Input: A Node object
Output: HTML representation of the input
*/
function getNodeHTML(node) {
    /* Create the list element that represents a Node */
    let nodeHtml = document.createElement('li')

    /* Prepare the content span */
    let content = document.createElement('span')
    content.classList.add('node')

    /* Prepare the entries of content */
    let previousDecision = document.createElement('p')
    previousDecision.textContent = String(node.previousDecision)
    let attribute = document.createElement('p')
    attribute.textContent = 'Nächste Entscheidung: ' + String(node.attribute)
    let sampleQuantity = document.createElement('p')
    sampleQuantity.textContent = 'Anzahl der Trainingsdaten: ' + String(node.sampleQuantity)
    let entropy = document.createElement('p')
    entropy.textContent = 'Entropie: ' + String(Math.round(node.entropy*100)/100)

    /* Fill content with its entries */
    content.appendChild(previousDecision)
    content.appendChild(attribute)
    content.appendChild(sampleQuantity)
    content.appendChild(entropy)

    /* Fill the list element with its content */
    nodeHtml.appendChild(content)
    
    /* Prepare the list containing the children of a node */
    let children = document.createElement('ul')

    /* Add the HTML representation of each Child.*/
    node.children.forEach(child => {
        /* If a child is a Node, use a recursive call of getNodeHTML */
        if (child instanceof Node) {
            children.appendChild(getNodeHTML(child))
        /* If a child is a Leaf, use getLeafHTML. Basecase. */
        } else if (child instanceof Leaf) {
            children.appendChild(getLeafHTML(child))
        }
    });

    /* Fill the list element with its children */
    nodeHtml.appendChild(children)

    /* Return the HTML representation of the input */
    return nodeHtml
}

/*
Creates the HTML representation of a Leaf
Input: A Leaf object
Output: HTML representation of the input
*/
function getLeafHTML(leaf) {
    /* Create the list element that represents a Leaf */
    let leafHTML = document.createElement('li')

    /* Prepare the content span */
    let content = document.createElement('span')
    content.classList.add('leaf')

    /* Prepare the entries of content */
    let previousDecision = document.createElement('p')
    previousDecision.textContent = String(leaf.previousDecision)
    let decision = document.createElement('p')
    decision.textContent = 'Getroffene Entscheidung: ' + String(leaf.decision)
    let sampleQuantity = document.createElement('p')
    sampleQuantity.textContent = 'Anzahl der Trainingsdaten: ' + String(leaf.sampleQuantity)
    let entropy = document.createElement('p')
    entropy.textContent = 'Entropie: ' + String(Math.round(leaf.entropy*100)/100)

    /* Fill content with its entries */
    content.appendChild(previousDecision)
    content.appendChild(decision)
    content.appendChild(sampleQuantity)
    content.appendChild(entropy)

    /* Fill the list element with its content */
    leafHTML.appendChild(content)

    /* Return the HTML representation of the input */
    return leafHTML
}

/* Initialization of global variables*/
let tree = undefined
let data = undefined

/* 
Action Listener
Trigger:   Upload of a new file
Execution: Fills data. 
*/
let file = document.getElementById('data')
file.addEventListener("change", function () {
    var reader = new FileReader()
    reader.onload = function() {
    data = this.result.split(/[\n\r]/)
    data = data.filter((str) => str != '')
      }
    reader.readAsText(this.files[0])
});

/* 
Action Listener
Trigger:   Click on drawTree button.
Execution: Creates and displays the tree. 
*/
let drawButton = document.getElementById('drawTree')
drawButton.addEventListener('click', function() {
    /* There is data */
    if (data != undefined) {
        /* Parsing of data */
        let attributes = data[0].split(',')
        let dataWithoutAttributes = data.slice(1, data.length)
        let samples = []
        dataWithoutAttributes.forEach(datum => {
            samples.push(datum.split(','))
        });

        tree = decisionTree(samples, attributes)
        treeToHtml(tree)
    }
})
