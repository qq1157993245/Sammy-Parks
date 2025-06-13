export interface ApiKey {
  id: string
  key: string
  createdAt: Date
  name: string
}

export interface Member {
  id: string
  name: string
  accessToken: string
}