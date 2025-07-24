export const formatPrice = (price: number | null, rom?: string) => {
  if (rom) return rom;
  if (price === 0) return "Free";
  if (price === null) return "Custom ROM";
  return `$${price.toLocaleString()}`;
};

export const getIconPath = (type: string) => {
  switch (type) {
    case "Usage Based Tool":
      return "/assets/icons/icon_user-tool.png";
    case "Bundle":
      return "/assets/icons/icon_bundle.png";
    case "Seat Based Tool":
      return "/assets/icons/icon_seat-based-tool.png";
    default:
      return "/assets/icons/icon_user-tool.png";
  }
};

export const getValue = (name: string): string => {
  const element = document.querySelector(`[name="${name}"]`);
  return (element as { value?: string })?.value || "";
};

// Function to generate a unique request ID of 24 characters
export const generateRequestId = (number: number): string => {
  const timestamp = Date.now();
  const hexTimestamp = timestamp.toString(16);
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < number; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return (
    result + "-" + hexTimestamp // Combine random string with timestamp
  );
};
