const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // شناسه یکتا برای درگ و دراپ در فرانت‌اند
    name: { type: String, required: true, unique: true },
    logoUrl: { type: String, required: true }
});

module.exports = mongoose.model('Project', projectSchema);