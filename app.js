const express = require("express");
const { DatabaseSync } = require("node:sqlite");

function formatTask(task) {
  return {
    ...task,
    completed: Boolean(task.completed),
  };
}

function isValidTaskId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

function createApp(databasePath = "tasks.db") {
  const app = express();
  const database = new DatabaseSync(databasePath);

  database.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0
    )
  `);

  app.use(express.json());
  app.use(express.static("public"));

  app.get("/api/tasks", (request, response) => {
    const tasks = database
      .prepare("SELECT id, description, completed FROM tasks ORDER BY id")
      .all()
      .map(formatTask);

    response.json(tasks);
  });

  app.post("/api/tasks", (request, response) => {
    const description = request.body.description?.trim();

    if (!description) {
      return response.status(400).json({ error: "Task description is required." });
    }

    if (description.length > 200) {
      return response
        .status(400)
        .json({ error: "Task description must be 200 characters or fewer." });
    }

    const result = database
      .prepare("INSERT INTO tasks (description) VALUES (?)")
      .run(description);

    const task = database
      .prepare("SELECT id, description, completed FROM tasks WHERE id = ?")
      .get(result.lastInsertRowid);

    return response.status(201).json(formatTask(task));
  });

  app.patch("/api/tasks/:id", (request, response) => {
    if (!isValidTaskId(request.params.id)) {
      return response.status(400).json({ error: "Task ID must be a positive number." });
    }

    if (typeof request.body.completed !== "boolean") {
      return response.status(400).json({ error: "Completed must be true or false." });
    }

    const result = database
      .prepare("UPDATE tasks SET completed = ? WHERE id = ?")
      .run(Number(request.body.completed), request.params.id);

    if (result.changes === 0) {
      return response.status(404).json({ error: "Task not found." });
    }

    const task = database
      .prepare("SELECT id, description, completed FROM tasks WHERE id = ?")
      .get(request.params.id);

    return response.json(formatTask(task));
  });

  app.delete("/api/tasks/:id", (request, response) => {
    if (!isValidTaskId(request.params.id)) {
      return response.status(400).json({ error: "Task ID must be a positive number." });
    }

    const result = database
      .prepare("DELETE FROM tasks WHERE id = ?")
      .run(request.params.id);

    if (result.changes === 0) {
      return response.status(404).json({ error: "Task not found." });
    }

    return response.status(204).send();
  });

  app.use((error, request, response, next) => {
    console.error(error);

    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      return response.status(400).json({ error: "Request body must contain valid JSON." });
    }

    return response.status(500).json({ error: "Something went wrong on the server." });
  });

  return { app, database };
}

module.exports = { createApp };
