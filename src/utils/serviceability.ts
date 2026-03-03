export const SERVICEABLE_PINCODES = [
  // Delhi
  "110001",
  "110002",
  "110003",
  "110004",
  "110005",
  "110006",

  // Mumbai
  "400001",
  "400002",
  "400003",
  "400004",
  "400005",
  "400006",

  // Bangalore
  "560001",
  "560002",
  "560003",
  "560004",
  "560005",
  "560006",

  // Chennai
  "600001",
  "600002",
  "600003",
  "600004",
  "600005",
  "600006",

  // Demo pincodes often used for testing
  "123456",
  "000000",
];

/**
 * Validates if the given pincode is within our serviceable areas.
 * @param pincode The postal code / pincode to check
 * @returns boolean
 */
export function checkServiceability(
  pincode: string | undefined | null,
): boolean {
  if (!pincode) return false;

  // Clean up input
  const cleanPincode = pincode.replace(/\s+/g, "").trim();

  // Broad check: For demo purposes, we will accept any pincode starting with 1, 4, 5, or 6
  // AND we accept the explicitly defined SERVICEABLE_PINCODES

  // In a real app this would typically be an API call or check against a large DB
  return (
    SERVICEABLE_PINCODES.includes(cleanPincode) ||
    /^[1456]\d{5}$/.test(cleanPincode)
  );
}
