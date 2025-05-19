// libs/shared/database/src/Database/enums/sex.enum.ts

/**
 * @enum Sex
 * @description
 * Biological sex categories based on physiological and genetic traits.
 */
export enum Sex {
  /** Male biological sex */
  Male = 'Male',

  /** Female biological sex */
  Female = 'Female',

  /** Transgender: female-to-male */
  TransgenderF2M = 'Transgender F2M',

  /** Transgender: male-to-female */
  TransgenderM2F = 'Transgender M2F',

  /** Default when user prefers not to specify their sex */
  PreferNotToSay = 'PreferNotToSay',

  /** Intersex biological sex */
  Intersex = 'Intersex',

  /** Other or custom biological sex category */
  Other = 'Other',
}
