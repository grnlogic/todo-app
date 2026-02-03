// Shared storage for tasks across API routes
// In production, this would be replaced with a real database

class TaskStorage {
  private tasks: any[] = [];
  private nextId: number = 1;

  getTasks() {
    return this.tasks;
  }

  addTask(task: any) {
    const newTask = {
      ...task,
      id: String(this.nextId++),
    };
    this.tasks.push(newTask);
    console.log('Storage: Added task', newTask);
    console.log('Storage: Total tasks now:', this.tasks.length);
    return newTask;
  }

  findTask(id: string) {
    return this.tasks.find((t) => t.id === id);
  }

  updateTask(id: string, updates: any) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...updates };
      console.log('Storage: Updated task', this.tasks[index]);
      return this.tasks[index];
    }
    console.log('Storage: Task not found for update', id);
    console.log('Storage: Available task IDs:', this.tasks.map(t => t.id));
    return null;
  }

  deleteTask(id: string) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      console.log('Storage: Deleted task', id);
      return true;
    }
    console.log('Storage: Task not found for delete', id);
    return false;
  }
}

// Export a single instance to be shared across all routes
export const storage = new TaskStorage();
