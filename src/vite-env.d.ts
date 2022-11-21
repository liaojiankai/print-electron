/// <reference types="vite/client" />


declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: string, args?: unknown[]): void;
        on(
          channel: Channels,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: Channels, func: (...args: unknown[]) => void): void;
      };
    };
  }
}

export {};
