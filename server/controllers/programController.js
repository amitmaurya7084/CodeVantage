const { Program, Task } = require("../models");

/** GET /api/programs — all active programs, for Home/Internships listing. Supports ?search= */
async function getPrograms(req, res, next) {
  try {
    const { search } = req.query;
    const query = { isActive: true };

    if (search) {
      const regex = { $regex: search, $options: "i" };
      query.$or = [{ name: regex }, { shortDescription: regex }, { technologies: regex }];
    }

    const programs = await Program.find(query).sort({ displayOrder: 1 });
    res.json({ success: true, programs });
  } catch (err) {
    next(err);
  }
}

/** GET /api/programs/:slug — single active program, for the detail page */
async function getProgramBySlug(req, res, next) {
  try {
    const program = await Program.findOne({ slug: req.params.slug, isActive: true });
    if (!program) {
      const error = new Error("Program not found.");
      error.statusCode = 404;
      throw error;
    }
    res.json({ success: true, program });
  } catch (err) {
    next(err);
  }
}

/** GET /api/programs/:slug/tasks — public-safe task details for the program detail page */
async function getProgramTasks(req, res, next) {
  try {
    const program = await Program.findOne({ slug: req.params.slug, isActive: true });
    if (!program) {
      const error = new Error("Program not found.");
      error.statusCode = 404;
      throw error;
    }

    const tasks = await Task.find({ program: program._id, isActive: true })
      .select("order title description objectives requirements technologies expectedOutput")
      .sort({ order: 1 });

    res.json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPrograms, getProgramBySlug, getProgramTasks };
