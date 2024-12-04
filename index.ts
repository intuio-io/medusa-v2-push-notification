// index.ts
import { Module } from "@medusajs/framework/utils"
import { PushNotificationService } from "./src/services/push-notification"
export const PUSH_NOTIFICATION_MODULE = "push-notification"


export default Module(PUSH_NOTIFICATION_MODULE, {
    service: PushNotificationService,
})

export * from "./src/services/push-notification"