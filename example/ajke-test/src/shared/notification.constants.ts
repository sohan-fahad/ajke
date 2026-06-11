export enum ENUM_SLACK_REFERENCE_TYPE {
  ORDER = 'ORDER',
  PRODUCT = 'PRODUCT',
  PAYMENT = 'PAYMENT',
  INVENTORY = 'INVENTORY',
  SYSTEM = 'SYSTEM',
}

export enum ENUM_SLACK_MESSAGE_TYPE {
  ORDER_PLACED = 'ORDER_PLACED',
  ORDER_STATUS_UPDATED = 'ORDER_STATUS_UPDATED',
  INVENTORY_ALERT = 'INVENTORY_ALERT',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  CUSTOM = 'CUSTOM',
}

export const SLACK_MESSAGE_TEMPLATES = {
  ORDER_PLACED: '🛍️ A new order has been placed from {address}. Order code: {orderCode}, Zone: {zone}',
  ORDER_CONFIRMED: '✅ Order {orderCode} confirmed.',
  ORDER_DELIVERED: '🎉 Order {orderCode} has been delivered!',
  ORDER_CANCELLED: '❌ Order {orderCode} has been cancelled. Reason: {reason}',
};

export const SMS_TEMPLATES = {
  OTP: 'Your OTP is: {otp}. Valid for {validityMinutes} minutes.',
  ORDER_CONFIRMED: 'Your order #{orderCode} has been confirmed.',
  ORDER_DELIVERED: 'Your order #{orderCode} has been delivered.',
  ORDER_CANCELLED: 'Your order #{orderCode} has been cancelled.',
};
