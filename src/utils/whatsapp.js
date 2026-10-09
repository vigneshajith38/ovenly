import { config } from '../data/products';

export const createWhatsAppLink = (product, quantity = 1, customisation = '') => {
  let message = `Hi ${config.businessName}! I'd like to order:\n\n`;
  message += `*${product.name}*\n`;
  message += `Quantity: ${quantity}\n`;
  message += `Price: ₹${product.price} each\n`;
  
  if (customisation) {
    message += `Option: ${customisation}\n`;
  }
  
  message += `\nTotal: ₹${product.price * quantity}\n\n`;
  message += `Please let me know how to proceed with payment and delivery.`;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`;
};
