import { ref } from 'vue';

/**
 * Lightweight Hierarchical Finite State Machine
 * @param {Object} config - State configurations
 * @param {Object} context - Shared data/services
 */
export function createFSM(config, context) {
  if (config.debug) console.log("[FSM] Creating machine with config:", config);
  const currentState = ref(config.initial);
  const stateParams = ref({});
  const eventQueue = [];
  let isProcessing = false;

  const getTargetConfig = (target) => {
    return target.split('.').reduce((obj, key) => obj?.states?.[key], config);
  };

  const machine = {
    state: currentState,
    params: stateParams,

    matches(statePath) {
      return currentState.value === statePath || currentState.value.startsWith(statePath + '.');
    },

    transition(target, params = {}) {
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
        const cfg = oldPath.slice(0, i + 1).reduce((obj, key) => obj?.states?.[key], config);
        if (cfg?.onExit) cfg.onExit(context);
      }

      // Update current state before entering to allow transition() calls in onEnter
      currentState.value = target;
      stateParams.value = params;

      // Enter new states (common-down to target)
      for (let i = commonIndex; i < newPath.length; i++) {
        const cfg = newPath.slice(0, i + 1).reduce((obj, key) => obj?.states?.[key], config);
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

    send(event, params = {}) {
      eventQueue.push({ event, params });
      if (isProcessing) return;

      isProcessing = true;
      while (eventQueue.length > 0) {
        const { event: evt, params: p } = eventQueue.shift();
        machine._handleEvent(evt, p);
      }
      isProcessing = false;
    },

    _handleEvent(event, params) {
      const pathParts = currentState.value.split('.');

      // Bubble event up from leaf to root
      for (let i = pathParts.length; i > 0; i--) {
        const cfg = pathParts.slice(0, i).reduce((obj, key) => obj?.states?.[key], config);

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
