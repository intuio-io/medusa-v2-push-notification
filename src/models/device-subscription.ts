// src/models/device-subscription.ts
import { Entity, Property } from "@mikro-orm/core"
import { BaseEntity } from "@medusajs/framework/utils"

@Entity()
export class DeviceSubscription extends BaseEntity {
    @Property()
    device_id!: string

    @Property()
    endpoint!: string

    @Property()
    p256dh!: string

    @Property()
    auth!: string

    @Property({ default: true })
    is_active!: boolean
}