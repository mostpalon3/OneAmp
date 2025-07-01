export const triggerQueueSync = async (jamId: string) => {
  try {
    // Broadcast event for real-time sync (if you add WebSocket later)
    console.log(`🔄 Syncing queue for jam: ${jamId}`);
    
    // For now, we rely on the enhanced polling
    return true;
  } catch (error) {
    console.error('Queue sync failed:', error);
    return false;
  }
};

export const waitForDatabaseSync = (delay: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, delay));
};