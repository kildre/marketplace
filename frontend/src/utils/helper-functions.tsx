export const formatPrice = (price: number | null, rom?: string) => {
  if (rom) return rom;
  if (price === 0) return "Free";
  if (price === null) return "Custom ROM";
  return `$${price.toLocaleString()}`;
};

// Helper function to calculate estimated cost from cart items
export const calculateEstimatedCost = (
  cartItems: Array<Record<string, unknown>>,
  mockProducts: { items: Array<{ name: string; price: number | null }> }
): string => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return "Free";
  }

  const total = cartItems.reduce((total, item) => {
    const itemName = item.name as string;
    const quantity = typeof item.quantity === "number" ? item.quantity : 1;

    // Find matching product in mock data
    const mockProduct = mockProducts.items.find(
      (product) => product.name.toLowerCase() === itemName?.toLowerCase()
    );

    if (!mockProduct) {
      return total;
    }

    // Handle price - could be number, string, or null
    let itemPrice = 0;
    if (mockProduct.price !== null) {
      if (typeof mockProduct.price === "number") {
        itemPrice = mockProduct.price;
      } else if (typeof mockProduct.price === "string") {
        // Try to parse string price
        const parsedPrice = parseFloat(
          (mockProduct.price as string).replace(/[^0-9.-]/g, "")
        );
        itemPrice = isNaN(parsedPrice) ? 0 : parsedPrice;
      }
    }

    return total + itemPrice * quantity;
  }, 0);

  // Check if ALL items have null prices (indicating all pricing is pending)
  const allItemsArePending =
    cartItems.length > 0 &&
    cartItems.every((item) => {
      const itemName = item.name as string;
      const mockProduct = mockProducts.items.find(
        (product) => product.name.toLowerCase() === itemName?.toLowerCase()
      );
      return mockProduct && mockProduct.price === null;
    });

  // Check if there are mixed zero and null prices (but no actual values)
  const hasNullPrices = cartItems.some((item) => {
    const itemName = item.name as string;
    const mockProduct = mockProducts.items.find(
      (product) => product.name.toLowerCase() === itemName?.toLowerCase()
    );
    return mockProduct && mockProduct.price === null;
  });

  const hasZeroPrices = cartItems.some((item) => {
    const itemName = item.name as string;
    const mockProduct = mockProducts.items.find(
      (product) => product.name.toLowerCase() === itemName?.toLowerCase()
    );
    return mockProduct && mockProduct.price === 0;
  });

  const hasActualValues = cartItems.some((item) => {
    const itemName = item.name as string;
    const mockProduct = mockProducts.items.find(
      (product) => product.name.toLowerCase() === itemName?.toLowerCase()
    );
    return (
      mockProduct &&
      typeof mockProduct.price === "number" &&
      mockProduct.price > 0
    );
  });

  // If there are actual values (numbers > 0), always return the calculated total
  const hasMixedZeroAndNullOnly =
    hasNullPrices && hasZeroPrices && !hasActualValues;

  // Format the response based on conditions
  if (allItemsArePending) {
    return "Pending";
  }

  if (hasMixedZeroAndNullOnly) {
    return "Pending";
  }

  if (total === 0) {
    return "Free";
  }

  // Format the total with dollar sign and commas
  return `$${total.toLocaleString()}`;
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
