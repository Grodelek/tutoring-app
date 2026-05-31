import {BASE_URL} from "@/config/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface OfferRequest{
    lessonId: string,
    receiverId: string,
    sessionStartTime: string
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

const authHeaders = async () => {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
        throw new Error("Authentication token not found");
    }
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

export const sendOffer = async (data: OfferRequest): Promise<Offer> => {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/api/offer/send`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json();
};

export const acceptOffer = async (offerId: string): Promise<Offer> => {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/api/offer/accept/${offerId}`, {
        method: "POST",
        headers,
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json();
};

export const declineOffer = async (offerId: string): Promise<Offer> => {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/api/offer/decline/${offerId}`, {
        method: "POST",
        headers,
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json();
};

export const confirmPayment = async (offerId: string): Promise<Offer> => {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/api/offer/confirm-payment/${offerId}`, {
        method: "POST",
        headers,
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json();
};

export const fetchMyBookings = async (): Promise<Offer[]> => {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/api/offer/my`, {
        method: "GET",
        headers,
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json();
};
