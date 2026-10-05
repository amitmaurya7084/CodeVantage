const { z } = require("zod");
const { Task, Submission, Program } = require("../models");

const taskSchema = z.object({
  order: z.coerce.number().int().min(1),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  objectives: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  expectedOutput: z.string().trim().optional().or(z.literal("")),
  submissionInstructions: z.string().trim().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

/** GET /api/admin/programs/:programId/tasks — all tasks for a program, including inactive */
async function listTasksForProgramAdmin(req, res, next) {
  try {
    const tasks = await Task.find({ program: req.params.programId }).sort({ order: 1 });
    res.json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
}

/** POST /api/admin/programs/:programId/tasks */
async function createTask(req, res, next) {
  try {
    const program = await Program.findById(req.params.programId);
    if (!program) {
      const error = new Error("Program not found.");
      error.statusCode = 404;
      throw error;
    }

    const parsed = taskSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || "Invalid input");
      error.statusCode = 400;
      throw error;
    }

    const existingOrder = await Task.findOne({ program: program._id, order: parsed.data.order });
    if (existingOrder) {
      const error = new Error(`Task ${parsed.data.order} already exists for this program.`);
      error.statusCode = 409;
      throw error;
    }

    const task = await Task.create({ ...parsed.data, program: program._id, createdBy: req.admin._id });
    res.status(201).json({ success: true, message: "Task created.", task });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/admin/tasks/:id */
async function updateTask(req, res, next) {
  try {
    const parsed = taskSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || "Invalid input");
      error.statusCode = 400;
      throw error;
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      const error = new Error("Task not found.");
      error.statusCode = 404;
      throw error;
    }

    if (parsed.data.order && parsed.data.order !== task.order) {
      const existingOrder = await Task.findOne({
        program: task.program,
        order: parsed.data.order,
        _id: { $ne: task._id },
      });
      if (existingOrder) {
        const error = new Error(`Task ${parsed.data.order} already exists for this program.`);
        error.statusCode = 409;
        throw error;
      }
    }

    Object.assign(task, parsed.data);
    await task.save();

    res.json({ success: true, message: "Task updated.", task });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/tasks/:id
 * Refuses to hard-delete a task that already has student submissions against
 * it — deactivate it instead so submission/review history stays intact.
 */
async function deleteTask(req, res, next) {
  try {
    const submissionCount = await Submission.countDocuments({ task: req.params.id });
    if (submissionCount > 0) {
      const error = new Error(
        `${submissionCount} student submission(s) exist for this task. Deactivate it instead of deleting to preserve their records.`
      );
      error.statusCode = 409;
      throw error;
    }

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      const error = new Error("Task not found.");
      error.statusCode = 404;
      throw error;
    }

    res.json({ success: true, message: "Task deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { listTasksForProgramAdmin, createTask, updateTask, deleteTask };
