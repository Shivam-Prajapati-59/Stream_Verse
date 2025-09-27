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

// Video data types for server API responses
export interface ServerVideo {
  id: number;
  publicAddress: string;
  title: string;
  description: string | null;
  cid: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface VideosApiResponse {
  success: boolean;
  data: ServerVideo[];
  count: number;
  error?: string;
  message?: string;
}
