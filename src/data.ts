import { Client, Product, MedicalOrder, Expense, Revenue, Patient, PartnerHospital, MedicalProgram } from './types';

export const mockPatients: Patient[] = [
  {
    id: 'pt1',
    name: 'أحمد محمود العلي',
    country: 'العراق',
    age: 45,
    gender: 'Male',
    condition: 'زراعة قرنية',
    status: 'Active',
    assignedAgent: 'عمر',
    lastContact: new Date().toISOString(),
    files: [],
    notes: 'حالة مستقرة، يحتاج لمتابعة دورية'
  },
  {
    id: 'pt2',
    name: 'سارة خالد المنصور',
    country: 'الكويت',
    age: 32,
    gender: 'Female',
    condition: 'علاج العقم وتأخر الإنجاب',
    status: 'Inquiry',
    assignedAgent: 'ليلى',
    lastContact: new Date().toISOString(),
    files: [],
    notes: 'بانتظار التقارير الطبية الجديدة'
  }
];

export const mockHospitals: PartnerHospital[] = [
  {
    id: 'h1',
    name: 'مجموعة مستشفيات ميديكال بارك',
    location: 'إسطنبول، تركيا',
    specialties: ['الأورام', 'زراعة الأعضاء', 'الجراحة العامة'],
    rating: 4.8,
    contactPerson: 'د. مراد صويصل',
    contractStatus: 'Active'
  },
  {
    id: 'h2',
    name: 'مستشفى ميموريال',
    location: 'أنقرة، تركيا',
    specialties: ['القلب', 'العظام', 'التجميل'],
    rating: 4.9,
    contactPerson: 'جانان يلمز',
    contractStatus: 'Active'
  }
];

export const mockMedicalPrograms: MedicalProgram[] = [
  {
    id: 'prog1',
    name: 'برنامج الفحص الشامل VIP',
    category: 'Diagnostic',
    durationDays: 3,
    duration: '3 أيام',
    hospitals: ['h1'],
    basePrice: 1500,
    doctors: ['d1'],
    description: 'فحص شامل لكامل الجسم مع إقامة فندقية',
    includedServices: ['فحوصات دم كاملة', 'تصوير رنين مغناطيسي', 'استشارات متخصصة', 'إقامة فندقية'],
    excludedServices: ['الأدوية الخارجية']
  }
];

export const mockSuppliers: any[] = [
  { id: 's1', name: 'شركة التقنيات الحديثة', category: 'Medical Equipment', location: 'ألمانيا', contact: 'Klaus Schmidt' },
  { id: 's2', name: 'أجيفنت للأجهزة الطبية', category: 'Diagnostics', location: 'تركيا', contact: 'احمد جان' }
];

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

export const mockProducts: Product[] = [
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
    id: 'ML-2026-0001',
    clientId: 'c1',
    clientName: 'مستشفى الشفاء التخصصي',
    clientPhone: '+966 50 123 4567',
    clientEmail: 'info@shifa-hosp.sa',
    clientCountry: 'المملكة العربية السعودية',
    clientCity: 'الرياض',
    clientAddress: 'حي الملز - شارع الستين',
    clientType: 'Hospital',
    items: [
      { 
        productId: 'p1', 
        name: 'أجهزة ليزر متطورة', 
        category: 'Equipment', 
        quantity: 1, 
        unitPrice: 15000, 
        total: 15000,
        availability: 'Available'
      }
    ],
    financials: {
      subtotal: 15000,
      localDeliveryFee: 0,
      intlShippingFee: 500,
      customsFee: 200,
      serviceFee: 300,
      discount: 0,
      tax: 0,
      total: 16000,
      currency: 'USD'
    },
    shipping: {
      method: 'International Shipping',
      destinationCountry: 'Saudi Arabia',
      destinationCity: 'Riyadh',
      shippingCost: 500,
      paidBy: 'Client'
    },
    payment: {
      method: 'Bank Transfer',
      bank: {
        status: 'Verified'
      }
    },
    status: 'Processing',
    category: 'Medical Supply',
    date: new Date().toISOString(),
    executionLocation: 'Turkey',
    notes: {
      internal: 'عميل VIP',
      external: 'يرجى التأكد من التغليف المزدوج',
      paymentTerms: '50% مقدم، 50% عند الاستلام',
      deliveryTerms: 'شحن جوي سريع',
      returnPolicy: 'خاضع لسياسة الشركة للمعدات الثقيلة'
    },
    attachments: []
  },
];

export const mockExpenses: Expense[] = [
  {
    id: 'e1',
    category: 'Logistics',
    amount: 1200,
    currency: 'USD',
    description: 'شحن حاوية معدات من تركيا',
    date: new Date().toISOString(),
  },
  {
    id: 'e2',
    category: 'Marketing',
    amount: 3500,
    currency: 'TRY',
    description: 'حملة إعلانية ممولة',
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
