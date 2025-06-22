export interface Song {
  id: number | string
  title: string
  artist: string
  duration: string
  platform: "youtube" | "spotify"
  videoId?: string
  thumbnail?: string
  spotifyId?: string
  albumArt?: string
  votes: number
  userVoted: "up" | "down" | null
  submittedBy: string
}

export interface CurrentVideo {
  id: number
  title: string
  artist: string
  duration: string | number
  currentTime: string
  platform: string
  videoId: string
  thumbnail: string
  votes: number
  submittedBy?: string
}

export interface MusicPreview {
  creatorId?: string
  platform: "youtube" | "spotify"
  videoId?: string
  spotifyId?: string
  title: string
  artist: string
  duration: string
  thumbnail?: string
  albumArt?: string
  url?: string
}

export interface JamStats {
  totalVotes: number
  songsInQueue: number
  youtubeVideos: number
  spotifyTracks: number
}