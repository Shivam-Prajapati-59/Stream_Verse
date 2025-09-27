// Payment data types for video player
export interface PaymentInfo {
  receiver: string;
  amount: string;
  network: string;
  description: string;
  paymentId: string;
}

export interface VideoPaymentData {
  error: string;
  payment: PaymentInfo;
}

export interface VideoResponse {
  videoUrl: string;
  message: string;
  success: boolean;
}
