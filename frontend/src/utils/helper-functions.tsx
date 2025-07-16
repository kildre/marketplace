export const formatPrice = (price: number, rom?: string) => {
  if (rom) return rom;
  if (price === 0) return "Free";
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
