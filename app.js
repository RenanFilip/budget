//budget controller
var budgetController = (function() {
    var Expense = function(id, description, value) {
        this.id = id
        this.description = description
        this.value = value
        this.percentage = -1
    }

    Expense.prototype.calcPercentages = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage
    }

    var Income = function(id, description, value) {
        this.id = id
        this.description = description
        this.value = value
    }

    var calculateTotal = function(type) {
        var sum = 0
        data.allItems[type].forEach(function(cur) {
            sum += cur.value
        })
        data.totals[type] = sum
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, des, val) {
            var newItem, ID
            //criar novo ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0
            }
            //criar novo item baseado no tipo 'inc' ou 'exp'
            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if(type === 'inc'){
                newItem = new Income(ID, des, val)
            }
            //colocar na estrutura
            data.allItems[type].push(newItem)
            //retornar um novo elemento
            return newItem
        },
        deleteItem: function(type, id) {
            var ids, index
            ids = data.allItems[type].map(function(current) {
                return current.id
            })
            index = ids.indexOf(id)
            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },
        calculateBudget: function() {
            //calcular as despesas e os lucros totais
            calculateTotal('exp')
            calculateTotal('inc')

            //calcular as despesas: lucros - gastos
            data.budget = data.totals.inc - data.totals.exp

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100)
            } else {
                data.percentage = -1
            }
        },
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentages(data.totals.inc)
            })
        },
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage()
            })
            return allPerc
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function() {
            console.log(data)
        }
    }
})();

//UI controller
var UIController = (function() {
    var typeInput = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    var formatNumber = function(num, type){
        var numSplit, int, dec
        num = Math.abs(num)
        num = num.toFixed(2)
        numSplit = num.split('.')
        int = numSplit[0]
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)//input 23510, output 23,510
        }
        dec = numSplit[1]

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec
    }
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    }
    return {
        addInput: function() {
            return {
                type: document.querySelector(typeInput.inputType).value,
                description: document.querySelector(typeInput.inputDescription).value,
                value: parseFloat(document.querySelector(typeInput.inputValue).value)
            }
        },
        addListItem: function(obj, type) {
            var html, newHtml, element
            //Create HTML string with placeholder text
            if (type === 'inc') {
                element = typeInput.incomeContainer

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if(type === 'exp'){
                element = typeInput.expensesContainer

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%description%', obj.description)
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type))
            //insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID)
            el.parentNode.removeChild(el)

        },
        clearFields: function() {
            var fields, fieldsArr
            fields = document.querySelectorAll(typeInput.inputDescription + ', ' + typeInput.inputValue)
            fieldsArr = Array.prototype.slice.call(fields)

            fieldsArr.forEach(function(current, index, array) {
                current.value = ""
            })

            fieldsArr[0].focus()
        },
        displayBudget: function(obj) {
            var type
            obj.budget > 0 ? type = 'inc' : type = 'exp'
            document.querySelector(typeInput.budgetLabel).textContent = formatNumber(obj.budget, type)
            document.querySelector(typeInput.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc')
            document.querySelector(typeInput.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp')

            if (obj.percentage > 0) {
                document.querySelector(typeInput.percentageLabel).textContent = obj.percentage + '%'
            } else {
                document.querySelector(typeInput.percentageLabel).textContent = '---'
            }
        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(typeInput.expensesPercentageLabel)

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%'
                } else {
                    current.textContent = '---'
                }
            })
        },
        displayMonth: function() {
            var now, year, month, months
            var now = new Date()
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = now.getMonth()
            year = now.getFullYear()
            document.querySelector(typeInput.dateLabel).textContent = months[month] + ' ' + year
        },
        changeType: function() {
            var fields = document.querySelectorAll(
                (typeInput.inputType + ',' +
                typeInput.inputDescription + ',' +
                typeInput.inputValue)
            )
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus')
            })
            document.querySelector(typeInput.inputButton).classList.toggle('red')
        },
        DOMselect: function() {
            return typeInput
        }
    }
})();

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    var DOM = UICtrl.DOMselect()

    var setupEventListener = function() {
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem)
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem()
            }
        })
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType)
    }

    var updateBudget = function() {
        //1. Calcular as finanças
        budgetCtrl.calculateBudget()
        //2. Retornar as finanças
        var budget = budgetCtrl.getBudget()
        //3. Mostrar a despesas na UI
        UICtrl.displayBudget(budget)
    }
    var updatePercentages = function() {
        //1. calcular porcentagem
        budgetCtrl.calculatePercentages()
        //2. Ler a porcentagem de budget controller
        var percentages = budgetCtrl.getPercentages()
        //3. Atualizar UI com a nova porcentagem
        UICtrl.displayPercentages(percentages)
    }
    var ctrlAddItem = function() {
        var input, newItem
        input = UICtrl.addInput()
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            newItem = budgetCtrl.addItem(input.type, input.description, input.value)
            UICtrl.addListItem(newItem, input.type)
            UICtrl.clearFields()
            updateBudget()
            updatePercentages()
        }
    }
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id
        if (itemID) {
            //inc-1
            splitID = itemID.split('-')
            type = splitID[0]
            ID = parseInt(splitID[1])
            budgetCtrl.deleteItem(type, ID)
            UICtrl.deleteListItem(itemID)
            updateBudget()
            updatePercentages()
        }
    }
    return {
        init: function() {
            console.log('Iniciou o aplicativo!')
            UICtrl.displayMonth()
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            return setupEventListener()
        }
    }
})(budgetController, UIController);

controller.init()
