export const handleShare = async (creatorId: string) => {
  const shareUrl = `${window.location.origin}/creator/${creatorId}`;
  
  // Check if Web Share API is supported
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'OneAmp Stream',
        text: 'Check out this awesome music stream!',
        url: shareUrl,
      });
    } catch (error) {
      // User cancelled sharing or an error occurred
      console.log('Sharing cancelled or failed:', error);
      // Fallback to clipboard
      await copyToClipboard(shareUrl);
    }
  } else {
    // Fallback to clipboard copy
    await copyToClipboard(shareUrl);
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    // You might want to show a toast notification here
    alert('Stream link copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Ultimate fallback - show the URL in a prompt
    prompt('Copy this link to share:', text);
  }
};