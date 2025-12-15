// Type declarations for modules without types

declare module 'sonner' {
  import { FC, ReactNode } from 'react';

  export interface ToasterProps {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    expand?: boolean;
    duration?: number;
    visibleToasts?: number;
    closeButton?: boolean;
    richColors?: boolean;
    theme?: 'light' | 'dark' | 'system';
    className?: string;
    style?: React.CSSProperties;
    offset?: string | number;
    dir?: 'ltr' | 'rtl' | 'auto';
    hotkey?: string[];
    invert?: boolean;
    toastOptions?: {
      className?: string;
      style?: React.CSSProperties;
    };
    gap?: number;
    loadingIcon?: ReactNode;
    pauseWhenPageIsHidden?: boolean;
  }

  export const Toaster: FC<ToasterProps>;

  export interface ToastOptions {
    id?: string | number;
    icon?: ReactNode;
    duration?: number;
    position?: ToasterProps['position'];
    dismissible?: boolean;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
    cancel?: {
      label: string;
      onClick?: () => void;
    };
    onDismiss?: () => void;
    onAutoClose?: () => void;
    className?: string;
    style?: React.CSSProperties;
  }

  interface ToastFunction {
    (message: string | ReactNode, options?: ToastOptions): string | number;
    success: (message: string | ReactNode, options?: ToastOptions) => string | number;
    error: (message: string | ReactNode, options?: ToastOptions) => string | number;
    warning: (message: string | ReactNode, options?: ToastOptions) => string | number;
    info: (message: string | ReactNode, options?: ToastOptions) => string | number;
    loading: (message: string | ReactNode, options?: ToastOptions) => string | number;
    promise: <T>(
      promise: Promise<T>,
      options: {
        loading: string | ReactNode;
        success: string | ReactNode | ((data: T) => string | ReactNode);
        error: string | ReactNode | ((error: unknown) => string | ReactNode);
      }
    ) => Promise<T>;
    dismiss: (id?: string | number) => void;
    custom: (jsx: ReactNode, options?: ToastOptions) => string | number;
  }

  export const toast: ToastFunction;
}

declare module '@monaco-editor/react' {
  import { FC } from 'react';

  export interface EditorProps {
    height?: string | number;
    width?: string | number;
    language?: string;
    value?: string;
    defaultValue?: string;
    defaultLanguage?: string;
    theme?: string;
    line?: number;
    loading?: React.ReactNode;
    options?: Record<string, unknown>;
    overrideServices?: Record<string, unknown>;
    saveViewState?: boolean;
    keepCurrentModel?: boolean;
    className?: string;
    wrapperProps?: Record<string, unknown>;
    beforeMount?: (monaco: unknown) => void;
    onMount?: (editor: unknown, monaco: unknown) => void;
    onChange?: (value: string | undefined, ev: unknown) => void;
    onValidate?: (markers: unknown[]) => void;
  }

  export interface DiffEditorProps {
    original?: string;
    modified?: string;
    language?: string;
    originalLanguage?: string;
    modifiedLanguage?: string;
    theme?: string;
    loading?: React.ReactNode;
    options?: Record<string, unknown>;
    height?: string | number;
    width?: string | number;
    className?: string;
    wrapperProps?: Record<string, unknown>;
    beforeMount?: (monaco: unknown) => void;
    onMount?: (editor: unknown, monaco: unknown) => void;
  }

  const Editor: FC<EditorProps>;
  export const DiffEditor: FC<DiffEditorProps>;
  export const useMonaco: () => unknown;
  export const loader: {
    config: (config: { paths?: { vs?: string }; 'vs/nls'?: { availableLanguages?: Record<string, string> } }) => void;
    init: () => Promise<unknown>;
  };

  export default Editor;
}
