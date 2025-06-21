export async function fetchYouTubeVideoPreview(url: string) {
  try {
    const response = await fetch('/api/streams/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to fetch video details')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Preview API call failed:', error)
    throw error
  }
}

export async function refreshStreams(creatorId: string) {
  try {
    const res = await fetch("/api/streams/?creatorId=" + creatorId);
    
    if (!res.ok) {
      console.warn("Failed to fetch streams:", res.status);
      return null;
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error refreshing streams:", error);
    return null;
  }
}

export async function submitStream(creatorId: string, url: string) {
  const response = await fetch("/api/streams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      creatorId: creatorId,
      url: url,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit stream');
  }

  return response.json();
}

export async function voteOnStream(streamId: string, isUpvote: boolean) {
  const response = await fetch(`/api/streams/${isUpvote ? "upvote" : "downvote"}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      streamId: String(streamId)
    }),
  });

  if (!response.ok) {
    throw new Error('Vote failed');
  }

  return response.json();
}