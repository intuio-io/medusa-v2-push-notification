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
exports.CustomerDevice = void 0;
// src/models/customer-device.ts
const core_1 = require("@mikro-orm/core");
const utils_1 = require("@medusajs/framework/utils");
let CustomerDevice = class CustomerDevice extends utils_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.last_used = new Date();
    }
};
exports.CustomerDevice = CustomerDevice;
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], CustomerDevice.prototype, "customer_id", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], CustomerDevice.prototype, "device_id", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], CustomerDevice.prototype, "device_name", void 0);
__decorate([
    (0, core_1.Property)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], CustomerDevice.prototype, "device_info", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", Date)
], CustomerDevice.prototype, "last_used", void 0);
exports.CustomerDevice = CustomerDevice = __decorate([
    (0, core_1.Entity)()
], CustomerDevice);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tZXItZGV2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVscy9jdXN0b21lci1kZXZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsZ0NBQWdDO0FBQ2hDLDBDQUFrRDtBQUNsRCxxREFBc0Q7QUFVL0MsSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBZSxTQUFRLGtCQUFVO0lBQXZDOztRQWNILGNBQVMsR0FBUyxJQUFJLElBQUksRUFBRSxDQUFBO0lBQ2hDLENBQUM7Q0FBQSxDQUFBO0FBZlksd0NBQWM7QUFFdkI7SUFEQyxJQUFBLGVBQVEsRUFBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQzs7bURBQ1Q7QUFHcEI7SUFEQyxJQUFBLGVBQVEsR0FBRTs7aURBQ087QUFHbEI7SUFEQyxJQUFBLGVBQVEsR0FBRTs7bURBQ1M7QUFHcEI7SUFEQyxJQUFBLGVBQVEsRUFBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQzs7bURBQ0o7QUFHeEI7SUFEQyxJQUFBLGVBQVEsR0FBRTs4QkFDQSxJQUFJO2lEQUFhO3lCQWRuQixjQUFjO0lBRDFCLElBQUEsYUFBTSxHQUFFO0dBQ0ksY0FBYyxDQWUxQiJ9