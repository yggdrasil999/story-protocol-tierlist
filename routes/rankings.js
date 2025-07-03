const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');

// @route   GET /api/projects
// @desc    دریافت لیست تمام پروژه‌ها
// @access  Public
router.get('/projects', rankingController.getProjects);

// @route   POST /api/rankings/submit
// @desc    ثبت رتبه‌بندی جدید
// @access  Public
router.post('/rankings/submit', rankingController.submitRanking);

// @route   GET /api/rankings/leaderboard
// @desc    دریافت داده‌های لیدربرد
// @access  Public
router.get('/rankings/leaderboard', rankingController.getLeaderboardData);

module.exports = router;