exports.isValidTwitterHandle = (handle) => {
    if (!handle || typeof handle !== 'string') {
        return false;
    }
    // بررسی: شروع با @ و حداقل 4 کاراکتر پس از آن (حروف، اعداد، _ )
    const regex = /^@[a-zA-Z0-9_]{4,}$/;
    return regex.test(handle);
};