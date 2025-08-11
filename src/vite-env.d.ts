/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERP_API_KEY: string;
  readonly VITE_SERP_PROVIDER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
