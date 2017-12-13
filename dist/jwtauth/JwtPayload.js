"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JwtPayload;
(function (JwtPayload) {
    function isTestUser(payload) {
        return payload && payload.g && payload.g.gui && payload.g.gui.endsWith("-TEST");
    }
    JwtPayload.isTestUser = isTestUser;
})(JwtPayload = exports.JwtPayload || (exports.JwtPayload = {}));
//# sourceMappingURL=JwtPayload.js.map