const { createApp } = require("./app");

const PORT = process.env.PORT || 3000;
const DATABASE_PATH = process.env.DATABASE_PATH || "tasks.db";
const { app } = createApp(DATABASE_PATH);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
