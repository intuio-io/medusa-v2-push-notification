# Medusa Push Notification Module (V2)

A push notification module for Medusa v2 that enables web push notifications for your e-commerce store. This module provides the core functionality for managing device registrations and sending push notifications to customers across multiple devices.

## Table of Contents
- [Installation](#installation)
- [Backend Setup](#backend-setup)
- [Frontend Implementation](#frontend-implementation)
- [API Reference](#api-reference)

## Installation

```bash
npm install @intuio/medusa-push-notification
```

## Backend Setup

### 1. Module Configuration

Add to your `medusa-config.js`:
```javascript
module.exports = {
  projectConfig: {
    // ... other config
  },
  modules: [
    {
      resolve: "@intuio/medusa-push-notification"
    }
  ]
}
```

### 2. Environment Variables

Add to your `.env`:
```bash
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:your@email.com
```

Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

### 3. Run Migrations
```bash
npx medusa db:migrate
```

### 4. Create API Routes

In your Medusa project, create these routes:

```typescript
// src/api/store/push-notifications/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { PushNotificationService } from "medusa-push-notification"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    const pushService = req.scope.resolve<PushNotificationService>("push-notification")
    const { customerId } = req.query

    try {
        if (!customerId) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        const result = await pushService.listDevices(customerId as string)
        res.json(result)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    const pushService = req.scope.resolve<PushNotificationService>("push-notification")

    try {
        const { subscription, device_info, customer_id } = req.body
        if (!subscription || !device_info) {
            res.status(400).json({ message: "subscription and device_info are required" })
            return
        }

        const device = await pushService.registerDevice({
            customer_id,
            device_info,
            subscription
        })

        res.json({
            device_id: device.device_id,
            device_name: device.device_name
        })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// src/api/store/push-notifications/[deviceId]/route.ts
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
    const pushService = req.scope.resolve<PushNotificationService>("push-notification")
    const { deviceId } = req.params

    try {
        await pushService.removeDevice(deviceId)
        res.json({ success: true })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
```

### 5. Create Order Subscriber (Optional)

```typescript
// src/subscribers/order-placed.ts
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { IOrderModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { PushNotificationService } from "medusa-push-notification"

export default async function orderPlacedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    const logger = container.resolve("logger")
    const pushService = container.resolve("push-notification") as PushNotificationService
    const orderService = container.resolve(Modules.ORDER) as IOrderModuleService

    try {
        const order = await orderService.retrieveOrder(data.id)

        if (!order || !order.customer_id) {
            logger.debug(`Order ${data.id} has no customer, skipping notification`)
            return
        }

        const notificationPayload = {
            title: "Order Confirmed",
            body: `Order #${order.display_id} has been confirmed!`,
            data: {
                type: "order.placed",
                orderId: order.id
            }
        }

        await pushService.sendCustomerNotification(
            order.customer_id,
            notificationPayload
        )
    } catch (error) {
        logger.error(
            `Failed to send notification: ${error.message}`
        )
    }
}

export const config: SubscriberConfig = {
    event: "order.placed"
}
```

## Frontend Implementation

### 1. Service Worker Setup

Create a service worker file:

```javascript
// public/sw.js
self.addEventListener('push', function(event) {
    if (!event.data) return
    
    const data = event.data.json()
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: data.badge,
            data: data.data,
        })
    )
})

self.addEventListener('notificationclick', function(event) {
    event.notification.close()
    
    if (event.notification.data?.url) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        )
    }
})
```

### 2. Simple Notification Button Component

```typescript
// components/NotificationButton.tsx
import { useState } from 'react'

type DeviceInfo = {
    type: "mobile" | "desktop" | "tablet"
    browser: string
    os: string
    model?: string
}

export function NotificationButton({ customerId }: { customerId?: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const detectDevice = (): DeviceInfo => {
        const ua = navigator.userAgent
        const mobile = /Mobile|Android|iP(ad|hone|od)/i.test(ua)
        const tablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)
        
        return {
            type: mobile ? "mobile" : tablet ? "tablet" : "desktop",
            browser: navigator.userAgent,
            os: navigator.platform
        }
    }

    const enableNotifications = async () => {
        setIsLoading(true)
        setError(null)

        try {
            // Check browser support
            if (!('Notification' in window)) {
                throw new Error('Browser does not support notifications')
            }

            // Request permission
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') {
                throw new Error('Permission not granted')
            }

            // Register service worker
            const registration = await navigator.serviceWorker.register('/sw.js')

            // Get subscription
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            })

            // Send to server
            const response = await fetch('/store/push-notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription,
                    device_info: detectDevice(),
                    customer_id: customerId
                })
            })

            if (!response.ok) throw new Error('Failed to register device')
            
            alert('Push notifications enabled!')
        } catch (err: any) {
            setError(err.message)
            alert(`Error: ${err.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={enableNotifications}
            disabled={isLoading}
            className="btn btn-primary"
        >
            {isLoading ? 'Enabling...' : 'Enable Push Notifications'}
        </button>
    )
}
```

Usage in your React component:
```typescript
import { NotificationButton } from './NotificationButton'

export function MyComponent() {
    return (
        <div>
            <h1>My Store</h1>
            <NotificationButton customerId="cust_123" />
        </div>
    )
}
```

## API Reference

### Service Methods

1. Register Device
```typescript
const device = await pushService.registerDevice({
    customer_id: "cust_123",
    device_info: {
        type: "desktop",
        browser: "chrome",
        os: "windows"
    },
    subscription: {
        endpoint: "https://fcm.googleapis.com/...",
        keys: {
            p256dh: "key",
            auth: "auth"
        }
    }
})
```

2. Send Notification
```typescript
await pushService.sendNotification("device_123", {
    title: "Hello",
    body: "Message here",
    icon: "/icon.png",
    data: { url: "/orders/123" }
})
```

3. Send Customer Notification
```typescript
await pushService.sendCustomerNotification(
    "cust_123",
    {
        title: "Order Update",
        body: "Your order has shipped!"
    }
)
```

### API Endpoints

- `GET /store/push-notifications?customerId=xxx`
- `POST /store/push-notifications`
- `DELETE /store/push-notifications/:deviceId`

## Types

```typescript
type DeviceInfo = {
    type: "mobile" | "desktop" | "tablet"
    browser: string
    os: string
    model?: string
}

type PushNotificationPayload = {
    title: string
    body: string
    icon?: string
    badge?: string
    data?: any
}
```

## Troubleshooting

1. Check service worker registration:
```javascript
const registration = await navigator.serviceWorker.getRegistration()
console.log('Service Worker:', registration)
```

2. Verify VAPID keys:
```javascript
console.log('VAPID Key:', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
```

3. Check browser support:
```javascript
console.log('Notifications supported:', 'Notification' in window)
console.log('Service Worker supported:', 'serviceWorker' in navigator)
```

## License

[MIT](https://choosealicense.com/licenses/mit/)