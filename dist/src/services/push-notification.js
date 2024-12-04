"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationService = void 0;
// src/modules/push-notification/service.ts
const utils_1 = require("@medusajs/framework/utils");
const customer_device_1 = require("../models/customer-device");
const device_subscription_1 = require("../models/device-subscription");
const utils_2 = require("@medusajs/utils");
const web_push_1 = __importDefault(require("web-push"));
class PushNotificationService extends (0, utils_1.MedusaService)({
    CustomerDevice: customer_device_1.CustomerDevice,
    DeviceSubscription: device_subscription_1.DeviceSubscription,
}) {
    constructor(container) {
        super(container);
        this.webpush_ = web_push_1.default;
        this.manager = container.manager;
        this.webpush_.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:your-email@example.com', process.env.VAPID_PUBLIC_KEY || '', process.env.VAPID_PRIVATE_KEY || '');
    }
    // Example of corrected query methods
    async listDevices(customerId) {
        const deviceRepo = this.manager.getRepository(customer_device_1.CustomerDevice);
        const subscriptionRepo = this.manager.getRepository(device_subscription_1.DeviceSubscription);
        // Build query
        const query = {};
        if (customerId) {
            query.customer_id = customerId;
        }
        const devices = await deviceRepo.find(query);
        const deviceStatuses = await Promise.all(devices.map(async (device) => {
            const subscription = await subscriptionRepo.findOne({
                device_id: device.device_id,
                is_active: true
            });
            return {
                device_id: device.device_id,
                device_name: device.device_name,
                device_info: device.device_info,
                is_active: !!subscription,
                last_used: device.last_used
            };
        }));
        return { devices: deviceStatuses };
    }
    async registerDevice(data) {
        const deviceRepo = this.manager.getRepository(customer_device_1.CustomerDevice);
        const subscriptionRepo = this.manager.getRepository(device_subscription_1.DeviceSubscription);
        if (!data.device_info || !data.subscription) {
            throw new utils_2.MedusaError(utils_2.MedusaError.Types.INVALID_DATA, "device_info and subscription are required");
        }
        const deviceId = this.generateDeviceId(data.device_info);
        const deviceName = this.generateDeviceName(data.device_info);
        // Find or create device
        let device = await deviceRepo.findOne({
            device_id: deviceId,
            customer_id: data.customer_id || null
        });
        if (device) {
            // Update existing device
            device.last_used = new Date();
            this.manager.persist(device);
        }
        else {
            // Create new device
            device = deviceRepo.create({
                customer_id: data.customer_id,
                device_id: deviceId,
                device_name: deviceName,
                device_info: data.device_info,
                last_used: new Date()
            });
            this.manager.persist(device);
        }
        // Handle subscription
        let subscription = await subscriptionRepo.findOne({
            device_id: deviceId
        });
        if (subscription) {
            // Update existing subscription
            subscription.endpoint = data.subscription.endpoint;
            subscription.p256dh = data.subscription.keys.p256dh;
            subscription.auth = data.subscription.keys.auth;
            subscription.is_active = true;
            this.manager.persist(subscription);
        }
        else {
            // Create new subscription
            subscription = subscriptionRepo.create({
                device_id: deviceId,
                endpoint: data.subscription.endpoint,
                p256dh: data.subscription.keys.p256dh,
                auth: data.subscription.keys.auth,
                is_active: true
            });
            this.manager.persist(subscription);
        }
        // Flush all changes at once
        await this.manager.flush();
        return device;
    }
    async sendNotification(deviceId, payload) {
        const deviceRepo = this.manager.getRepository(customer_device_1.CustomerDevice);
        const subscriptionRepo = this.manager.getRepository(device_subscription_1.DeviceSubscription);
        const subscription = await subscriptionRepo.findOne({
            device_id: deviceId,
            is_active: true
        });
        if (!subscription) {
            throw new utils_2.MedusaError(utils_2.MedusaError.Types.NOT_FOUND, `No active subscription found for device ${deviceId}`);
        }
        try {
            await this.webpush_.sendNotification({
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.p256dh,
                    auth: subscription.auth
                }
            }, JSON.stringify(payload));
            // Update device last_used timestamp
            const device = await deviceRepo.findOne({
                device_id: deviceId
            });
            if (device) {
                device.last_used = new Date();
                this.manager.persist(device);
                await this.manager.flush();
            }
        }
        catch (error) {
            if (error.statusCode === 404 || error.statusCode === 410) {
                subscription.is_active = false;
                this.manager.persist(subscription);
                await this.manager.flush();
            }
            throw error;
        }
    }
    async sendCustomerNotification(customerId, payload) {
        const deviceRepo = this.manager.getRepository(customer_device_1.CustomerDevice);
        const devices = await deviceRepo.find({
            customer_id: customerId
        });
        let sent = 0;
        let failed = 0;
        for (const device of devices) {
            try {
                await this.sendNotification(device.device_id, payload);
                sent++;
            }
            catch (error) {
                failed++;
                console.error(`Failed to send to device ${device.id}:`, error);
            }
        }
        return { sent, failed };
    }
    async removeDevice(deviceId) {
        const deviceRepo = this.manager.getRepository(customer_device_1.CustomerDevice);
        const subscriptionRepo = this.manager.getRepository(device_subscription_1.DeviceSubscription);
        await subscriptionRepo.nativeDelete({ device_id: deviceId });
        await deviceRepo.nativeDelete({ device_id: deviceId });
    }
    generateDeviceId(deviceInfo) {
        const uniqueAttributes = [
            deviceInfo.type,
            deviceInfo.os,
            deviceInfo.browser,
            deviceInfo.model
        ].filter(Boolean);
        return Buffer.from(uniqueAttributes.join('-')).toString('base64');
    }
    generateDeviceName(deviceInfo) {
        return `${deviceInfo.model || deviceInfo.browser} ${deviceInfo.type}`;
    }
}
exports.PushNotificationService = PushNotificationService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVzaC1ub3RpZmljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmljZXMvcHVzaC1ub3RpZmljYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMkNBQTJDO0FBQzNDLHFEQUF5RDtBQUN6RCwrREFBMEQ7QUFDMUQsdUVBQWtFO0FBQ2xFLDJDQUE2QztBQUU3Qyx3REFBOEI7QUEyQjlCLE1BQWEsdUJBQXdCLFNBQVEsSUFBQSxxQkFBYSxFQUFDO0lBQ3ZELGNBQWMsRUFBZCxnQ0FBYztJQUNkLGtCQUFrQixFQUFsQix3Q0FBa0I7Q0FDckIsQ0FBQztJQUlFLFlBQVksU0FBUztRQUNqQixLQUFLLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDaEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxrQkFBTyxDQUFBO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQTtRQUVoQyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksK0JBQStCLEVBQzVELE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLElBQUksRUFBRSxFQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixJQUFJLEVBQUUsQ0FDdEMsQ0FBQTtJQUNMLENBQUM7SUFFRCxxQ0FBcUM7SUFFckMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxVQUFtQjtRQUNqQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxnQ0FBYyxDQUFDLENBQUE7UUFDN0QsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyx3Q0FBa0IsQ0FBQyxDQUFBO1FBRXZFLGNBQWM7UUFDZCxNQUFNLEtBQUssR0FBUSxFQUFFLENBQUE7UUFDckIsSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUNiLEtBQUssQ0FBQyxXQUFXLEdB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