const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const { createApp } = require("../app");

let baseUrl;
let database;
let server;

before(async () => {
  const testApp = createApp(":memory:");
  database = testApp.database;

  await new Promise((resolve) => {
    server = testApp.app.listen(0, "127.0.0.1", resolve);
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  database.close();
});

test("GET /api/tasks starts with an empty list", async () => {
  const response = await fetch(`${baseUrl}/api/tasks`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), []);
});

test("tasks can be created, completed, and deleted", async () => {
  const createResponse = await fetch(`${baseUrl}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description: "Test the API" }),
  });
  const createdTask = await createResponse.json();

  assert.equal(createResponse.status, 201);
  assert.equal(createdTask.description, "Test the API");
  assert.equal(createdTask.completed, false);

  const updateResponse = await fetch(`${baseUrl}/api/tasks/${createdTask.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: true }),
  });
  const updatedTask = await updateResponse.json();

  assert.equal(updateResponse.status, 200);
  assert.equal(updatedTask.completed, true);

  const deleteResponse = await fetch(`${baseUrl}/api/tasks/${createdTask.id}`, {
    method: "DELETE",
  });

  assert.equal(deleteResponse.status, 204);
  assert.deepEqual(await (await fetch(`${baseUrl}/api/tasks`)).json(), []);
});

test("POST /api/tasks rejects blank and oversized descriptions", async () => {
  const blankResponse = await fetch(`${baseUrl}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description: "   " }),
  });
  const longResponse = await fetch(`${baseUrl}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description: "x".repeat(201) }),
  });

  assert.equal(blankResponse.status, 400);
  assert.equal(longResponse.status, 400);
});

test("task routes reject invalid and missing IDs", async () => {
  const invalidResponse = await fetch(`${baseUrl}/api/tasks/abc`, {
    method: "DELETE",
  });
  const missingResponse = await fetch(`${baseUrl}/api/tasks/999`, {
    method: "DELETE",
  });

  assert.equal(invalidResponse.status, 400);
  assert.equal(missingResponse.status, 404);
});
