/**
 * Guarda un `Blob` como archivo con un enlace temporal (`<a download>`). El object URL se libera un momento después:
 * algunos navegadores cancelan la descarga si se revoca en el mismo tic del clic.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
