//BUDGET CONTROLLER

var budgetController = (function(){

	var Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;

	};

	Expense.prototype.calcPercentage = function(totalIncome)
	{
		if(totalIncome > 0)
		{
			this.percentage = (this.value / totalIncome)*100;
			this.percentage = this.percentage.toFixed(2);
		}
		else
		{
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function(){
		return this.percentage;

	};
	
	var Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;

	};

	var calculateTotal = function(type){

		var sum = 0;
		data.allItems[type].forEach(function(cur){
			sum += cur.value;
		});
		data.totals[type] = sum;
	}

	var data = {
		allItems : {
			exp : [],
			inc : []
		},
		totals : {
			exp : 0,
			inc : 0
		},
		savings : 0,
		percentage : 0
	}

	return{
		addItem  : function(type, desc, val){
			var newItem, ID;

			//create new ID
			if(data.allItems[type].length > 0){
				ID = data.allItems[type][data.allItems[type].length-1].id + 1;
			}
			else{
				ID = 0;
			}
			
			//create new item based on type
			if(type === 'exp'){
				newItem = new Expense(ID, desc, val);	
			}
			else if(type === 'inc'){
				newItem = new Income(ID, desc, val);
			}

			//push it into data structure
			data.allItems[type].push(newItem);

			//return the new element
			return newItem;
			
		},

		deleteItem : function(type, id){

			var ids, index;

			// data.allItems[type] is Obj(id, description, value) Array

			ids = data.allItems[type].map(function(current){
				return current.id;
			});

			index = ids.indexOf(id);

			if(index !== -1)
			{
				data.allItems[type].splice(index, 1);
			}

		},



		calculateBudget: function(){

			// calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// calculate savings
			data.savings = data.totals.inc - data.totals.exp;

			// calculate the expense percentage
			if(data.totals.inc > 0)
			{
				data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);	
			}
			else
			{
				data.percentage = -1;
			}
			
		},

		calculatePercentages : function(){

			data.allItems.exp.forEach(function(cur){
				cur.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function(){
			var allPerc = data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			});
			return allPerc;
		},

		getBudget : function(){
			return{
				savings : data.savings,
				totalInc : data.totals.inc,
				totalExp : data.totals.exp,
				percentage : data.percentage
			};
		},

		testing : function(){
			console.log(data);
		}

	};

})();


// UI CONTROLLER
var UIController = (function(){

	var DOMstrings = {
		inputType : '.add__type',
		inputDesc : '.add__description',
		inputValue : '.add__value',
		inputButton : '.add__btn',
		incomeContainer : '.income__list',
		expenseContainer : '.expenses__list',
		budgetLabel : '.budget__value',
		incomeLabel : '.budget__income--value',
		expenseLabel : '.budget__expenses--value',
		percentageLabel : '.budget__expenses--percentage',
		container : '.container',
		expPerctLabel : '.item__percentage',
		dateLabel : '.budget__title--month',

	};

	var formatNumber = function(num, type){
		var numSplit, int, dec, sign;

		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');

		int  = numSplit[0];
		dec = numSplit[1];

		len = int.length;

		// Formatting the integer part
		
		if(len > 3){
			var newInt = "";
			q = parseInt(len/3);
			var tempInt = int;

			if(len-(q*3) > 0)
				newInt = tempInt.substr(0, len-(q*3))+',';

			var l = len - q*3;

			for(var i = l; i < len; i = i+3){
				newInt += tempInt.substr(i,3)

				if(i+4 < len)
					newInt += ',';
			}

			int = newInt;
				
		}

		type === 'exp' ? sign = '-' : sign = '+';

		return sign+' '+ int +'.'+ dec;

	}

	return{

		getInput : function(){

			return{

				type : document.querySelector(DOMstrings.inputType).value, // inc or exp
				desc : document.querySelector(DOMstrings.inputDesc).value,
				val :  parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};

		},

		addListItem : function(obj, type){

			// create HTML string with placeholder text

			if(type === 'inc'){

				element = DOMstrings.incomeContainer;

				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
	
			}else if(type === 'exp'){

				element = DOMstrings.expenseContainer;

				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
 	
			}
			
			
			// Replace the placeholder text with actual data

			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// Insert the HTML into the DOM

			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem : function(selectorID){

			var targetElement, parentNode;

			targetElement = document.getElementById(selectorID);
			parentNode = targetElement.parentNode;

			parentNode.removeChild(targetElement);
		},

		clearFields : function(){
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDesc + "," + DOMstrings.inputValue);
			fieldsArr = Array.prototype.slice.call(fields);

			
			fieldsArr.forEach(function(current, index, array){

				current.value = ""; // or array[index].value = ""
			});

			fieldsArr[0].focus();
		},

		getDOMstrings: function() {

			return DOMstrings;

		},

		displayBudget : function(budget){
			var type;

			(budget.savings > 0) ? type = 'inc' : type = 'exp';

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(budget.savings, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(budget.totalInc, 'inc');
			document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(budget.totalExp, 'exp');
			

			if(budget.percentage > 0){
				document.querySelector(DOMstrings.percentageLabel).textContent = budget.percentage+"%";	
			}
			else{
				document.querySelector(DOMstrings.percentageLabel).textContent = "--";
			}
		},

		displayPercentages : function(percentages){

			var fields = document.querySelectorAll(DOMstrings.expPerctLabel);

			var nodeListForEach = function(list, callback){

				for(var i = 0; i < list.length; i++){
					callback(list[i], i);
				}
			}

			nodeListForEach(fields, function(current, index){

				if(percentages[index] > 0){
					current.textContent = percentages[index] + "%";
				}
				else
				{
					current.textContent = "--";
				}
			});

		},

		displayMonth : function(){
			var now, year, month;

			now = new Date();
			year = now.getFullYear();
			month = now.getMonth();

			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

			document.querySelector(DOMstrings.dateLabel).textContent = months[month]+' '+ year;
		},

		changeType : function(){
			var fields = document.querySelectorAll(DOMstrings.inputType+","+DOMstrings.inputDesc+","+DOMstrings.inputValue);

			fields.forEach(function(current){
				current.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputButton).classList.toggle('red');

		},

		
	};

})();



// GLOBAL APP CONTROLLER
var appController = (function(budgetCtrl, UICtrl){


	var setupEventListeners = function() {

			var DOM = UICtrl.getDOMstrings();

			// To Add an element 
			document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

			document.addEventListener('keypress', function(event) {

				if(event.keyCode === 13 || event.which === 13){

					ctrlAddItem();
				} 
			});

			// To delete an element

			document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

			document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);


	};


	var updateBudget = function(){

		// 1. Calculate the budget

		budgetCtrl.calculateBudget();

		// 2. Retrun the budget
		var budget = budgetCtrl.getBudget();

		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);

	};

	var updateExpPercentages = function(){

		// 1. Calculate Percentages
		budgetCtrl.calculatePercentages();

		// 2. Read Percentages from budgetController

		var percentages = budgetCtrl.getPercentages();

		// 3. Update the UI with new percentages
		UICtrl.displayPercentages(percentages);
	};


	var ctrlAddItem = function(){

		var input, newItem;

		// 1. Get the field input data

		input = UICtrl.getInput();

		if(input.desc != "" && !isNaN(input.val) && input.val > 0)
		{
			// 2. Add the item to the budget controller

			newItem = budgetCtrl.addItem(input.type, input.desc, input.val);


			// 3. Add the item to te UI

			UICtrl.addListItem(newItem, input.type);

			// 4. Clear the fields

			UICtrl.clearFields();

			// 5. calculate and Update the budget

			updateBudget();	

			// 6. calculate and update percentages
			updateExpPercentages();
		}

	};

	var ctrlDeleteItem = function(event){

		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if(itemID){

			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			// delete the item from data structure

			budgetCtrl.deleteItem(type, ID);

			// delete the item from UI

			UICtrl.deleteListItem(itemID);

			// Update the UI and Budget

			updateBudget();

			// 6. calculate and update percentages
			updateExpPercentages();

		}


	};	 

	return {
		init : function() {
			//console.log('Application has started');
			setupEventListeners();

			UICtrl.displayMonth();

			// Initialize the UI to zero
			UICtrl.displayBudget({
				savings : 0,
				totalInc : 0,
				totalExp : 0,
				percentage : -1
			});
		}
	};

})(budgetController,UIController);

appController.init();