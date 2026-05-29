import { Client, MedicalProduct, MedicalOrder, Expense, Revenue } from './types';

export const mockClients: Client[] = [
  {
    id: 'c1',
    name: 'مستشفى الشفاء التخصصي',
    type: 'Hospital',
    location: 'الرياض، السعودية',
    contactPerson: 'د. محمد العتيبي',
    phone: '+966 50 123 4567',
  },
  {
    id: 'c2',
    name: 'مركز تجميل ديرما',
    type: 'Clinic',
    location: 'دبي، الإمارات',
    contactPerson: 'أمل خالد',
    phone: '+971 55 987 6543',
  },
];

export const mockProducts: MedicalProduct[] = [
  {
    id: 'p1',
    name: 'أجهزة ليزر متطورة',
    category: 'Equipment',
    price: 15000,
    stock: 5,
  },
  {
    id: 'p2',
    name: 'مستلزمات طبية جراحية',
    category: 'Supplies',
    price: 250,
    stock: 500,
  },
];

export const mockMedicalOrders: MedicalOrder[] = [
  {
    id: 'ORD-101',
    clientId: 'c1',
    clientName: 'مستشفى الشفاء التخصصي',
    clientPhone: '+966 50 123 4567',
    clientAddress: 'الرياض - حي الملز - شارع الستين',
    items: [{ productId: 'p1', name: 'أجهزة ليزر', quantity: 1, price: 15000 }],
    total: 15000,
    status: 'Sourced',
    date: new Date().toISOString(),
    type: 'International',
    deliveryMethod: 'Shipping',
    isTurkeyBased: true,
    paymentMethod: 'BankTransfer',
  },
];

export const mockExpenses: Expense[] = [
  {
    id: 'e1',
    category: 'Logistics',
    amount: 1200,
    description: 'شحن حاوية معدات من تركيا',
    date: new Date().toISOString(),
  },
];

export const mockRevenue: Revenue[] = [
  {
    id: 'r1',
    orderId: 'ORD-101',
    amount: 5000,
    paymentMethod: 'Transfer',
    date: new Date().toISOString(),
  },
];

export const mockMonthlyData = [
  { month: 'يناير', revenue: 12000, expenses: 8500 },
  { month: 'فبراير', revenue: 19000, expenses: 12000 },
  { month: 'مارس', revenue: 15000, expenses: 10000 },
  { month: 'أبريل', revenue: 22000, expenses: 14000 },
  { month: 'مايو', revenue: 30000, expenses: 18000 },
  { month: 'يونيو', revenue: 26000, expenses: 16500 },
];
