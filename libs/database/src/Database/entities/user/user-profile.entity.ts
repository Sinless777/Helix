import { Entity, Property, OneToMany } from '@mikro-orm/core'
import { BaseEntity } from '../base.entity'
import { Microservice } from '../site/microservice.entity'
import { Technology } from '../site/technology.entity'
import { News } from '../site/news.entity'
import { Sex, Gender, Sexuality, Pronoun, Country } from '../../enums'

/**
 * UserProfile extends BaseEntity to store user-specific profile details.
 * Includes personal info, preferences, and related site contributions.
 */
@Entity({ tableName: 'user_profiles' })
export class UserProfile extends BaseEntity {
  /**
   * User's first name.
   */
  @Property({ nullable: true, name: 'first_name' })
  firstName?: string

  /**
   * User's middle name.
   */
  @Property({ nullable: true, name: 'middle_name' })
  middleName?: string

  /**
   * User's last name.
   */
  @Property({ nullable: true, name: 'last_name' })
  lastName?: string

  /**
   * URL or path to the user's avatar image.
   */
  @Property({ nullable: true })
  avatar?: string

  /**
   * User's date of birth.
   */
  @Property({ type: 'date', nullable: true })
  birthday?: Date

  /**
   * Biological sex (enum).
   */
  @Property({ type: 'string', default: Sex.PreferNotToSay })
  sex = Sex.PreferNotToSay

  /**
   * Gender identity (enum).
   */
  @Property({ type: 'string', default: Gender.PreferNotToSay })
  gender = Gender.PreferNotToSay

  /**
   * Sexual orientation (enum).
   */
  @Property({ type: 'string', default: Sexuality.PreferNotToSay })
  sexualOrientation = Sexuality.PreferNotToSay

  /**
   * Preferred pronouns (enum).
   */
  @Property({ type: 'string', default: Pronoun.Other })
  pronoun = Pronoun.Other

  /**
   * User's country of residence (enum).
   */
  @Property({ type: 'string', default: Country.PreferNotToSay })
  country = Country.PreferNotToSay

  /**
   * Microservices added by the user.
   */
  @OneToMany(() => Microservice, (ms) => ms.addedBy, { eager: true })
  microservicesAdded: Microservice[] = []

  /**
   * Technologies added by the user.
   */
  @OneToMany(() => Technology, (tech) => tech.addedBy, { eager: true })
  technologiesAdded: Technology[] = []

  /**
   * News entries added by the user.
   */
  @OneToMany(() => News, (news) => news.addedBy, { eager: true })
  newsAdded: News[] = []

  /**
   * Indicates if the user's email is verified.
   */
  @Property({ default: false, name: 'email_verified' })
  emailVerified = false

  /**
   * Indicates if the user's age is verified.
   */
  @Property({ default: false, name: 'age_verified' })
  ageVerified = false
}
