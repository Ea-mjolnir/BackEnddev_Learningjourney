//Import the file system 'fs' module to read/write 
//const fs = require("fs");
import fs from "fs";

//Inquirer library to ask users questions and wait for their answers.
//const inquirer =require("inquirer");
import inquirer from "inquirer";

 // import the 'chalk' module for styling terminal output with color.
//const chalk =require("chalk");
import chalk from "chalk";

//Function to load task from the task.json file
const loadTasks = ()=>{
    try{
        // Read the file contents
        const dataBuffer =fs.readFileSync("tasks.json");
        return JSON.parse(dataBuffer);
    }
    catch (error) {
        [];
      }

}     


/**
 * we have to save the task to the tasks.json file.
 * this function below overwrites the file with the updated tasks.
 * @param{Array} tasks - the list of tasks to save.
 */

const saveTasks= (tasks)=>{
    fs.writeFileSync("tasks.json",JSON.stringify(tasks,null,2));
};


/**
 * Display all task in a user-friendly format
 * Tasks are shown with thier status (Pending or Completed) and index
 * @param{Array} tasks - The list of tasks to display 
 */

const listTasks=(tasks)=>{
    // this prints a blue color for the display 
    console.log(chalk.blue("\nYour To-Do List:"));
    if(tasks.length===0){
        console.log(chalk.yellow("no task found..."))
        return;
    }
    

    tasks.forEach((tasks,index)=>{
        const status = tasks.completed ? chalk.green("[Completed]") : chalk.red("[Pending]");
        console.log(`${index+1}.${status} ${tasks.description}`)
    });

};


/**
 * Main menu function that prompts the user for an action. 
 * Depending on the user's choice, it calls the relevant fucntion 
 */

const mainMenu = async ()=>{
    // load data from the task.json script above.
    const tasks =loadTasks();

    //Inquirer library to ask users questions and wait for their answers.
    const answers = await inquirer.prompt([ 
        {
            type:"list", //show a list of options.
            name:"action",//store the selected action.
            message:"what do you want to do", // prompt.
            choices: ["Add Task", "List Tasks", "Mark Task as Completed", "Delete Task", "Exit"], // Options to choose from.
        },

    ]);


    //using switch statment to perform the action based on the users choice.
    switch(answers.action){

        case "Add Task":
            await addTask(tasks); // adding a new task
            break;
        case "List Tasks":
            await listTasks(tasks); // Display all tasks
            break;
        case "Mark Task as Completed":
            await completeTask(tasks); //Mark a task as completed.
        case "Delete Task":
            await deleteTask(tasks); // Delete a task.
        case "Exit":
            console.log(chalk.green("Goodbye!"));
            process.exit(); //This exit the program.
    }

    mainMenu();
};


// Add a New task.
const addTask =async(tasks)=>{
    const answer = await inquirer.prompt([
        {
            type: "input",
            name: "description",
            message: "Enter the task despcription",
        },
    ]);

    tasks.push({description: answer.description, completed: false});
    saveTasks(tasks);
    console.log(chalk.green("Task added successfully!"));

};

//Mark a task as completed
const completeTask = async (tasks)=>{
    if(tasks.length===0){
        console.log(chalk.red("No tasks available."));
        return;
    }

    const answer=await inquirer.prompt([
        {
            type:"list",
            name: "task",
            message:"Select a task to mark as completed:",
            choices: tasks.map((task, index)=>`${index+1}.${task.description}`)
        },

    ]);

    const taskIndex=parseInt(answer.task.split(".")[0])-1;
    tasks[taskIndex].completed=true;
    saveTasks(tasks);
    console.log(chalk.green("Task marked as completed!"));

};


//Delete a task
const deleteTask =async (tasks)=>{

    if(tasks.length===0){
        console.log(chalk.red("No tasks available."));
        return;
    }
    
    const answer = await inquirer.prompt([
        {
            type:"list",
            name:"task",
            message: "Select a task to delete:",
            choices: tasks.map((task, index)=>`${index+1}.${task.description}`)
        },
    ]);

    const taskIndex = parseInt(answer.task.split(".")[0]) -1;
    tasks.splice(taskIndex,deleteCount=1);
    saveTasks(tasks);
    console.log(chalk.green("Task deleted successfully!..."));

};

mainMenu();


