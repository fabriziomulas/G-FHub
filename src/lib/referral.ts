export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Chi si iscrive con un link di invito riceve subito questo sconto di benvenuto.
export const REFERRAL_WELCOME_DISCOUNT = 10;
// Chi ha invitato riceve questo sconto quando l'amico invitato completa il primo ordine pagato.
export const REFERRAL_REWARD_DISCOUNT = 15;
export const REFERRAL_COUPON_VALID_DAYS = 30;

export function referralCouponExpiry(): Date {
  return new Date(Date.now() + REFERRAL_COUPON_VALID_DAYS * 24 * 60 * 60 * 1000);
}
