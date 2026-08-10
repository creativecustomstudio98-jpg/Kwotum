type DesignSystemEnvironment = Readonly<{
  deploymentEnv?: string | undefined;
  vercelEnv?: string | undefined;
}>;

export function isDesignSystemAvailable(
  environment: DesignSystemEnvironment = {
    deploymentEnv: process.env.DEPLOYMENT_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  },
): boolean {
  const deploymentEnv =
    environment.deploymentEnv ?? (environment.vercelEnv === "production" ? "production" : "local");

  return deploymentEnv === "local" || deploymentEnv === "preview";
}
