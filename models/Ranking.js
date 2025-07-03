const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema({
    twitterHandle: {
        type: String,
        required: true,
        unique: true, // هر آیدی توییتر فقط یک بار می‌تواند رتبه‌بندی ثبت کند
        lowercase: true,
        trim: true,
        match: /^@[a-zA-Z0-9_]{4,}$/ // اعتبار سنجی دقیق تر فرمت @username
    },
    rankedProjects: [
        {
            projectId: { type: String, required: true },
            tier: { type: String, required: true, enum: ['S', 'A', 'B', 'C', 'D', 'E', 'F'] }
        }
    ],
    submissionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ranking', rankingSchema);