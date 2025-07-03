document.addEventListener('DOMContentLoaded', () => {
    const projectGridContainer = document.getElementById('project-grid-container');
    const tierDropzones = document.querySelectorAll('.tier-projects-dropzone');
    const submitBtn = document.getElementById('submit-rankings-btn');
    const twitterHandleInput = document.getElementById('twitter-handle');
    const rankedProjectsCountSpan = document.getElementById('ranked-projects-count');
    const remainingProjectsCountSpan = document.getElementById('remaining-projects-count');

    let projects = []; // برای نگهداری تمام پروژه‌ها (لیست اصلی از بک‌اند)
    let currentRankings = {}; // { projectId: tier, ... } (وضعیت فعلی پروژه‌های رتبه‌بندی شده در UI)
    let draggedItem = null; // برای آیتم در حال درگ

    // ----------- توابع کمکی UI -----------
    function showMessage(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        // تمیزکاری نهایی متن برای حذف کاراکترهای نامرئی یا نقطه‌های ناخواسته
        let cleanedText = text.trim()
                              .replace(/\u200E|\u200F/g, '') // Remove LRM/RLM
                              .replace(/^\s*[\u2022\u002D]\s*/, ''); // Remove common leading bullets/dashes
        messageDiv.textContent = cleanedText;

        submitBtn.insertAdjacentElement('afterend', messageDiv); // اضافه کردن بعد از دکمه
        setTimeout(() => messageDiv.remove(), 5000); // حذف پیام بعد از 5 ثانیه
    }

    function updateRankedProjectsCount() {
        const count = Object.keys(currentRankings).length;
        rankedProjectsCountSpan.textContent = count;
        submitBtn.disabled = count === 0; // دکمه را غیرفعال کن اگر هیچ پروژه‌ای رتبه‌بندی نشده
    }

    function updateRemainingProjectsCount() {
        const totalProjects = projects.length;
        const rankedCount = Object.keys(currentRankings).length;
        remainingProjectsCountSpan.textContent = totalProjects - rankedCount;
    }

    // ----------- مدیریت درگ و دراپ -----------
    function handleDragStart(e) {
        draggedItem = e.target.closest('.project-item');
        if (!draggedItem) return;

        e.dataTransfer.setData('text/plain', draggedItem.dataset.projectId);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            draggedItem.classList.add('dragging');
        }, 0);
    }

    function handleDragEnd() {
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
        }
        draggedItem = null;
    }

    function handleDragOver(e) {
        e.preventDefault(); // اجازه دراپ را می‌دهد
        e.dataTransfer.dropEffect = 'move';
        if (e.target.closest('.tier-projects-dropzone') || e.target.closest('#project-grid-container')) {
             e.target.closest('.tier-projects-dropzone, #project-grid-container')?.classList.add('drag-over');
        }
    }

    function handleDragEnter(e) {
        e.preventDefault();
        if (e.target.closest('.tier-projects-dropzone') || e.target.closest('#project-grid-container')) {
             e.target.closest('.tier-projects-dropzone, #project-grid-container')?.classList.add('drag-over');
        }
    }

    function handleDragLeave(e) {
        if (e.target.closest('.tier-projects-dropzone') || e.target.closest('#project-grid-container')) {
             e.target.closest('.tier-projects-dropzone, #project-grid-container')?.classList.remove('drag-over');
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        const droppedProjectId = e.dataTransfer.getData('text/plain');
        const dropzone = e.target.closest('.tier-projects-dropzone') || e.target.closest('#project-grid-container');

        if (!dropzone || !draggedItem) {
            return;
        }

        dropzone.classList.remove('drag-over'); // Remove drag-over class

        // تعیین Tier قبلی پروژه (اگر در Tier بود)
        const oldParentTierElement = draggedItem.closest('.tier-row');
        const oldTier = oldParentTierElement ? oldParentTierElement.dataset.tier : null;

        const isDroppedInGrid = dropzone.id === 'project-grid-container';

        if (isDroppedInGrid) {
            // دراپ در باکس اصلی "Projects to Rank"
            delete currentRankings[droppedProjectId];
            projectGridContainer.appendChild(draggedItem);
        } else {
            // دراپ در یکی از Tierها
            const newTier = dropzone.closest('.tier-row').dataset.tier;

            // اگر پروژه قبلاً در یک Tier دیگر بود، آن را از Tier قبلی بردارید
            if (oldTier && oldTier !== newTier) {
                // نیازی به حذف صریح از والد قبلی نیست، چون appendChild خودش این کار را می‌کند
            }
            dropzone.appendChild(draggedItem);
            currentRankings[droppedProjectId] = newTier;
        }
        updateRankedProjectsCount();
        updateRemainingProjectsCount();
    }

    // اضافه کردن شنونده‌های رویداد به Dropzones
    tierDropzones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });

    // اضافه کردن شنونده‌های رویداد به Grid Container (برای برگشت پروژه‌ها)
    projectGridContainer.addEventListener('dragover', handleDragOver);
    projectGridContainer.addEventListener('dragenter', handleDragEnter);
    projectGridContainer.addEventListener('dragleave', handleDragLeave);
    projectGridContainer.addEventListener('drop', handleDrop);

    // شنونده‌های کلی برای Drag
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);

    // ----------- بارگذاری پروژه‌ها از بک‌اند -----------
    async function loadProjects() {
        try {
            const response = await fetch('/api/projects');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            projects = await response.json();
            renderProjects(); // پس از بارگذاری پروژه‌ها، رندر می‌شوند
            updateRemainingProjectsCount();
        } catch (error) {
            console.error('Error fetching projects:', error);
            showMessage('error', 'Failed to load projects. Please try again later.');
        }
    }

    function renderProjects() {
        // 1. ابتدا تمام محتوای باکس اصلی پروژه‌ها را پاک می‌کنیم
        projectGridContainer.innerHTML = '';

        // 2. !!! مهم: حالا تمام محتوای تمام Tier Dropzones را نیز پاک می‌کنیم !!!
        tierDropzones.forEach(zone => {
            zone.innerHTML = '';
        });

        // 3. حالا تمام پروژه‌ها را (چون currentRankings خالی شده یا برای اولین بار لود می‌شود) به باکس اصلی برمی‌گردانیم
        projects.forEach(project => {
            // فقط پروژه‌هایی را اضافه می‌کنیم که در currentRankings نیستند (برای حالت‌های پیشرفته‌تر اگر قرار بود رنکینگ ذخیره شود)
            // اما چون currentRankings پس از ارسال رنکینگ پاک می‌شود، این شرط همیشه true است و همه برمی‌گردند
            if (!currentRankings[project.id]) {
                const projectItem = document.createElement('div');
                projectItem.className = 'project-item';
                projectItem.draggable = true;
                projectItem.dataset.projectId = project.id;

                projectItem.innerHTML = `
                    <img src="${project.logoUrl}" alt="${project.name} Logo">
                    <span>${project.name}</span>
                `;
                projectGridContainer.appendChild(projectItem);
            }
        });
        // نکته: حلقه دومی که قبلاً برای رندر پروژه‌هایی که در Tier بودند وجود داشت،
        // حالا نیازی به آن نیست، زیرا currentRankings پاک می‌شود و Tierها هم خالی می‌شوند.
    }

    // ----------- ثبت رتبه‌بندی -----------
    submitBtn.addEventListener('click', async () => {
        const twitterHandle = twitterHandleInput.value.trim();
        const rankedProjectsArray = Object.keys(currentRankings).map(projectId => ({
            projectId,
            tier: currentRankings[projectId]
        }));

        if (rankedProjectsArray.length === 0) {
            showMessage('error', 'Please rank at least one project.');
            return;
        }

        // اگر توییتر هندل وارد نشده ولی حداقل یک پروژه رنک شده
        if (!twitterHandle) { // تغییر شرط: فقط اگر توییتر هندل وارد نشده باشد
            showMessage('error', 'Please provide a Twitter handle to submit your ranking.');
            return;
        }

        // اگر توییتر هندل وارد شده و معتبر نیست
        if (!isValidTwitterHandle(twitterHandle)) {
            showMessage('error', 'Invalid Twitter handle format. It must start with @ and have at least 4 characters after it.');
            return;
        }


        try {
            const response = await fetch('/api/rankings/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    twitterHandle,
                    rankedProjects: rankedProjectsArray
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('success', data.msg);
                // ریست کردن UI بعد از ثبت موفقیت‌آمیز
                currentRankings = {}; // وضعیت داخلی رنکینگ‌ها را پاک می‌کند
                twitterHandleInput.value = ''; // فیلد توییتر را خالی می‌کند
                loadProjects(); // این باعث می‌شود renderProjects() فراخوانی شود و همه چیز ریست شود
                updateRankedProjectsCount(); // شمارنده‌ها را به روز می‌کند
            } else {
                showMessage('error', data.msg || 'Failed to submit ranking.');
            }
        } catch (error) {
            console.error('Error submitting ranking:', error);
            showMessage('error', 'An error occurred while submitting ranking. Please try again.');
        }
    });

    // اعتبار سنجی فرمت توییتر هندل
    function isValidTwitterHandle(handle) {
        // بررسی: شروع با @ و حداقل 4 کاراکتر پس از آن (حروف، اعداد، _ )
        // حالا که @ در placeholder است و نشانگر LTR شده، کاربر باید @ را خودش وارد کند
        const regex = /^@[a-zA-Z0-9_]{4,}$/;
        return regex.test(handle);
    }

    // بارگذاری پروژه‌ها هنگام بارگذاری صفحه
    loadProjects();
    updateRankedProjectsCount();
});