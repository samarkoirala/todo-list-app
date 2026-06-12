const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const message = document.querySelector("#message");
const addButton = document.querySelector("#add-button");

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

async function request(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || "The request could not be completed.");
  }

  return response.status === 204 ? null : response.json();
}

function renderEmptyState() {
  const emptyState = document.createElement("li");
  emptyState.className = "empty-state";
  emptyState.textContent = "No tasks yet. Add your first task above.";
  taskList.appendChild(emptyState);
}

function renderTask(task) {
  const taskItem = document.createElement("li");
  const taskDescription = document.createElement("span");
  const completeButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  taskItem.dataset.taskId = task.id;
  taskItem.classList.toggle("completed", task.completed);

  taskDescription.textContent = task.description;

  completeButton.type = "button";
  completeButton.className = "task-action";
  completeButton.textContent = task.completed ? "Undo" : "Complete";
  completeButton.addEventListener("click", () => updateTask(task));

  deleteButton.type = "button";
  deleteButton.className = "task-action delete-button";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  taskItem.append(taskDescription, completeButton, deleteButton);
  taskList.appendChild(taskItem);
}

async function loadTasks() {
  showMessage("Loading tasks...");

  try {
    const tasks = await request("/api/tasks");

    taskList.replaceChildren();
    showMessage("");
    tasks.length === 0 ? renderEmptyState() : tasks.forEach(renderTask);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function updateTask(task) {
  try {
    await request(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    await loadTasks();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function deleteTask(taskId) {
  try {
    await request(`/api/tasks/${taskId}`, { method: "DELETE" });
    await loadTasks();
    showMessage("Task deleted.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("Adding task...");
  addButton.disabled = true;

  try {
    await request("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: taskInput.value }),
    });
    taskForm.reset();
    taskInput.focus();
    await loadTasks();
    showMessage("Task added.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    addButton.disabled = false;
  }
});

loadTasks();
