export interface RolesConfig {
    roles: Role[];
}

export interface Role {
    name: string;
    description: string;
    scopes: string[];
}
