/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_USERNAME?: string;
  readonly VITE_GITHUB_TOKEN?: string;
  readonly VITE_PYPI_PACKAGES?: string;
  readonly VITE_HF_USERNAME?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_PROFILE_IMAGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
