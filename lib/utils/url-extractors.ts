export const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export const extractSpotifyId = (url: string): string | null => {
  const regExp = /^https?:\/\/(?:open\.)?spotify\.com\/track\/([a-zA-Z0-9]+)(\?.*)?$/
  const match = url.match(regExp)
  return match ? match[1] : null
}