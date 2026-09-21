export const resolveContactEndpoint = (configuredEndpoint) => (
  configuredEndpoint?.trim() || '/api/contact'
);
