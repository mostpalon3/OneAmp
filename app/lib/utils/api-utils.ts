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

export async function refreshStreams(jamId: string) {
  try {
    const res = await fetch("/api/streams/?jamId=" + jamId);
    
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

export async function submitStream(jamId: string,url: string) {
  const response = await fetch("/api/streams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jamId: jamId,
      url: url,
    }),
  });

  if (!response.ok) {
    console.error("Failed to submit stream:", response);
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

export async function fetchJamHeaderDetails(jamId: string) {
      try {
        const response = await fetch(`/api/jams/${jamId}`);
        if (!response.ok) {
          console.warn("Failed to fetch jam details:", response.status);
          return null;
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching jam details:", error);
        return null;
      }
    }
