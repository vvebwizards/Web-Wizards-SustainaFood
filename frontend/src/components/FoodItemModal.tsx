export interface FoodItem {
    _id?: Key | null | undefined;
    title: string;
    category: string;
    quantity: number;
    unit: string;
    expirationDate: string;
    nutritionalInfo?: string;
    storageRequirements?: string;
    notes?: string;
    status?: string;
    imageUrl?: string; 
    createdAt?: string;
    updatedAt?: string;
    price?: number;
    donor?: string;
    type: 'free' | 'reduced';
    quantityToDonation: number;
  }