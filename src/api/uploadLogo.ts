/**
 * Upload API — POST /upload
 * Uploads an image or video file to the CDN server (VITE_CDN_BASE_URL).
 * Filename must be a UUID. Requires Bearer token authentication.
 */

import { getAccessToken, silentRefresh } from "./auth";

const CDN_BASE = (import.meta.env?.VITE_CDN_BASE_URL as string) ?? "";

function getUploadUrl(): string {
  const base = CDN_BASE ? CDN_BASE.replace(/\/$/, "") : "";
  const path = "/upload";
  const full = base ? `${base}${path}` : path;
  return full.startsWith("http") ? full : `${window.location.origin}${full}`;
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot > 0 ? filename.substring(lastDot).toLowerCase() : "";
}

/**
 * Get file extension from MIME type
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/bmp": ".bmp",
    "image/svg+xml": ".svg",
    "application/pdf": ".pdf",
  };
  return mimeMap[mimeType.toLowerCase()] || ".jpg";
}

export interface UploadLogoResponse {
  message?: string;
  data?: {
    url?: string;
    filename?: string;
    path?: string;
    [key: string]: unknown;
  };
  filename?: string;
  path?: string;
  [key: string]: unknown;
}

/**
 * Get the file path/filename from upload response
 * The response should contain the UUID filename (e.g., "550e8400-e29b-41d4-a716-446655440000.jpg")
 */
export function getFilePathFromUploadResponse(response: UploadLogoResponse): string | null {
  // Try different possible response formats
  return (
    response.data?.path ||
    response.data?.filename ||
    response.path ||
    response.filename ||
    null
  );
}

/**
 * Construct the full file URL using GET /files/{path}
 */
export function getFileUrl(filePath: string): string {
  if (!filePath) return "";
  
  // If it's already a full URL, return as is
  if (filePath.startsWith("http")) {
    return filePath;
  }
  
  // Construct URL as CDN_BASE + /files/{path}
  const base = CDN_BASE ? CDN_BASE.replace(/\/$/, "") : "";
  const path = filePath.startsWith("/") ? filePath : `/${filePath}`;
  const filesPath = `/files${path}`;
  
  if (base) {
    return `${base}${filesPath}`;
  }
  
  // Fallback to relative URL
  return filesPath;
}

/**
 * Upload a file to the CDN server (VITE_CDN_BASE_URL).
 * Uses fetchWithAuth to automatically inject the Bearer token.
 * @param file - The file to upload (File or Blob)
 * @returns The upload response with file path/URL
 */
export async function uploadLogo(
  file: File | Blob
): Promise<UploadLogoResponse> {
  // Determine extension from filename, then MIME type, fallback to .jpg
  let extension = "";
  if (file instanceof File && file.name) {
    extension = getFileExtension(file.name);
  }
  if (!extension && file.type) {
    extension = getExtensionFromMimeType(file.type);
  }
  if (!extension) {
    extension = ".jpg";
  }

  const uuidFilename = `${generateUUID()}${extension}`;

  // Build FormData with UUID filename, preserving original MIME type
  const formData = new FormData();
  const fileType = file.type || (
    extension === ".png" ? "image/png" :
    extension === ".webp" ? "image/webp" :
    extension === ".mp4" ? "video/mp4" :
    "image/jpeg"
  );
  const fileToUpload = new File([file], uuidFilename, { type: fileType });
  formData.append("file", fileToUpload);

  // POST to VITE_CDN_BASE_URL/upload with Bearer token.
  // We call fetch() directly (NOT fetchWithAuth) because fetchWithAuth rebuilds
  // the Headers object which destroys the browser-managed multipart/form-data
  // Content-Type boundary that FormData requires.
  const url = getUploadUrl();

  const doUpload = async (token: string | null): Promise<Response> => {
    const headers: HeadersInit = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url, { method: "POST", headers, body: formData });
  };

  let res = await doUpload(getAccessToken());

  // Retry once with a fresh token on 401
  if (res.status === 401) {
    try {
      const newToken = await silentRefresh();
      res = await doUpload(newToken);
    } catch {
      throw new Error("Session expired. Please log in again.");
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Upload failed (${res.status})`;
    throw new Error(msg);
  }

  return data as UploadLogoResponse;
}
