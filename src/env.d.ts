/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  __GAME_CONTEXT__: any;
  __FSM__: any;
  __FSM_STATE__: string;
  __PLAYWRIGHT_TEST__?: boolean;
  webkitAudioContext: typeof AudioContext;
}
