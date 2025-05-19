// libs/shared/database/src/Database/enums/gender.enum.ts

/**
 * @enum Gender
 * @description
 * Range of gender identities for user profiles.
 */
export enum Gender {
  /** Male identity */
  Male = 'Male',

  /** Female identity */
  Female = 'Female',

  /** Non-binary identity */
  NonBinary = 'NonBinary',

  /** Gender fluid identity */
  GenderFluid = 'GenderFluid',

  /** Genderqueer identity */
  GenderQueer = 'GenderQueer',

  /** Gender non-conforming identity */
  GenderNonConforming = 'GenderNonConforming',

  /** Agender identity */
  Agender = 'Agender',

  /** Default when no gender is specified */
  PreferNotToSay = 'PreferNotToSay',
}
