import { ref, type Ref } from 'vue';

export interface FSMConfig {
  initial: string;
  debug?: boolean;
  states: Record<string, FSMStateConfig>;
}

export interface FSMStateConfig {
  initial?: string;
  states?: Record<string, FSMStateConfig>;
  onEnter?: (context: any, params: any) => void;
  onExit?: (context: any) => void;
  on?: Record<string, string | ((context: any, params: any) => any) | { target: string; params?: any }>;
}

export interface FSMMachine {
  state: Ref<string>;
  params: Ref<any>;
  matches(statePath: string): boolean;
  transition(target: string, params?: any): Promise<void> | void;
  send(event: string, params?: any): void;
  _handleEvent(event: string, params: any): void;
  init(): Promise<void>;
}

/**
 * Lightweight Hierarchical Finite State Machine
 */
export function createFSM(config: FSMConfig, context: any): FSMMachine {
  if (config.debug) console.log("[FSM] Creating machine with config:", config);
  const currentState = ref(config.initial);
  const stateParams = ref<any>({});
  const eventQueue: { event: string; params: any }[] = [];
  let isProcessing = false;

  const getTargetConfig = (target: string): FSMStateConfig | undefined => {
    return target.split('.').reduce((obj: any, key: string) => obj?.states?.[key], config) as FSMStateConfig;
  };

  const machine: FSMMachine = {
    state: currentState,
    params: stateParams,

    matches(statePath: string) {
      return currentState.value === statePath || currentState.value.startsWith(statePath + '.');
    },

    transition(target: string, params: any = {}) {
      const targetConfig = getTargetConfig(target);
      if (!targetConfig) {
        console.warn(`[FSM] State not found: ${target}`);
        return;
      }

      const oldPath = currentState.value ? currentState.value.split('.') : [];
      const newPath = target.split('.');

      // Find common ancestor
      let commonIndex = 0;
      while (commonIndex < oldPath.length && commonIndex < newPath.length && oldPath[commonIndex] === newPath[commonIndex]) {
        commonIndex++;
      }

      // Exit old states (bottom-up to common)
      for (let i = oldPath.length - 1; i >= commonIndex; i--) {
        const cfg = oldPath.slice(0, i + 1).reduce((obj: any, key) => obj?.states?.[key], config) as FSMStateConfig;
        if (cfg?.onExit) cfg.onExit(context);
      }

      // Update current state before entering to allow transition() calls in onEnter
      currentState.value = target;
      stateParams.value = params;

      // Enter new states (common-down to target)
      for (let i = commonIndex; i < newPath.length; i++) {
        const cfg = newPath.slice(0, i + 1).reduce((obj: any, key) => obj?.states?.[key], config) as FSMStateConfig;
        if (cfg?.onEnter) {
          // Pass params only to the leaf state's onEnter
          const isLeaf = (i === newPath.length - 1);
          cfg.onEnter(context, isLeaf ? params : {});
        }
      }

      if (config.debug) {
        console.log(`[FSM] Transition: ${oldPath.join('.')} -> ${target}`, params);
        if (typeof window !== 'undefined') window.__FSM_STATE__ = target;
      }
    },

    send(event: string, params: any = {}) {
      eventQueue.push({ event, params });
      if (isProcessing) return;

      isProcessing = true;
      while (eventQueue.length > 0) {
        const item = eventQueue.shift();
        if (item) {
          machine._handleEvent(item.event, item.params);
        }
      }
      isProcessing = false;
    },

    _handleEvent(event: string, params: any) {
      const pathParts = currentState.value.split('.');

      // Bubble event up from leaf to root
      for (let i = pathParts.length; i > 0; i--) {
        const cfg = pathParts.slice(0, i).reduce((obj: any, key: string) => obj?.states?.[key], config) as FSMStateConfig;

        if (cfg?.on?.[event]) {
          const result = cfg.on[event];
          let nextState = null;
          let nextParams = params;

          if (typeof result === 'string') {
            nextState = result;
          } else if (typeof result === 'function') {
            const outcome = result(context, params);
            if (!outcome) return; // Function handled it or ignored it
            if (typeof outcome === 'string') {
              nextState = outcome;
            } else if (outcome.target) {
              nextState = outcome.target;
              nextParams = outcome.params || params;
            }
          } else if (result.target) {
            nextState = result.target;
            nextParams = result.params || params;
          }

          if (nextState) {
            this.transition(nextState, nextParams);
          }
          return;
        }
      }

      if (config.debug) {
        console.warn(`[FSM] Unhandled event "${event}" in state ${currentState.value}`);
      }
    },

    async init() {
      if (config.initial) {
        const initial = config.initial;
        // Reset state so transition thinks we're coming from nowhere
        currentState.value = "";
        await this.transition(initial);
      }
    }
  };

  return machine;
}
