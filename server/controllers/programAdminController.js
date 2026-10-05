const { z } = require("zod");
const { Program, Student } = require("../models");

const programSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  shortDescription: z.string().trim().min(1, "Short description is required").max(200),
  overview: z.string().trim().optional().or(z.literal("")),
  durationLabel: z.string().trim().min(1, "Duration is required"),
  projectsCount: z.coerce.number().int().min(1),
  level: z.enum(["Beginner Friendly", "Intermediate", "Advanced"]),
  format: z.string().trim().min(1),
  technologies: z.array(z.string()).optional(),
  icon: z.string().trim().optional(),
  isPopular: z.boolean().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.coerce.number().int().optional(),
});

/** GET /api/admin/programs — every program, including inactive ones, for the management screen */
async function listProgramsAdmin(req, res, next) {
  try {
    const programs = await Program.find().sort({ displayOrder: 1 });
    res.json({ success: true, programs });
  } catch (err) {
    next(err);
  }
}

/** POST /api/admin/programs */
async function createProgram(req, res, next) {
  try {
    const parsed = programSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || "Invalid input");
      error.statusCode = 400;
      throw error;
    }

    const existing = await Program.findOne({ slug: parsed.data.slug });
    if (existing) {
      const error = new Error("A program with this slug already exists.");
      error.statusCode = 409;
      throw error;
    }

    const program = await Program.create(parsed.data);
    res.status(201).json({ success: true, message: "Program created.", program });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/admin/programs/:id */
async function updateProgram(req, res, next) {
  try {
    const parsed = programSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || "Invalid input");
      error.statusCode = 400;
      throw error;
    }

    if (parsed.data.slug) {
      const existing = await Program.findOne({ slug: parsed.data.slug, _id: { $ne: req.params.id } });
      if (existing) {
        const error = new Error("A program with this slug already exists.");
        error.statusCode = 409;
        throw error;
      }
    }

    const program = await Program.findByIdAndUpdate(req.params.id, parsed.data, { new: true, runValidators: true });
    if (!program) {
      const error = new Error("Program not found.");
      error.statusCode = 404;
      throw error;
    }

    res.json({ success: true, message: "Program updated.", program });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/programs/:id
 * Refuses to hard-delete a program that real students are enrolled in — the
 * admin should deactivate it instead (isActive: false) so historical student
 * data and certificates stay intact.
 */
async function deleteProgram(req, res, next) {
  try {
    const enrolledCount = await Student.countDocuments({ program: req.params.id });
    if (enrolledCount > 0) {
      const error = new Error(
        `${enrolledCount} student(s) are enrolled in this program. Deactivate it instead of deleting to preserve their records.`
      );
      error.statusCode = 409;
      throw error;
    }

    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) {
      const error = new Error("Program not found.");
      error.statusCode = 404;
      throw error;
    }

    res.json({ success: true, message: "Program deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProgramsAdmin, createProgram, updateProgram, deleteProgram };
