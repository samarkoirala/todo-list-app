# To-Do List App

A beginner full-stack project for creating, viewing, completing, and deleting tasks.

## Features

- Add tasks
- Mark tasks complete or incomplete
- Delete tasks
- Save tasks in SQLite
- Validate input and display helpful messages
- Test the API automatically

## Run the App

```powershell
npm.cmd start
```

Then visit `http://localhost:3000`.

## Deployment

The app reads these optional environment variables:

- `PORT`: port assigned by the hosting service
- `DATABASE_PATH`: SQLite database file location

SQLite needs persistent storage in production. If a host uses an ephemeral
filesystem, saved tasks can disappear when the service restarts or redeploys.

## Run the Tests

```powershell
npm.cmd test
```
