/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Optional URL of the maze data collector. When set, consented runs are
  // POSTed there; when unset, gameplay data stays in the browser only.
  readonly VITE_MAZE_COLLECTOR?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
