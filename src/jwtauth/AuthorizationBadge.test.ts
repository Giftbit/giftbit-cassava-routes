import * as chai from "chai";
import {AuthorizationBadge} from "./AuthorizationBadge";

describe("AuthorizationBadge", () => {
    describe("effectiveScopes", () => {
        it("is calculated with RolesConfig", () => {
            const badge: AuthorizationBadge = new AuthorizationBadge({
                scopes: ["wildwest:okcorral:whisky:sipping"],
                roles: ["DocHoliday", "VirgilEarp"]
            }, {
                roles: [
                    {
                        name: "DocHoliday",
                        description: "",
                        scopes: [
                            "wildwest:okcorral:gunfighter",
                            "wildwest:okcorral:dentist",
                            "wildwest:okcorral:gambler",
                            "wildwest:okcorral:law:deputy:temp"
                        ]
                    },
                    {
                        name: "WyattEarp",
                        description: "",
                        scopes: [
                            "wildwest:okcorral:gambler",
                            "wildwest:okcorral:law:deputy"
                        ]
                    },
                    {
                        name: "VirgilEarp",
                        description: "",
                        scopes: [
                            "wildwest:okcorral:law"
                        ]
                    }
                ]
            });

            chai.assert.sameDeepMembers(badge.effectiveScopes, [
                "wildwest:okcorral:whisky:sipping",
                "wildwest:okcorral:gunfighter",
                "wildwest:okcorral:dentist",
                "wildwest:okcorral:gambler",
                "wildwest:okcorral:law:deputy:temp",
                "wildwest:okcorral:law"
            ]);
        });

        it("negates scopes that are an exact match", () => {
            const badge: AuthorizationBadge = new AuthorizationBadge({
                scopes: ["wildwest:okcorral:whisky:sipping", "-wildwest:okcorral:gunfighter", "-wildwest:okcorral:law:deputy:temp"],
                roles: ["DocHoliday", "VirgilEarp"]
            }, {
                roles: [
                    {
                        name: "DocHoliday",
                        description: "",
                        scopes: [
                            "wildwest:okcorral:gunfighter",
                            "wildwest:okcorral:dentist",
                            "wildwest:okcorral:gambler",
                            "wildwest:okcorral:law:deputy:temp"
                        ]
                    },
                    {
                        name: "WyattEarp",
                        description: "",
                        scopes: [
                            "wildwest:okcorral:gambler",
                            "wildwest:okcorral:law:deputy"
                        ]
                    },
                    {
                        name: "VirgilEarp",
                        description: "",
                        scopes: [
                            "wildwest:okcorral:law"
                        ]
                    }
                ]
            });

            chai.assert.sameDeepMembers(badge.effectiveScopes, [
                "wildwest:okcorral:whisky:sipping",
                "wildwest:okcorral:dentist",
                "wildwest:okcorral:gambler",
                "wildwest:okcorral:law"
            ]);
        });

        it("negates scopes that are less powerful but not those more powerful", () => {
            const badge: AuthorizationBadge = new AuthorizationBadge({
                scopes: ["wildwest:okcorral:whisky:sipping", "-wildwest:okcorral:gunfighter:gatlinggun", "-wildwest:okcorral:law"],
                roles: ["DocHoliday", "VirgilEarp"]
            }, {
                roles: [
                    {
                        name: "DocHoliday",
                        description: "",
                        scopes: [
                            "wildwest:okcorral:gunfighter",
                            "wildwest:okcorral:dentist",
                            "wildwest:okcorral:gambler",
                            "wildwest:okcorral:law:deputy:temp"
                        ]
                    },
                    {
                        name: "WyattEarp",
                        description: "",
                        scopes: [
                            "wildwest:okcorral:gambler",
                            "wildwest:okcorral:law:deputy"
                        ]
                    },
                    {
                        name: "VirgilEarp",
                        description: "",
                        scopes: [
                            "wildwest:okcorral:law"
                        ]
                    }
                ]
            });

            chai.assert.sameDeepMembers(badge.effectiveScopes, [
                "wildwest:okcorral:whisky:sipping",
                "wildwest:okcorral:gunfighter",
                "wildwest:okcorral:dentist",
                "wildwest:okcorral:gambler"
            ]);
        });

        it("negates scopes from its own scope list", () => {
            const badge: AuthorizationBadge = new AuthorizationBadge({
                scopes: ["-wildwest:okcorral:whisky", "wildwest:okcorral:whisky:sipping", "wildwest:okcorral:whisky:mixing", "-wildwest:okcorral:gunfighter:gatlinggun", "-wildwest:okcorral:law"],
                roles: ["DocHoliday", "VirgilEarp"]
            }, {
                roles: [
                    {
                        name: "DocHoliday",
                        description: "",
                        scopes: [
                            "wildwest:okcorral:gunfighter",
                            "wildwest:okcorral:dentist",
                            "wildwest:okcorral:gambler",
                            "wildwest:okcorral:law:deputy:temp"
                        ]
                    },
                    {
                        name: "WyattEarp",
                        description: "",
                        scopes: [
                            "wildwest:okcorral:gambler",
                            "wildwest:okcorral:law:deputy"
                        ]
                    },
                    {
                        name: "VirgilEarp",
                        description: "",
                        scopes: [
                            "wildwest:okcorral:law"
                        ]
                    }
                ]
            });

            chai.assert.sameDeepMembers(badge.effectiveScopes, [
                "wildwest:okcorral:gunfighter",
                "wildwest:okcorral:dentist",
                "wildwest:okcorral:gambler"
            ]);
        });
    });

    describe("isBadgeAuthorized()", () => {
        it("verifies an exact match", () => {
            const badge: AuthorizationBadge = new AuthorizationBadge({
                scopes: [
                    "lightrailV1:transaction:create:drawdown",
                    "lightrailV1:foo:bar:baz"
                ]
            });

            chai.assert.isTrue(badge.isBadgeAuthorized("lightrailV1:transaction:create:drawdown"));
            chai.assert.isTrue(badge.isBadgeAuthorized("lightrailV1:foo:bar:baz"));
        });

        it("verifies more powerful scopes", () => {
            const badge: AuthorizationBadge = new AuthorizationBadge({
                scopes: [
                    "lightrailV1:transaction",
                    "lightrailV1:foo"
                ]
            });

            chai.assert.isTrue(badge.isBadgeAuthorized("lightrailV1:transaction:create:drawdown"));
            chai.assert.isTrue(badge.isBadgeAuthorized("lightrailV1:foo:bar:baz"));
        });

        it("does not verify anything else", () => {
            const badge: AuthorizationBadge = new AuthorizationBadge({
                scopes: [
                    "lightrailV1:transaction:create:drawdown",
                    "lightrailV1:foo:bar:baz"
                ]
            });

            chai.assert.isFalse(badge.isBadgeAuthorized(undefined));
            chai.assert.isFalse(badge.isBadgeAuthorized(null));
            chai.assert.isFalse(badge.isBadgeAuthorized(""));
            chai.assert.isFalse(badge.isBadgeAuthorized(14901 as any));
            chai.assert.isFalse(badge.isBadgeAuthorized("lightrailV1"));
            chai.assert.isFalse(badge.isBadgeAuthorized("lightrailV1:transaction"));
            chai.assert.isFalse(badge.isBadgeAuthorized("lightrailV1:transaction:create"));
            chai.assert.isFalse(badge.isBadgeAuthorized("lightrailV1:Transaction:create:drawdown"));
            chai.assert.isFalse(badge.isBadgeAuthorized("transaction:create:drawdown"));
            chai.assert.isFalse(badge.isBadgeAuthorized("create:drawdown"));
            chai.assert.isFalse(badge.isBadgeAuthorized("drawdown"));
            chai.assert.isFalse(badge.isBadgeAuthorized("lightrailV1:foo:create:drawdown"));
            chai.assert.isFalse(badge.isBadgeAuthorized("lightrailV1:foo:create:baz"));
        });
    });
});
