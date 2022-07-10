const express = require('express');
// Import and require mysql2
const mysql = require('mysql2');
const cTable = require('console.table');
const { prompt } = require("inquirer");

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // MySQL password
    password: 'whatismypassword',
    database: 'cms_db'
  },
  console.log(`Connected to the courses_db database.`)
);

const options = ["view all departments", "view all roles", "view all employees", "add a department", "add a role", "add an employee", "update an employee role"];

const init = async () => {
  const ans = await prompt({type: "list", name: "userChoice", message: "What would you like to do?", choices: options});
  
  if (ans.userChoice === "view all departments") {
    db.query(`SELECT * FROM departments`, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.table(`

    All Departments`, result);
    })
  };

  if (ans.userChoice === "view all roles") {
    db.query(`SELECT roles.id AS id, 
    roles.title AS role, roles.salary AS salary, 
    departments.dep_name AS department 
    
    FROM roles JOIN departments ON roles.department_id = departments.id`, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.table(`
    
    All Roles`, result);
  })
  };

  if (ans.userChoice === "view all employees") {
    db.query(`SELECT employees.id AS id, 
    employees.first_name AS "first name", 
    employees.last_name AS "last name", 
    roles.title AS title, 
    departments.dep_name AS department, 
    roles.salary AS salary, 
    manager.first_name as manager 
    
    FROM employees JOIN roles ON employees.role_id = roles.id
    JOIN departments ON roles.department_id = departments.id 
    JOIN employees AS manager ON employees.manager_id = manager.id `, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.table(`
    
    All Employees`, result);
  })
  };


init();
};

init();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
