export interface Profile {
  id: any
  name: any
  username: any
  bio: string
  avatar: any
  followers: number
  following: number
  totalJams: number
  totalLikes: number
  isFollowing: boolean
}

export interface Jam {
  id: number
  name: string
  createdAt: string
  status: string
  viewers: number
  duration: string
  genre: string
  totalSongs: number
  totalLikes: number
}

export const genres = [
  "Electronic",
  "Hip-Hop",
  "Pop",
  "Rock",
  "Jazz",
  "Classical",
  "R&B",
  "Country",
  "Reggae",
  "Blues",
  "Folk",
  "Indie",
  "Dance",
  "House",
  "Techno",
  "Ambient",
  "Chill",
  "Acoustic",
  "Mixed",
]