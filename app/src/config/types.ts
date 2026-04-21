import { z } from 'zod';

export const ProfileSchema = z.enum(['local', 'dev', 'prod']);
export type Profile = z.infer<typeof ProfileSchema>;

export const AuthProviderKeySchema = z.enum(['mock', 'google-pkce-iap']);
export type AuthProviderKey = z.infer<typeof AuthProviderKeySchema>;

export const ApiModeSchema = z.enum(['direct', 'bff', 'remote']);
export type ApiMode = z.infer<typeof ApiModeSchema>;
