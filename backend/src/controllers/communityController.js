const Scan = require('../models/Scan');
const User = require('../models/User');

function toFeedItem(scan) {
  const user = scan.user || {};

  return {
    id: scan._id.toString(),
    user: {
      id: user._id ? user._id.toString() : '',
      name: user.name || 'EcoScanner',
      level: user.level || 1,
    },
    wasteType: scan.wasteType,
    category: scan.category,
    canRecycle: scan.canRecycle,
    points: scan.points,
    city: scan.city,
    classificationSource: scan.classificationSource,
    createdAt: scan.createdAt.toISOString(),
  };
}

async function getOverview(req, res, next) {
  try {
    const { limit } = req.validated.query;
    const currentUserId = req.user._id.toString();

    const [
      totalMembers,
      totalScans,
      recyclableScans,
      totalPointsAgg,
      rankingUsers,
      recentScans,
      usersAhead,
    ] = await Promise.all([
      User.countDocuments(),
      Scan.countDocuments(),
      Scan.countDocuments({ canRecycle: true }),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$points' } } }]),
      User.find()
        .sort({ points: -1, level: -1, createdAt: 1 })
        .limit(limit)
        .select('name points level createdAt')
        .lean(),
      Scan.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate({ path: 'user', select: 'name level' })
        .lean(),
      User.countDocuments({ points: { $gt: req.user.points } }),
    ]);

    const rankingIds = rankingUsers.map((user) => user._id);
    const scanStats = rankingIds.length
      ? await Scan.aggregate([
          { $match: { user: { $in: rankingIds } } },
          {
            $group: {
              _id: '$user',
              scans: { $sum: 1 },
              recyclableScans: { $sum: { $cond: ['$canRecycle', 1, 0] } },
            },
          },
        ])
      : [];

    const statsByUser = new Map(scanStats.map((stats) => [stats._id.toString(), stats]));
    const ranking = rankingUsers.map((user, index) => {
      const userId = user._id.toString();
      const stats = statsByUser.get(userId) || { scans: 0, recyclableScans: 0 };

      return {
        id: userId,
        rank: index + 1,
        name: user.name,
        points: user.points,
        level: user.level,
        scans: stats.scans,
        recyclableScans: stats.recyclableScans,
        isCurrentUser: userId === currentUserId,
      };
    });

    res.json({
      summary: {
        totalMembers,
        totalScans,
        recyclableScans,
        totalPoints: totalPointsAgg[0]?.total || 0,
        currentUserRank: usersAhead + 1,
      },
      ranking,
      feed: recentScans.map(toFeedItem),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getOverview };
