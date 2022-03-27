/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  mount: {
    assets: { url: '/', static: true },
    src: { url: '/build' },
  },
  plugins: [
    'snowpack-lit-scss-plugin',
    "tsconfig-paths-snowpack-plugin",
    [
      '@snowpack/plugin-typescript',
      {
        /* Yarn PnP workaround: see https://www.npmjs.com/package/@snowpack/plugin-typescript */
        ...(process.versions.pnp ? { tsc: 'yarn pnpify tsc' } : {}),
      },
    ],
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    { "match": "routes", "src": ".*", "dest": "/index.html" },
  ],
  optimize: {
    /* Example: Bundle your final build: */
    // "bundle": true,
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
  alias: {
    "~services": "./src/services",
    "~components": "./src/components",
    "~utils": "./src/utils",
    "~assets": "./assets",
    "~src": "./src"
  },
};
