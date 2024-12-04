// src/modules/push-notification/service.ts
import { MedusaService } from "@medusajs/framework/utils"
import { CustomerDevice } from "../models/customer-device"
import { DeviceSubscription } from "../models/device-subscription"
import { MedusaError } from "@medusajs/utils"
import { EntityManager } from "@mikro-orm/core"
import webpush from "web-push"

type CreateSubscriptionInput = {
    customer_id?: string
    device_info: {
        type: "mobile" | "desktop" | "tablet"
        browser: string
        os: string
        model?: string
    }
    subscription: {
        endpoint: string
        keys: {
            p256dh: string
            auth: string
        }
    }
}

type PushNotificationPayload = {
    title: string
    body: string
    icon?: string
    badge?: string
    data?: any
}

export class PushNotificationService extends MedusaService({
    CustomerDevice,
    DeviceSubscription,
}) {
    protected readonly webpush_: typeof webpush
    protected manager: EntityManager

    constructor(container) {
        super(container)
        this.webpush_ = webpush
        this.manager = container.manager

        this.webpush_.setVapidDetails(
            process.env.VAPID_SUBJECT || 'mailto:your-email@example.com',
            process.env.VAPID_PUBLIC_KEY || '',
            process.env.VAPID_PRIVATE_KEY || ''
        )
    }

    // Example of corrected query methods

    async listDevices(customerId?: string) {
        const deviceRepo = this.manager.getRepository(CustomerDevice)
        const subscriptionRepo = this.manager.getRepository(DeviceSubscription)

        // Build query
        const query: any = {}
        if (customerId) {
            query.customer_id = customerId
        }

        const devices = await deviceRepo.find(query)

        const deviceStatuses = await Promise.all(
            devices.map(async (device) => {
                const subscription = await subscriptionRepo.findOne({
                    device_id: device.device_id,
                    is_active: true
                })

                return {
                    device_id: device.device_id,
                    device_name: device.device_name,
                    device_info: device.device_info,
                    is_active: !!subscription,
                    last_used: device.last_used
                }
            })
        )

        return { devices: deviceStatuses }
    }

    async registerDevice(data: CreateSubscriptionInput) {
        const deviceRepo = this.manager.getRepository(CustomerDevice)
        const subscriptionRepo = this.manager.getRepository(DeviceSubscription)

        if (!data.device_info || !data.subscription) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "device_info and subscription are required"
            )
        }

        const deviceId = this.generateDeviceId(data.device_info)
        const deviceName = this.generateDeviceName(data.device_info)

        // Find or create device
        let device = await deviceRepo.findOne({
            device_id: deviceId,
            customer_id: data.customer_id || null
        })

        if (device) {
            // Update existing device
            device.last_used = new Date()
            this.manager.persist(device)
        } else {
            // Create new device
            device = deviceRepo.create({
                customer_id: data.customer_id,
                device_id: deviceId,
                device_name: deviceName,
                device_info: data.device_info,
                last_used: new Date()
            })
            this.manager.persist(device)
        }

        // Handle subscription
        let subscription = await subscriptionRepo.findOne({
            device_id: deviceId
        })

        if (subscription) {
            // Update existing subscription
            subscription.endpoint = data.subscription.endpoint
            subscription.p256dh = data.subscription.keys.p256dh
            subscription.auth = data.subscription.keys.auth
            subscription.is_active = true
            this.manager.persist(subscription)
        } else {
            // Create new subscription
            subscription = subscriptionRepo.create({
                device_id: deviceId,
                endpoint: data.subscription.endpoint,
                p256dh: data.subscription.keys.p256dh,
                auth: data.subscription.keys.auth,
                is_active: true
            })
            this.manager.persist(subscription)
        }

        // Flush all changes at once
        await this.manager.flush()

        return device
    }

    async sendNotification(deviceId: string, payload: PushNotificationPayload) {
        const deviceRepo = this.manager.getRepository(CustomerDevice)
        const subscriptionRepo = this.manager.getRepository(DeviceSubscription)

        const subscription = await subscriptionRepo.findOne({
            device_id: deviceId,
            is_active: true
        })

        if (!subscription) {
            throw new MedusaError(
                MedusaError.Types.NOT_FOUND,
                `No active subscription found for device ${deviceId}`
            )
        }

        try {
            await this.webpush_.sendNotification(
                {
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: subscription.p256dh,
                        auth: subscription.auth
                    }
                },
                JSON.stringify(payload)
            )

            // Update device last_used timestamp
            const device = await deviceRepo.findOne({
                device_id: deviceId
            })

            if (device) {
                device.last_used = new Date()
                this.manager.persist(device)
                await this.manager.flush()
            }
        } catch (error) {
            if (error.statusCode === 404 || error.statusCode === 410) {
                subscription.is_active = false
                this.manager.persist(subscription)
                await this.manager.flush()
            }
            throw error
        }
    }

    async sendCustomerNotification(
        customerId: string,
        payload: PushNotificationPayload
    ): Promise<{ sent: number; failed: number }> {
        const deviceRepo = this.manager.getRepository(CustomerDevice)

        const devices = await deviceRepo.find({
            customer_id: customerId
        })

        let sent = 0
        let failed = 0

        for (const device of devices) {
            try {
                await this.sendNotification(device.device_id, payload)
                sent++
            } catch (error) {
                failed++
                console.error(`Failed to send to device ${device.id}:`, error)
            }
        }

        return { sent, failed }
    }

    async removeDevice(deviceId: string): Promise<void> {
        const deviceRepo = this.manager.getRepository(CustomerDevice)
        const subscriptionRepo = this.manager.getRepository(DeviceSubscription)

        await subscriptionRepo.nativeDelete({ device_id: deviceId })
        await deviceRepo.nativeDelete({ device_id: deviceId })
    }

    private generateDeviceId(deviceInfo: any): string {
        const uniqueAttributes = [
            deviceInfo.type,
            deviceInfo.os,
            deviceInfo.browser,
            deviceInfo.model
        ].filter(Boolean)

        return Buffer.from(uniqueAttributes.join('-')).toString('base64')
    }

    private generateDeviceName(deviceInfo: any): string {
        return `${deviceInfo.model || deviceInfo.browser} ${deviceInfo.type}`
    }
}