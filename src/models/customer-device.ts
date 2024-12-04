// src/models/customer-device.ts
import { Entity, Property } from "@mikro-orm/core"
import { BaseEntity } from "@medusajs/framework/utils"

export type DeviceInfo = {
    type: "mobile" | "desktop" | "tablet"
    browser: string
    os: string
    model?: string
}

@Entity()
export class CustomerDevice extends BaseEntity {
    @Property({ nullable: true })
    customer_id?: string

    @Property()
    device_id!: string

    @Property()
    device_name!: string

    @Property({ type: 'jsonb' })
    device_info!: DeviceInfo

    @Property()
    last_used: Date = new Date()
}