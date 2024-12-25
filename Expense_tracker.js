import fs from "fs";
import inquirer from "inquirer";
import chalk from "chalk";
import { v4 as uuidv4 } from "uuid";



/**
 * Loads all expenses from the Expenses.json file.
 * If the file does not exist, returns an empty array.
 * @returns {Array} An array of expense objects.
 */

// Function to load expenses
const loadExpenses = () => {
  try {
    const data = fs.readFileSync('Expenses.json', 'utf8');
    if (!data) {
      //console.log('No data found. Returning empty expenses list.');
      return []; // Return an empty array if the file is empty
    }
    return JSON.parse(data); // Parse the JSON if it exists
  } catch (error) {
    //console.error(`Error loading expenses: ${error.message}`);
    return []; // Return an empty array if parsing fails
  }
};



/**
 * Saves the expenses array to the Expenses.json file.
 * @param {Array} expenses - The list of expenses to save.
 */

/**
 * const saveExpenses = (expenses) => {
    const data = JSON.stringify(expenses, null, 2); // Convert expenses to JSON
    fs.writeFile('Expenses.json', data, (err) => {
      if (err) {
        console.error('Error saving expenses:', err);
      } else {
        console.log('\nExpenses saved successfully!');
      }
    });
  };
  
 * @param {*} expenses 
 */

  const saveExpenses = (expenses) => {
    // Read the existing data from the file if it exists
    fs.readFile('Expenses.json', 'utf8', (err, data) => {
      if (err && err.code !== 'ENOENT') {  // If the error is not 'file not found'
        console.error('Error reading expenses:', err);
        return;
      }
  
      // Parse the existing data if the file exists, else initialize an empty array
      let existingExpenses = [];
      if (data) {
        try {
          existingExpenses = JSON.parse(data);
        } catch (parseErr) {
          console.error('Error parsing expenses data:', parseErr);
          return;
        }
      }
  
      // Append the new expenses to the existing list
      existingExpenses = [...existingExpenses, ...expenses];
  
      // Convert the updated list back to JSON
      const updatedData = JSON.stringify(existingExpenses, null, 2);
  
      // Save the updated expenses list back to the file
      fs.writeFile('Expenses.json', updatedData, (writeErr) => {
        if (writeErr) {
          console.error('Error saving expenses:', writeErr);
        } else {
          console.log('Expenses saved successfully!');
        }
      });
    });
  };
  


const listExpenses = (Expenses) => {
    // this prints a green color for the display 
    console.log(chalk.green("\nYour Expenses List:"));
    if (Expenses.length === 0) {
        console.log(chalk.red("No expense found..."))
        return;
    }


    Expenses.forEach((Expense, index) => {
        console.log(
            `${index + 1}. ${chalk.blue(Expense.description)} | Amount: ${chalk.yellow(
                `${Expense.amount} ${Expense.currency}`
            )} | Date: ${chalk.cyan(Expense.date)} | ID: ${chalk.grey(Expense.id.slice(0,8))}`
        );
    });

};



const mainMenu = async ()=>{
    // load data from the task.json script above.
    const expenses =loadExpenses();

// display the menu and get the user's choice
    //Inquirer library to ask users questions and wait for their answers.
    const answers = await inquirer.prompt([ 
        {
            type:"list", //show a list of Expenses.
            name:"action",//action to perform.
            message:"what do you want to do ? \n Drop down Menu:", // prompt.
            choices: ["Add Expense", "View Expenses", "Delete Expense", "calculate total", "Exit"], // Options to choose from.
        },

    ]);


    //using switch statment to perform the action based on the users choice.
    switch(answers.action){

        case "Add Expense":
            await addExpense(expenses); // adding a new task
            break;
        case "View Expenses":
            await viewExpenses(expenses); // Display all expenses
            break;
        case "Delete Expense":
            await deleteExpense(expenses); //Delete an expense.
        case "calculate total":
            await calculateTotal(expenses); // Calculate total expense.
        case "Exit":
            console.log(chalk.green("Exiting the program..."));
            process.exit(); //This exit the program.
    }

    mainMenu();
};



// add a new expense.
const addExpense = async (Expenses) => {
    const answer = await inquirer.prompt([
        {
            type: "input",
            name: "description",
            message: "Enter the expense description",
        },
        {
            type: "input",
            name: "amount",
            message: "Enter the expense amount:",
            validate: (input) => {
              if (isNaN(input) || Number(input) <= 0) {
                return "Please enter a valid positive number.";
              }
              return true;
            },
          }, 
        
          {
            type: "list",
            name: "currency",
            message: "Select the currency:",
            choices: ["USD ($)", "EUR (€)", "GBP (£)", "JPY (¥)", "INR (₹)", "AUD (A$)", "CAD (C$)"],
          },
    ]);

    const newExpense = {
        id: uuidv4(),
        description: answer.description,
        amount: parseFloat(answer.amount),
        currency: answer.currency,
        // converts date to string and extract only the first 10 characters
        date: new Date().toISOString().slice(0, 10),
    };

    Expenses.push(newExpense);
    saveExpenses(Expenses);
    console.log(chalk.green("Expense added successfully!"));
};


//View expenses with the option to view all at once or view a specific expense......

const viewExpenses = async (Expenses) => {
    const answer = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "Do you want to view all expenses or a specific expense?",
            choices: ["All Expenses", "Specific Expense"],
        },
    ]);

    if (answer.action === "All Expenses") {
        // display all expenses
        listExpenses(Expenses);
        return mainMenu();
    } else {
        const answer = await inquirer.prompt([
            {
                type: "input",
                name: "index",
                message: "Enter the index of the expense you want to view",
            },
        ]);

        const index = parseInt(answer.index) - 1;
        if (index >= 0 && index < Expenses.length) {
            console.log(chalk.green(`Expense: ${Expenses[index].description}`));
            console.log(chalk.green(`Amount: ${Expenses[index].amount}`));
            console.log(chalk.green(`Date: ${Expenses[index].date}`));
        } else {
            console.log(chalk.red("Invalid index."));
        }

        return mainMenu();
    }
};
      


//Delete an expense....
const deleteExpense = async (Expenses) => {
    if (Expenses.length === 0) {
        console.log(chalk.red("No expenses to delete..."));
        return mainMenu(); // Return to the main menu if no expenses exist
    }

    const answer = await inquirer.prompt([
        {
            type: "list",
            name: "deleteOption",
            message: "Select an option:",
            choices: [
                "Delete a specific expense",
                "Delete all expenses",
                "Go back to the main menu"
            ],
        },
    ]);

    if (answer.deleteOption === "Delete a specific expense") {
        // Prompt the user to select the specific expense to delete
        const expenseToDelete = await inquirer.prompt([
            {
                type: "list",
                name: "selectedExpense",
                message: "Select the expense you want to delete:",
                choices: Expenses.map((expense) => ({
                    name: `${expense.description} (ID: ${expense.id})`,
                    value: expense.id, // Use the expense ID as the value
                })),
            },
        ]);

        // Remove the selected expense from the array
        const updatedExpenses = Expenses.filter(
            (expense) => expense.id !== expenseToDelete.selectedExpense
        );

        // Save updated array to the file
        fs.writeFileSync('Expenses.json', JSON.stringify(updatedExpenses, null, 2));
        console.log(chalk.green("Expense deleted successfully!"));

        return mainMenu(); // Return to the main menu
    }

    if (answer.deleteOption === "Delete all expenses") {
        // Confirm the action with the user
        const confirmation = await inquirer.prompt([
            {
                type: "confirm",
                name: "confirmDeleteAll",
                message: "Are you sure you want to delete all expenses?",
                default: false,
            },
        ]);

        if (confirmation.confirmDeleteAll) {
            // Save an empty array to the file to clear all expenses
            fs.writeFileSync('Expenses.json', JSON.stringify([], null, 2));
            console.log(chalk.green("All expenses have been deleted successfully!"));
        } else {
            console.log(chalk.yellow("No expenses were deleted."));
        }

        return mainMenu(); // Return to the main menu
    }

    if (answer.deleteOption === "Go back to the main menu") {
        // Simply call the mainMenu function to return
        return mainMenu();
    }

    mainMenu(); // Fallback to the main menu if no action is performed
};



// calculate total expense
const calculateTotal = async (Expenses) => {
    let total = 0;
    Expenses.forEach((expense) => {
        total += expense.amount;
    });
    console.log(chalk.green(`Total expense: ${total}`));
};


mainMenu();



