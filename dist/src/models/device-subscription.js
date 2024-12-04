"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceSubscription = void 0;
// src/models/device-subscription.ts
const core_1 = require("@mikro-orm/core");
const utils_1 = require("@medusajs/framework/utils");
let DeviceSubscription = class DeviceSubscription extends utils_1.BaseEntity {
};
exports.DeviceSubscription = DeviceSubscription;
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], DeviceSubscription.prototype, "device_id", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], DeviceSubscription.prototype, "endpoint", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], DeviceSubscription.prototype, "p256dh", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], DeviceSubscription.prototype, "auth", void 0);
__decorate([
    (0, core_1.Property)({ default: true }),
    __metadata("design:type", Boolean)
], DeviceSubscription.prototype, "is_active", void 0);
exports.DeviceSubscription = DeviceSubscription = __decorate([
    (0, core_1.Entity)()
], DeviceSubscription);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLXN1YnNjcmlwdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tb2RlbHMvZGV2aWNlLXN1YnNjcmlwdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxvQ0FBb0M7QUFDcEMsMENBQWtEO0FBQ2xELHFEQUFzRDtBQUcvQyxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFtQixTQUFRLGtCQUFVO0NBZWpELENBQUE7QUFmWSxnREFBa0I7QUFFM0I7SUFEQyxJQUFBLGVBQVEsR0FBRTs7cURBQ087QUFHbEI7SUFEQyxJQUFBLGVBQVEsR0FBRTs7b0RBQ007QUFHakI7SUFEQyxJQUFBLGVBQVEsR0FBRTs7a0RBQ0k7QUFHZjtJQURDLElBQUEsZUFBUSxHQUFFOztnREFDRTtBQUdiO0lBREMsSUFBQSxlQUFRLEVBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7O3FEQUNUOzZCQWRWLGtCQUFrQjtJQUQ5QixJQUFBLGFBQU0sR0FBRTtHQUNJLGtCQUFrQixDQWU5QiJ9