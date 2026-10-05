const crypto = require("crypto");
const { z } = require("zod");
const { Visit } = require("../models");

const VISITOR_COOKIE_NAME = "cv_visitor_id";
const VISITOR_COOKIE_MAX_AGE = 2 * 365 * 24 * 60 * 60 * 1000; // ~2 years

const trackVisitSchema = z.object({
  path: z.string().trim().min(1).max(300),
});

/**
 * POST /api/analytics/track — PUBLIC, no auth.
 * Called once per page view from the public site. Reads (or creates) an
 * anonymous visitor-id cookie so repeat visits from the same browser count
 * toward "unique visitors" rather than "total visits", then logs the view.
 * Never blocks the page on failure — analytics should never break the site.
 */
async function trackVisit(req, res) {
  try {
    const parsed = trackVisitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(204).end(); // silently ignore malformed beacons
    }

    let visitorId = req.cookies?.[VISITOR_COOKIE_NAME];
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      res.cookie(VISITOR_COOKIE_NAME, visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: VISITOR_COOKIE_MAX_AGE,
      });
    }

    await Visit.create({ visitorId, path: parsed.data.path });

    res.status(204).end();
  } catch (err) {
    // Analytics failures must never surface to the visitor or break the page.
    res.status(204).end();
  }
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Calendar week starting Monday.
function startOfWeek(date) {
  const start = startOfDay(date);
  const day = start.getDay(); // 0 = Sunday ... 6 = Saturday
  const diffToMonday = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - diffToMonday);
  return start;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

async function countPeriod(since) {
  const [visits, visitorIds] = await Promise.all([
    Visit.countDocuments({ createdAt: { $gte: since } }),
    Visit.distinct("visitorId", { createdAt: { $gte: since } }),
  ]);
  return { visits, uniqueVisitors: visitorIds.length };
}

/**
 * GET /api/admin/analytics — admin-only.
 * Returns visit/unique-visitor counts for today, this (Mon-start) week, this
 * calendar month, and all time, plus a 14-day trend and the current month's
 * top pages so the dashboard has something to chart, not just four numbers.
 */
async function getAnalyticsStats(req, res, next) {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const fourteenDaysAgo = new Date(todayStart);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13); // includes today = 14 days

    const [today, thisWeek, thisMonth, allTimeVisits, allTimeVisitorIds, dailyTrend, topPages] = await Promise.all([
      countPeriod(todayStart),
      countPeriod(weekStart),
      countPeriod(monthStart),
      Visit.countDocuments({}),
      Visit.distinct("visitorId", {}),
      Visit.aggregate([
        { $match: { createdAt: { $gte: fourteenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            visits: { $sum: 1 },
            visitors: { $addToSet: "$visitorId" },
          },
        },
        { $project: { _id: 0, date: "$_id", visits: 1, uniqueVisitors: { $size: "$visitors" } } },
        { $sort: { date: 1 } },
      ]),
      Visit.aggregate([
        { $match: { createdAt: { $gte: monthStart } } },
        { $group: { _id: "$path", visits: { $sum: 1 } } },
        { $sort: { visits: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, path: "$_id", visits: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        today,
        thisWeek,
        thisMonth,
        allTime: { visits: allTimeVisits, uniqueVisitors: allTimeVisitorIds.length },
        dailyTrend,
        topPages,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { trackVisit, getAnalyticsStats, VISITOR_COOKIE_NAME };
