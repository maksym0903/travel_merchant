import { ref } from "vue";

export type ConfirmDrawerOptions = {
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
};

export function useConfirmDrawer(defaults?: { confirmText?: string; cancelText?: string }) {
  const open = ref(false);
  const title = ref("");
  const content = ref("");
  const confirmText = ref(defaults?.confirmText ?? "Confirm");
  const cancelText = ref(defaults?.cancelText ?? "Cancel");
  const loading = ref(false);

  let _resolve: ((ok: boolean) => void) | null = null;

  function request(opts: ConfirmDrawerOptions): Promise<boolean> {
    title.value = opts.title;
    content.value = opts.content;
    confirmText.value = opts.confirmText ?? (defaults?.confirmText ?? "Confirm");
    cancelText.value = opts.cancelText ?? (defaults?.cancelText ?? "Cancel");
    open.value = true;
    loading.value = false;
    return new Promise<boolean>((resolve) => {
      _resolve = resolve;
    });
  }

  function close(ok: boolean): void {
    if (!open.value) return;
    open.value = false;
    const r = _resolve;
    _resolve = null;
    if (r) r(ok);
  }

  function onConfirm(): void {
    close(true);
  }

  function onCancel(): void {
    close(false);
  }

  return {
    open,
    title,
    content,
    confirmText,
    cancelText,
    loading,
    request,
    onConfirm,
    onCancel,
  };
}

