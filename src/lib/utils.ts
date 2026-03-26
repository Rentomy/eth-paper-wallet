import QRCode from "qrcode";

/** Generate a QR code as a base64 PNG data URL. */
export async function generateQR(value: string): Promise<string> {
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: "H",
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
    width: 200,
  });
}

/** Copy a string to the clipboard. Returns true on success. */
export async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
