import { authFetch } from "./httpClient";

interface OfferRequest {
  lessonId: string;
  receiverId: string;
  sessionStartTime: string;
}

export interface OfferLesson {
  id: string;
  subject: string;
  description: string;
  durationTime: number;
  price: number | null;
  tutorId: string;
}

export interface Offer {
  id: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  sessionStartTime: string | null;
  studentConfirmedPayment: boolean;
  tutorConfirmedPayment: boolean;
  completed: boolean;
  tutorId: string;
  tutorUsername: string;
  tutorPhotoPath: string | null;
  studentId: string;
  studentUsername: string;
  studentPhotoPath: string | null;
  lesson: OfferLesson | null;
}

export const sendOffer = async (data: OfferRequest): Promise<Offer> => {
  const response = await authFetch("/api/offer/send", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};

export const acceptOffer = async (offerId: string): Promise<Offer> => {
  const response = await authFetch(`/api/offer/accept/${offerId}`, { method: "POST" });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};

export const declineOffer = async (offerId: string): Promise<Offer> => {
  const response = await authFetch(`/api/offer/decline/${offerId}`, { method: "POST" });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};

export const confirmPayment = async (offerId: string): Promise<Offer> => {
  const response = await authFetch(`/api/offer/confirm-payment/${offerId}`, { method: "POST" });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};

export const fetchMyBookings = async (): Promise<Offer[]> => {
  const response = await authFetch("/api/offer/my");
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};
