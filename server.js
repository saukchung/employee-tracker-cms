const mysql = require('mysql2');
const cTable = require('console.table');
const { prompt } = require("inquirer");
require('dotenv').config()


// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME
  },
  console.log(`Connected to the cms_db database.`)
);

//Options available to users
const options = ["view all departments", "view all roles", "view all employees", "add a department", "add a role", "add an employee", "update an employee role", "quit"];


// MAIN function that starts the user interactions
const init = async () => {
  const ansMenu = await prompt({ type: "list", name: "userChoice", message: "What would you like to do?", choices: options });

  // SHOWS TABLE OF ALL DEPARTMENTS
  if (ansMenu.userChoice === "view all departments") {
    db.query(`SELECT * FROM departments`, (err, result) => {
      if (err) {
        console.log(err);
      }
      console.table(`

    All Departments`, result);
    })
  };

  // SHOWS TABLES OF ALL ROLES
  if (ansMenu.userChoice === "view all roles") {
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

  // SHOWS TABLES OF ALL EMPLOYEES
  if (ansMenu.userChoice === "view all employees") {
    db.query(`SELECT employees.id AS id, 
    employees.first_name AS "first name", 
    employees.last_name AS "last name", 
    roles.title AS title, 
    departments.dep_name AS department, 
    roles.salary AS salary, 
    CONCAT(manager.first_name, ' ', manager.last_name) as manager 
    
    FROM employees JOIN roles ON employees.role_id = roles.id
    JOIN departments ON roles.department_id = departments.id 
    LEFT JOIN employees AS manager ON employees.manager_id = manager.id `, (err, result) => {
      if (err) {
        console.log(err);
      }
      console.table(`
    
    All Employees`, result);
    })
  };

  // ADDS A DEPARTMENT
  if (ansMenu.userChoice === "add a department") {
    const ans = await prompt({ type: "input", name: "newDepartment", message: "What is the name of the new department?" });
    db.query(`INSERT INTO departments (dep_name) VALUES ("${ans.newDepartment}")`, (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log(`New department ${ans.newDepartment} has been added!`);
    })
  };

  // ADDS A ROLE
  if (ansMenu.userChoice === "add a role") {
    const depOptionsArr = [];
    db.query('SELECT * FROM departments', async (err, result) => {
      if (err) {
        console.log(err);
      }
      for (i = 0; i < result.length; i++) {
        depOptionsArr.push({ name: result[i].dep_name, value: result[i].id })
      }
    })


    const ansAddDep = await prompt([
      { type: "input", name: "newRoleTitle", message: "What is the title of the new role?" },
      { type: "input", name: "newRoleSalary", message: "What is the salary of the new role?" },
      { type: "list", name: "newRoleDepartment", choices: depOptionsArr, message: "Which department does this role belong to?" }
    ]);


    db.query(`INSERT INTO roles (title, department_id, salary) VALUES ("${ansAddDep.newRoleTitle}", ${ansAddDep.newRoleDepartment}, ${ansAddDep.newRoleSalary})`, (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log(`New role ${ansAddDep.newRoleTitle} has been added!`);
    })
  };

  // ADDS A EMPLOYEE
  if (ansMenu.userChoice === "add an employee") {
    const roleOptionsArr = [];
    db.query('SELECT * FROM roles', async (err, result) => {
      if (err) {
        console.log(err);
      }
      for (i = 0; i < result.length; i++) {
        roleOptionsArr.push({ name: result[i].title, value: result[i].id })
      }
    })

    const managerOptionsArr = [];
    db.query(`
    SELECT employees.id AS id, 
    CONCAT(employees.first_name, ' ', employees.last_name) as "manager"
    FROM employees
    `, async (err, result) => {
      if (err) {
        console.log(err);
      }
      managerOptionsArr.push({ name: "No Manager", value: null })
      for (i = 0; i < result.length; i++) {
        managerOptionsArr.push({ name: result[i].manager, value: result[i].id })
      }
    })

    const ansAddDep = await prompt([
      { type: "input", name: "newEmployeeFirstName", message: "What is the new employee's first name?" },
      { type: "input", name: "newEmployeeLastName", message: "What is the new employee's last name?" },
      { type: "list", name: "newEmployeeRole", choices: roleOptionsArr, message: "Which role does this new employee belong to?" },
      { type: "list", name: "newEmployeeManager", choices: managerOptionsArr, message: "Which manager does this new employee belong to?" }
    ]);


    db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ("${ansAddDep.newEmployeeFirstName}", "${ansAddDep.newEmployeeLastName}", ${ansAddDep.newEmployeeRole}, ${ansAddDep.newEmployeeManager})`, (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log(`New employee ${ansAddDep.newEmployeeFirstName} ${ansAddDep.newEmployeeLastName} has been added!`);
    })
  };

  // // UPDATE AN EMPLOYEE ROLE
  // if (ansMenu.userChoice === "update an employee role") {
  //   db.query(`SELECT id AS value, CONCAT(employees.first_name, ' ', employees.last_name) as name FROM employees`, async (err, employees) => {
  //     if (err) {
  //       console.log(err);
  //     } 

  //     db.query('SELECT id AS value, title AS name FROM roles', async (err, roles) => {
  //       if (err) {
  //         console.log(err);
  //       }

  //       prompt([
  //         { type: "list", name: "targetEmployee", choices: employees, message: "Which employee's role do you want to update?" },
  //         { type: "list", name: "targetRole", choices: roles, message: "Which role do you want to assign the selected employee?"},
  //       ])

  //     //   db.query(`INSERT INTO roles (title, department_id, salary) VALUES ("${ansAddDep.newRoleTitle}", ${ansAddDep.newRoleDepartment}, ${ansAddDep.newRoleSalary})`, (err, result) => {
  //     //     if (err) {
  //     //       console.log(err);
  //     //     }
  //     //     console.log(`New department ans has been added!`);

  //     //   })
  //     })
  //   })
  // };

  // QUIT
  if (ansMenu.userChoice === "quit") return console.log("Good Bye")
  init();
};


// Function is called here
init();
