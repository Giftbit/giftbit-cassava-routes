import * as chai from "chai";
import * as jwt from "jsonwebtoken";
import {AuthorizationBadge} from "./AuthorizationBadge";
import {JwtPayload} from "./JwtPayload";

describe("AuthorizationBadge", () => {
    describe("effectiveScopes", () => {
        it("is calculated with RolesConfig", () => {
            const badge: AuthorizationBadge = new AuthorizationBadge({
                scopes: ["wildwest:okcorral:whisky:sipping"],
                roles: ["DocHoliday", "VirgilEarp"]
            }, {
                rolesConfig: {
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
                }
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
                rolesConfig: {
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
                }
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
                rolesConfig: {
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
                }
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
                rolesConfig: {
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
                }
            });

            chai.assert.sameDeepMembers(badge.effectiveScopes, [
                "wildwest:okcorral:gunfighter",
                "wildwest:okcorral:dentist",
                "wildwest:okcorral:gambler"
            ]);
        });
    });

    describe("hasScope()", () => {
        it("verifies an exact match", () => {
            const badge: AuthorizationBadge = new AuthorizationBadge({
                scopes: [
                    "lightrailV1:transaction:create:drawdown",
                    "lightrailV1:foo:bar:baz"
                ]
            });

            chai.assert.isTrue(badge.hasScope("lightrailV1:transaction:create:drawdown"));
            chai.assert.isTrue(badge.hasScope("lightrailV1:foo:bar:baz"));
        });

        it("verifies more powerful scopes", () => {
            const badge: AuthorizationBadge = new AuthorizationBadge({
                scopes: [
                    "lightrailV1:transaction",
                    "lightrailV1:foo"
                ]
            });

            chai.assert.isTrue(badge.hasScope("lightrailV1:transaction:create:drawdown"));
            chai.assert.isTrue(badge.hasScope("lightrailV1:foo:bar:baz"));
        });

        it("does not verify anything else", () => {
            const badge: AuthorizationBadge = new AuthorizationBadge({
                scopes: [
                    "lightrailV1:transaction:create:drawdown",
                    "lightrailV1:foo:bar:baz"
                ]
            });

            chai.assert.isFalse(badge.hasScope(undefined));
            chai.assert.isFalse(badge.hasScope(null));
            chai.assert.isFalse(badge.hasScope(""));
            chai.assert.isFalse(badge.hasScope(14901 as any));
            chai.assert.isFalse(badge.hasScope("lightrailV1"));
            chai.assert.isFalse(badge.hasScope("lightrailV1:transaction"));
            chai.assert.isFalse(badge.hasScope("lightrailV1:transaction:create"));
            chai.assert.isFalse(badge.hasScope("lightrailV1:Transaction:create:drawdown"));
            chai.assert.isFalse(badge.hasScope("transaction:create:drawdown"));
            chai.assert.isFalse(badge.hasScope("create:drawdown"));
            chai.assert.isFalse(badge.hasScope("drawdown"));
            chai.assert.isFalse(badge.hasScope("lightrailV1:foo:create:drawdown"));
            chai.assert.isFalse(badge.hasScope("lightrailV1:foo:create:baz"));
        });
    });

    describe("getJwtPayload()", () => {
        it("returns the same value the badge was constructed with", () => {
            const jwt: Partial<JwtPayload> = {
                "g": {
                    "gui": "user-7052210bcb94448b825ffa68508d29ad-TEST",
                    "gmi": "user-7052210bcb94448b825ffa68508d29ad-TEST"
                },
                "iat": 1488911646.603,
                "jti": "badge-dd95b9b582e840ecba1cbf41365d57e1",
                "scopes": [
                    "C",
                    "T",
                    "R",
                    "CEC",
                    "CER",
                    "UA",
                    "F"
                ]
            };

            const auth = new AuthorizationBadge(jwt);
            const newJwt = auth.getJwtPayload();

            chai.assert.notEqual(newJwt, jwt);
            chai.assert.deepEqual(newJwt, jwt);
        });

        it("returns a number iat even when constructed with a string date iat", () => {
            const jwt: Partial<JwtPayload> = {
                "g": {
                    "gui": "user-7052210bcb94448b825ffa68508d29ad-TEST",
                    "gmi": "user-7052210bcb94448b825ffa68508d29ad-TEST"
                },
                "iat": "2017-03-07T18:34:06.603Z",
                "jti": "badge-dd95b9b582e840ecba1cbf41365d57e1",
                "scopes": [
                    "C",
                    "T",
                    "R",
                    "CEC",
                    "CER",
                    "UA",
                    "F"
                ]
            };

            const auth = new AuthorizationBadge(jwt);
            const newJwt = auth.getJwtPayload();

            chai.assert.equal(newJwt.iat, 1488911646.603);
        });

        it("does not mix effective scopes into scopes", () => {
            const jwt: Partial<JwtPayload> = {
                "g": {
                    "gui": "user-7052210bcb94448b825ffa68508d29ad-TEST",
                    "gmi": "user-7052210bcb94448b825ffa68508d29ad-TEST"
                },
                "iat": 1488911646.603,
                "jti": "badge-dd95b9b582e840ecba1cbf41365d57e1",
                "scopes": [
                    "C",
                    "T",
                    "R",
                    "CEC",
                    "CER",
                    "UA",
                    "F",
                    "wildwest:okcorral:whisky:sipping",
                ],
                roles: [
                    "DocHoliday",
                    "VirgilEarp"
                ]
            };
            const rolesConfig = {
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
            };

            const auth = new AuthorizationBadge(jwt, {rolesConfig});
            const newJwt = auth.getJwtPayload();

            chai.assert.notEqual(newJwt, jwt);
            chai.assert.deepEqual(newJwt, jwt);
        });
    });

    describe("sign()", () => {
        it("returns the same jwt that was decoded", () => {
            const originalHeader = {
                "ver": 2,
                "vav": 1,
                "alg": "HS256",
                "typ": "JWT"
            };
            const originalPayload: JwtPayload = {
                "g": {
                    "gui": "user-7052210bcb94448b825ffa68508d29ad-TEST",
                    "gmi": "user-7052210bcb94448b825ffa68508d29ad-TEST"
                },
                "iat": 1488911646.603,
                "jti": "badge-dd95b9b582e840ecba1cbf41365d57e1",
                "scopes": [
                    "C",
                    "T",
                    "R",
                    "CEC",
                    "CER",
                    "UA",
                    "F"
                ]
            };

            const auth = new AuthorizationBadge(originalPayload);
            const newToken = auth.sign("secret");
            const newHeader = (jwt.decode(newToken, {complete: true}) as any).header;
            const newPayload = jwt.verify(newToken, "secret", {algorithms: ["HS256"]});

            chai.assert.deepEqual(originalPayload, newPayload);
            chai.assert.deepEqual(originalHeader, newHeader);
        });

        it("signs a newer JWT with roles and parentJti", () => {
            const originalHeader = {
                "ver": 2,
                "vav": 1,
                "alg": "HS256",
                "typ": "JWT"
            };
            const originalPayload: JwtPayload = {
                "g": {
                    "gui": "user-f7ddcbbfe0e741c688993da35669a47b",
                    "gmi": "user-f7ddcbbfe0e741c688993da35669a47b",
                    "tmi": "user-f7ddcbbfe0e741c688993da35669a47b",
                    "coi": "don't play coi with me"
                },
                "aud": "API_KEY",
                "iss": "SERVICES_V1",
                "iat": 1508444281.149,
                "jti": "badge-cca79a9a42134e609aafdc8e9482854e",
                "parentJti": "badge-11ee41e6d9b1477da63cb23a3f3b50ec",
                "scopes": [],
                "roles": [
                    "accountManager",
                    "contactManager",
                    "customerServiceManager",
                    "customerServiceRepresentative",
                    "pointOfSale",
                    "programManager",
                    "promoter",
                    "reporter",
                    "securityManager",
                    "teamAdmin",
                    "webPortal"
                ],
                "metadata": {
                    "stripeShopperToken": "tok_visa"
                }
            };

            const auth = new AuthorizationBadge(originalPayload);
            const newToken = auth.sign("secret");
            const newHeader = (jwt.decode(newToken, {complete: true}) as any).header;
            const newPayload = jwt.verify(newToken, "secret", {algorithms: ["HS256"]});

            chai.assert.deepEqual(originalPayload, newPayload);
            chai.assert.deepEqual(originalHeader, newHeader);
        });
    });

    describe("assumeJwtIdentity()", () => {
        it("can assume the given identity", () => {
            const auth = new AuthorizationBadge({
                "g": {
                    "gui": "user-f7ddcbbfe0e741c688993da35669a47b",
                    "gmi": "user-f7ddcbbfe0e741c688993da35669a47b",
                    "tmi": "user-f7ddcbbfe0e741c688993da35669a47b"
                },
                "aud": "API_KEY",
                "iss": "SERVICES_V1",
                "iat": 1508444281.149,
                "jti": "badge-cca79a9a42134e609aafdc8e9482854e",
                "parentJti": "badge-11ee41e6d9b1477da63cb23a3f3b50ec",
                "scopes": [
                    "ASSUME"
                ],
                "roles": [
                    "accountManager",
                    "contactManager",
                    "customerServiceManager",
                    "customerServiceRepresentative",
                    "pointOfSale",
                    "programManager",
                    "promoter",
                    "reporter",
                    "securityManager",
                    "teamAdmin",
                    "webPortal"
                ]
            });

            const auth2 = auth.assumeJwtIdentity({
                "g": {
                    "gui": "user-123-TEST",
                    "gmi": "user-123-TEST"
                },
                "iat": "2017-04-25T22:09:33.266+0000",
                "jti": "badge-2",
                "scopes": [
                    "IRRELEVANT"
                ],
                "roles": [
                    "pointOfSale"
                ]
            });

            chai.assert.isFalse(auth2.hasScope("ASSUME"), `not in ${JSON.stringify(auth2.scopes)} or ${JSON.stringify(auth2.effectiveScopes)}`);
            chai.assert.equal(auth2.userId, "user-123-TEST");
            chai.assert.equal(auth2.merchantId, "user-123-TEST");
            chai.assert.equal(auth2.uniqueIdentifier, "badge-cca79a9a42134e609aafdc8e9482854e");
            chai.assert.equal(auth2.parentUniqueIdentifier, "badge-2");
            chai.assert.deepEqual(auth2.scopes, []);
            chai.assert.deepEqual(auth2.roles, [
                "accountManager",
                "contactManager",
                "customerServiceManager",
                "customerServiceRepresentative",
                "pointOfSale",
                "programManager",
                "promoter",
                "reporter",
                "securityManager",
                "teamAdmin",
                "webPortal"
            ]);
        });

        it("requires the original identity to have ASSUME scope", () => {
            const auth = new AuthorizationBadge({
                "g": {
                    "gui": "user-f7ddcbbfe0e741c688993da35669a47b",
                    "gmi": "user-f7ddcbbfe0e741c688993da35669a47b",
                    "tmi": "user-f7ddcbbfe0e741c688993da35669a47b"
                },
                "aud": "API_KEY",
                "iss": "SERVICES_V1",
                "iat": 1508444281.149,
                "jti": "badge-cca79a9a42134e609aafdc8e9482854e",
                "parentJti": "badge-11ee41e6d9b1477da63cb23a3f3b50ec",
                "scopes": [],
                "roles": [
                    "accountManager",
                    "contactManager",
                    "customerServiceManager",
                    "customerServiceRepresentative",
                    "pointOfSale",
                    "programManager",
                    "promoter",
                    "reporter",
                    "securityManager",
                    "teamAdmin",
                    "webPortal"
                ]
            }, {
                errorLogFunction: () => {}
            });

            chai.assert.throws(() => {
                auth.assumeJwtIdentity({
                    "g": {
                        "gui": "user-123-TEST",
                        "gmi": "user-123-TEST"
                    },
                    "iat": "2017-04-25T22:09:33.266+0000",
                    "jti": "badge-2",
                    "scopes": [
                        "C",
                        "T",
                        "R",
                        "F",
                        "CEC",
                        "CER",
                        "UA"
                    ]
                });
            });
        });
    });
});
