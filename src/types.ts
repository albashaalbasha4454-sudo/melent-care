export interface Client {
  id: string;
  name: string;
  type: 'Hospital' | 'Clinic' | 'Pharmacy' | 'Individual';
  location: string;
  contactPerson: string;
  phone: string;
}

export interface MedicalProduct {
  id: string;
  name: string;
  category: 'Equipment' | 'Supplies' | 'Dermo-cosmetic';
  price: number;
  stock: number;
}

export interface MedicalOrder {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Sourced' | 'Shipping' | 'Delivered' | 'Cancelled';
  date: string;
  type: 'Local' | 'International';
  deliveryMethod: 'Shipping' | 'LocalDelivery' | 'Pickup';
  isTurkeyBased: boolean;
  paymentMethod: 'BankTransfer' | 'Cash' | 'Crypto' | 'WesternUnion' | 'Other';
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Expense {
  id: string;
  category: 'Logistics' | 'Procurement' | 'Salaries' | 'Marketing' | 'Other';
  amount: number;
  description: string;
  date: string;
}

export interface Revenue {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: 'Transfer' | 'Cash' | 'Card';
  date: string;
}

export type View = 'dashboard' | 'clients' | 'inventory' | 'orders' | 'expenses' | 'reports';
