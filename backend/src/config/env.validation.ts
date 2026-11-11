const REQUIRED = ['MONGODB_URI', 'JWT_SECRET', 'CORS_ORIGIN'] as const;

export function validateEnv(config: Record<string, unknown>) {
  const missing = REQUIRED.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  if (String(config.JWT_SECRET).length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  return config;
}
