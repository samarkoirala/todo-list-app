const express = require("express");

function isValidTaskId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

function createApp(taskStore) {
  const app = express();

  app.use(express.json());
  app.use(express.static("public"));

  app.get("/api/tasks", async (request, response, next) => {
    try {
      response.json(await taskStore.getAll());
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/tasks", async (request, response, next) => {
    const description = request.body.description?.trim();

    if (!description) {
      return response.status(400).json({ error: "Task description is required." });
    }

    if (description.length > 200) {
      return response
        .status(400)
        .json({ error: "Task description must be 200 characters or fewer." });
    }

    try {
      return response.status(201).json(await taskStore.create(description));
    } catch (error) {
      return next(error);
    }
  });

  app.patch("/api/tasks/:id", async (request, response, next) => {
    if (!isValidTaskId(request.params.id)) {
      return response.status(400).json({ error: "Task ID must be a positive number." });
    }

    if (typeof request.body.completed !== "boolean") {
      return response.status(400).json({ error: "Completed must be true or false." });
    }

    try {
      const task = await taskStore.update(
        Number(request.params.id),
        request.body.completed,
      );

      if (!task) {
        return response.status(404).json({ error: "Task not found." });
      }

      return response.json(task);
    } catch (error) {
      return next(error);
    }
  });

  app.delete("/api/tasks/:id", async (request, response, next) => {
    if (!isValidTaskId(request.params.id)) {
      return response.status(400).json({ error: "Task ID must be a positive number." });
    }

    try {
      const deleted = await taskStore.delete(Number(request.params.id));

      if (!deleted) {
        return response.status(404).json({ error: "Task not found." });
      }

      return response.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  app.use((error, request, response, next) => {
    console.error(error);

    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      return response.status(400).json({ error: "Request body must contain valid JSON." });
    }

    return response.status(500).json({ error: "Something went wrong on the server." });
  });

  return app;
}

module.exports = { createApp };
