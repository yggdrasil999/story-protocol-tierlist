// This data will be used to initially populate the projects in the database
// and for client-side rendering.
const projectsData = [
    { id: "ablo", name: "Ablo", logoUrl: "https://pbs.twimg.com/profile_images/1905328431258075136/LxSmur7e_400x400.jpg" },
    { id: "ariaprotocol", name: "Aria Protocol", logoUrl: "https://pbs.twimg.com/profile_images/1886864311294828544/tcHapFVk_400x400.jpg" },
    { id: "blockbook", name: "BlockBook", logoUrl: "https://pbs.twimg.com/profile_images/1861417235857670145/7yuhsmGB_400x400.jpg" },
    { id: "color", name: "Color", logoUrl: "https://pbs.twimg.com/profile_images/1892539854988120064/UYM20dxj_400x400.jpg" },
    { id: "emergence", name: "Emergence", logoUrl: "https://pbs.twimg.com/profile_images/1869026720575086592/vIZjM6fS_400x400.jpg" },
    { id: "globkings", name: "Globkings", logoUrl: "https://pbs.twimg.com/profile_images/1826328315226906624/EKXxxgD0_400x400.png" },
    { id: "piperx", name: "PiperX", logoUrl: "https://pbs.twimg.com/profile_images/1825383669755772928/7rW6KdEj_400x400.jpg" },
    { id: "storyhunt", name: "StoryHunt", logoUrl: "https://pbs.twimg.com/profile_images/1888595813158563840/uM1vREFq_400x400.jpg" },
    { id: "verio", name: "Verio", logoUrl: "https://pbs.twimg.com/profile_images/1826768015838355456/qS7Ci7VU_400x400.jpg" },
    { id: "ip.world", name: "ip.world", logoUrl: "https://pbs.twimg.com/profile_images/1864513186281783296/B2uBcs28_400x400.jpg" },
    { id: "mimboku", name: "Mimboku", logoUrl: "https://pbs.twimg.com/profile_images/1881669778689146880/AslbQ8Gj_400x400.png" },
    { id: "musicbyvirtuals", name: "MusicByVirtuals", logoUrl: "https://pbs.twimg.com/profile_images/1862441663680929792/hFanBnG4_400x400.jpg   " },
    { id: "mycelium", name: "Mycelium", logoUrl: "https://pbs.twimg.com/profile_images/1891542583014502400/DACcTZT4_400x400.jpg" },
    { id: "oaisis", name: "Oaisis", logoUrl: "https://pbs.twimg.com/profile_images/1904392385653862400/7YtBHDMx_400x400.jpg" },
    { id: "pfp3", name: "pfp3", logoUrl: "https://pbs.twimg.com/profile_images/1857511080639021056/msWFLtoZ_400x400.jpg" },
    { id: "poster.fun", name: "Poster.fun", logoUrl: "https://pbs.twimg.com/profile_images/1922346937778364416/V7TZODEW_400x400.jpg" },
    { id: "unleashprotocol", name: "Unleash Protocol", logoUrl: "https://pbs.twimg.com/profile_images/1885021947144396802/uf187Rjt_400x400.jpg" }
];

// این تابع برای بارگذاری اولیه داده‌ها به دیتابیس استفاده می‌شود
// در یک پروژه واقعی، این کار را به صورت دستی یا از طریق یک اسکریپت CLI انجام می‌دهید
async function seedProjects() {
    try {
        const Project = require('../../models/Project'); // مسیر درست به مدل Project
        const existingProjects = await Project.countDocuments();
        if (existingProjects === 0) {
            await Project.insertMany(projectsData);
            console.log('Projects seeded successfully!');
        } else {
            console.log('Projects already exist in DB. Skipping seeding.');
        }
    } catch (error) {
        console.error('Error seeding projects:', error);
    }
}

// برای اینکه بتوانیم این تابع را از server.js فراخوانی کنیم
module.exports = { projectsData, seedProjects };