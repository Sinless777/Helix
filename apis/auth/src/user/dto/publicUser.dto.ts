import { User } from '../user.entity'

export class PublicUserDto {
  constructor(user: User) {
    this.id = user.id
    this.email = user.email
    this.name = user.name
    this.avatarUrl = user.avatarUrl
  }

  id: string
  email: string
  name?: string
  avatarUrl?: string
}
