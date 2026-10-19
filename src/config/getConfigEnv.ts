declare global {
  interface Window {
    __env__: any
  }
}

export interface EnvConfig {
  baseURL: string
}

export const getConfigEnv = (): EnvConfig => {
  const configs = window.__env__
    ? JSON.stringify(window.__env__)
    : import.meta.env.VITE_APP_OP_CONFIG

  const parseConfig: EnvConfig = JSON.parse(configs as string)
  return parseConfig
}
