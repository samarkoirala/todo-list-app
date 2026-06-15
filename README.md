# To-Do List App

A beginner full-stack project for creating, viewing, completing, and deleting tasks.

## Features

- Add tasks
- Mark tasks complete or incomplete
- Delete tasks
- Save tasks permanently in PostgreSQL
- Validate input and display helpful messages
- Test the API automatically

## Run the App

```powershell
npm.cmd start
```

Then visit `http://localhost:3000`.

## Database

The app requires a PostgreSQL connection string:

```powershell
$env:DATABASE_URL="postgresql://username:password@localhost:5432/todo_list"
```

For the deployed app, add a Neon PostgreSQL connection string as the Render
web service's `DATABASE_URL` environment variable.

## Run the Tests

```powershell
npm.cmd test
```
