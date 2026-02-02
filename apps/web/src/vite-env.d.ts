/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

// Support for process.env (CRA compatibility)
declare namespace NodeJS {
    interface ProcessEnv {
        REACT_APP_API_URL?: string
    }
}
