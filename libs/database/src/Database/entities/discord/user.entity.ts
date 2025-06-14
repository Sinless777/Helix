// libs/shared/database/src/Database/entities/discord/user.entity.ts

import { Entity, Property, OneToMany, Collection } from "@mikro-orm/core";
import { BaseEntity } from "../base.entity";
import { Pastebin } from "./pastebin.entity";

/**
 * Represents a Discord user tracked in the system.
 *
 * Inherits UUID id, timestamps, and soft-delete from BaseEntity.
 */
@Entity({ tableName: "discord_users" })
export class DiscordUser extends BaseEntity {
  /**
   * Unique Discord snowflake ID of the user.
   */
  @Property({ type: "text", name: "discord_id", unique: true })
  discordId!: string;

  /**
   * Discord username (without discriminator).
   */
  @Property({ type: "text" })
  username!: string;

  /**
   * Four-digit Discord discriminator.
   */
  @Property({ type: "text" })
  discriminator!: string;

  /**
   * Age of the Discord account in days.
   */
  @Property({ type: "int", name: "discord_account_age" })
  discordAccountAge!: number;

  /**
   * Age of the Helix account in days.
   */
  @Property({ type: "int", name: "helix_account_age" })
  helixAccountAge!: number;

  /**
   * Whether the Discord account is verified.
   */
  @Property({ type: "boolean", name: "discord_verified" })
  discordVerified!: boolean;

  /**
   * Whether the Helix account is verified.
   */
  @Property({ type: "boolean", name: "helix_verified" })
  helixVerified!: boolean;

  /**
   * Email associated with the user.
   */
  @Property({ type: "text" })
  email!: string;

  /**
   * Number of system warnings issued to the user.
   */
  @Property({ type: "int", name: "system_warnings" })
  systemWarnings!: number;

  /**
   * Display name or nickname of the user.
   */
  @Property({ type: "text", name: "display_name" })
  displayName!: string;

  /**
   * Timestamp of the last interaction by the user.
   */
  @Property({
    type: "timestamptz",
    name: "last_interaction_at",
    defaultRaw: "CURRENT_TIMESTAMP",
  })
  lastInteractionAt: Date = new Date();

  /**
   * Pastebin records created by this user.
   */
  @OneToMany(() => Pastebin, (pb) => pb.user)
  pastebins = new Collection<Pastebin>(this);
}
