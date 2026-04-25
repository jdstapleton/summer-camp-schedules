let quotaWarningShown = false;

export const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    if (!quotaWarningShown) {
      quotaWarningShown = true;
      window.alert('Could not save your changes to browser storage. The browser is out of space, or storage is unavailable. Use "Save to File" to keep a copy of your data.');
    }
    console.error('localStorage.setItem failed for key', key, err);
    return false;
  }
};
