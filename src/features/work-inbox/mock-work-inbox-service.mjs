import { buildWorkInbox } from "./work-inbox-domain.mjs";

export function createMockWorkInboxService({ source = {}, options = {} } = {}) {
  let currentSource = source;

  async function loadInbox() {
    return buildWorkInbox(currentSource, options);
  }

  function setSource(nextSource) {
    currentSource = nextSource;
  }

  return {
    loadInbox,
    setSource,
    subscribeToInboxEvents: () => () => {},
    debugSource: () => currentSource,
  };
}
