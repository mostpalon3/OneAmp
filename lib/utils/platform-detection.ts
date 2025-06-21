export const detectPlatform = (url: string): "youtube" | "spotify" | null => {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube"
  }
  if (url.includes("spotify.com")) {
    return "spotify"
  }
  return null
}