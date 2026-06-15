const { Pool } = require("pg");

function createPostgresTaskStore(connectionString) {
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
  });

  return {
    async initialize() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          description VARCHAR(200) NOT NULL,
          completed BOOLEAN NOT NULL DEFAULT FALSE
        )
      `);
    },

    async getAll() {
      const result = await pool.query(
        "SELECT id, description, completed FROM tasks ORDER BY id",
      );
      return result.rows;
    },

    async create(description) {
      const result = await pool.query(
        `INSERT INTO tasks (description)
         VALUES ($1)
         RETURNING id, description, completed`,
        [description],
      );
      return result.rows[0];
    },

    async update(id, completed) {
      const result = await pool.query(
        `UPDATE tasks
         SET completed = $1
         WHERE id = $2
         RETURNING id, description, completed`,
        [completed, id],
      );
      return result.rows[0] || null;
    },

    async delete(id) {
      const result = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
      return result.rowCount > 0;
    },

    async close() {
      await pool.end();
    },
  };
}

function createMemoryTaskStore() {
  let nextId = 1;
  let tasks = [];

  return {
    async initialize() {},

    async getAll() {
      return tasks.map((task) => ({ ...task }));
    },

    async create(description) {
      const task = { id: nextId, description, completed: false };
      nextId += 1;
      tasks.push(task);
      return { ...task };
    },

    async update(id, completed) {
      const task = tasks.find((item) => item.id === id);

      if (!task) {
        return null;
      }

      task.completed = completed;
      return { ...task };
    },

    async delete(id) {
      const originalLength = tasks.length;
      tasks = tasks.filter((task) => task.id !== id);
      return tasks.length < originalLength;
    },

    async close() {},
  };
}

module.exports = { createMemoryTaskStore, createPostgresTaskStore };
