/**
 * Utility functions for Standard Vietnamese Currency Formatting (VNĐ)
 * Phân cách hàng nghìn bằng dấu chấm (.) chuẩn Việt Nam.
 */

export interface FormatCurrencyOptions {
  suffix?: string; // Mặc định: '₫' hoặc 'đ'
  showSuffix?: boolean; // Mặc định: true
  fallback?: string; // Mặc định: '0 ₫'
}

/**
 * Định dạng số tiền sang chuẩn tiền Việt Nam (VNĐ) có dấu chấm phân cách.
 * Ví dụ: 89000 -> "89.000 ₫", 1250000 -> "1.250.000 ₫"
 */
export function formatVND(
  amount: number | string | null | undefined,
  options?: FormatCurrencyOptions,
): string {
  const { suffix = '₫', showSuffix = true, fallback = '0 ₫' } = options || {};

  if (amount === null || amount === undefined || amount === '') {
    return fallback;
  }

  const num = typeof amount === 'string' ? Number(amount.replace(/[^\d.-]/g, '')) : amount;
  if (isNaN(num)) return fallback;

  const formatted = new Intl.NumberFormat('vi-VN').format(num);
  return showSuffix ? `${formatted} ${suffix}`.trim() : formatted;
}

/**
 * Định dạng số có dấu chấm phân cách (không kèm đơn vị tiền).
 * Ví dụ: 89000 -> "89.000"
 */
export function formatNumberVND(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const cleanStr = String(value).replace(/\D/g, '');
  if (!cleanStr) return '';
  return new Intl.NumberFormat('vi-VN').format(Number(cleanStr));
}

/**
 * Chuyển chuỗi đã định dạng dấu chấm về số nguyên để lưu state / gửi API.
 * Ví dụ: "89.000" -> 89000, "1.250.000" -> 1250000
 */
export function parseNumberVND(formattedValue: string): number | '' {
  if (!formattedValue) return '';
  const cleanStr = String(formattedValue).replace(/\D/g, '');
  if (!cleanStr) return '';
  const num = Number(cleanStr);
  return isNaN(num) ? '' : num;
}
