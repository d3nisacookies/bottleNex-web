// Download configuration
export const DOWNLOAD_CONFIG = {
  // Replace this with your actual Google Drive link
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  googleDriveLink: 'https://drive.google.com/file/d/1aGJRs0GnLgSKbvRrTV8DZ4gpIc4GKxdg/view?usp=sharing',
  
  // Alternative: Direct download link (if you have one)
  // directDownloadLink: 'https://your-domain.com/path/to/file.apk',
  
  // File name for display purposes
  fileName: 'BottleneXNavigation.apk',
  
  // App name for display purposes
  appName: 'BottleNex Navigation'
};

// Helper function to open download link
export const openDownloadLink = () => {
  console.log('Opening download link:', DOWNLOAD_CONFIG.googleDriveLink);
  window.open(DOWNLOAD_CONFIG.googleDriveLink, '_blank');
};
