"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUSH_NOTIFICATION_MODULE = void 0;
// index.ts
const utils_1 = require("@medusajs/framework/utils");
const push_notification_1 = require("./services/push-notification");
exports.PUSH_NOTIFICATION_MODULE = "push-notification";
exports.default = (0, utils_1.Module)(exports.PUSH_NOTIFICATION_MODULE, {
    service: push_notification_1.PushNotificationService,
});
__exportStar(require("./services/push-notification"), exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxXQUFXO0FBQ1gscURBQWtEO0FBQ2xELG9FQUFzRTtBQUN6RCxRQUFBLHdCQUF3QixHQUFHLG1CQUFtQixDQUFBO0FBRzNELGtCQUFlLElBQUEsY0FBTSxFQUFDLGdDQUF3QixFQUFFO0lBQzVDLE9BQU8sRUFBRSwyQ0FBdUI7Q0FDbkMsQ0FBQyxDQUFBO0FBRUYsK0RBQTRDIn0=