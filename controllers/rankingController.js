const Project = require('../models/Project');
const Ranking = require('../models/Ranking');
const { isValidTwitterHandle } = require('../utils/validator');

// سیستم امتیازدهی Tier (می‌توانید آن را برعکس کنید که کمتر بهتر باشد)
const TIER_POINTS = {
    'S': 7, // بهترین
    'A': 6,
    'B': 5,
    'C': 4,
    'D': 3,
    'E': 2,
    'F': 1  // بدترین
};

// دریافت لیست تمام پروژه‌ها
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find({});
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// ثبت رتبه‌بندی جدید
exports.submitRanking = async (req, res) => {
    const { twitterHandle, rankedProjects } = req.body;

    if (!twitterHandle || !Array.isArray(rankedProjects) || rankedProjects.length === 0) {
        // !!! اطمینان از عدم وجود نقطه در ابتدای پیام !!!
        return res.status(400).json({ msg: 'Please provide Twitter handle and ranked projects.' });
    }

    // اضافه کردن اعتبار سنجی برای وقتی توییتر هندل وارد نشده اما پروژه رنک شده وجود دارد
    if (!twitterHandle && rankedProjects.length > 0) {
        return res.status(400).json({ msg: 'Please provide a Twitter handle to submit your ranking.' });
    }

    if (!isValidTwitterHandle(twitterHandle)) {
        // !!! اطمینان از عدم وجود نقطه در ابتدای پیام !!!
        return res.status(400).json({ msg: 'Invalid Twitter handle format. It must start with @ and have at least 4 characters after it.' });
    }

    try {
        // بررسی اینکه آیا این کاربر قبلا رتبه‌بندی ثبت کرده است
        let existingRanking = await Ranking.findOne({ twitterHandle });
        if (existingRanking) {
            // !!! اطمینان از عدم وجود نقطه در ابتدای پیام !!!
            return res.status(409).json({ msg: 'You have already submitted a ranking with this Twitter handle.' });
        }

        // بررسی اینکه همه projectId ها معتبر باشند
        const projectIds = rankedProjects.map(p => p.projectId);
        const validProjects = await Project.find({ id: { $in: projectIds } });
        if (validProjects.length !== projectIds.length) {
            // !!! اطمینان از عدم وجود نقطه در ابتدای پیام !!!
            return res.status(400).json({ msg: 'One or more project IDs are invalid.' });
        }

        const newRanking = new Ranking({
            twitterHandle,
            rankedProjects
        });

        await newRanking.save();
        // !!! اطمینان از عدم وجود نقطه در ابتدای پیام !!!
        res.status(201).json({ msg: 'Ranking submitted successfully!' });

    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) { // Duplicate key error (for unique twitterHandle)
            // !!! اطمینان از عدم وجود نقطه در ابتدای پیام !!!
            return res.status(409).json({ msg: 'A ranking with this Twitter handle already exists.' });
        }
        res.status(500).send('Server Error');
    }
};

// دریافت داده‌های لیدربرد
exports.getLeaderboardData = async (req, res) => {
    try {
        const allRankings = await Ranking.find({});
        const projectScores = {}; // { projectId: { totalPoints: 0, voteCount: 0 } }
        const projectNames = {};  // { projectId: "Project Name" }
        const projectLogos = {};  // { projectId: "logoUrl" }

        // گرفتن نام و لوگو پروژه‌ها
        const projects = await Project.find({});
        projects.forEach(p => {
            projectNames[p.id] = p.name;
            projectLogos[p.id] = p.logoUrl;
        });

        allRankings.forEach(ranking => {
            ranking.rankedProjects.forEach(rp => {
                const projectId = rp.projectId;
                const tier = rp.tier;
                const points = TIER_POINTS[tier];

                if (projectScores[projectId]) {
                    projectScores[projectId].totalPoints += points;
                    projectScores[projectId].voteCount++;
                } else {
                    projectScores[projectId] = {
                        totalPoints: points,
                        voteCount: 1
                    };
                }
            });
        });

        const leaderboard = Object.keys(projectScores).map(projectId => {
            const data = projectScores[projectId];
            const averageScore = data.totalPoints / data.voteCount;
            return {
                projectId,
                name: projectNames[projectId] || 'Unknown Project',
                logoUrl: projectLogos[projectId] || '', // ارائه یک لوگوی پیش‌فرض اگر پیدا نشد
                averageScore: parseFloat(averageScore.toFixed(2)), // گرد کردن به 2 رقم اعشار
                voteCount: data.voteCount
            };
        });

        // مرتب‌سازی لیدربرد: بالاترین امتیاز (عدد بیشتر) بهتر است
        leaderboard.sort((a, b) => b.averageScore - a.averageScore);

        res.json(leaderboard);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};