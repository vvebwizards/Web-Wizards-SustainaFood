export interface FoodItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expirationDate: string;
    nutritionalInfo?: string;
    allergens?: string[];
    storageRequirements?: string;
    notes?: string;
    status?: string;
    imageUrl?: string; // Added image URL property
    createdAt?: string;
    updatedAt?: string;
  }