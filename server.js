const { createApp } = require("./app");
const { createPostgresTaskStore } = require("./task-store");

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

async function startServer() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required.");
  }

  const taskStore = createPostgresTaskStore(DATABASE_URL);
  await taskStore.initialize();
  const app = createApp(taskStore);

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Could not start server:", error);
  process.exit(1);
});
