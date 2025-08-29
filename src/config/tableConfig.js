// Standardized table configurations with consistent naming conventions
export const TABLE_FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PHONE: 'phone',
  DATE: 'date',
  TIME: 'time',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  SELECT: 'select',
  IMAGE: 'image'
};

export const COMMON_FIELD_PATTERNS = {
  // User fields
  USER_FIRSTNAME: 'user_firstname',
  USER_LASTNAME: 'user_lastname',
  USER_MIDDLE: 'user_middle',
  USER_EMAIL: 'user_email',
  USER_MOBILE: 'user_mobile',
  USER_BIRTHDAY: 'user_bday',
  USER_GENDER: 'user_gender',
  
  // Booking fields
  BOOKING_STATUS: 'booking_status',
  BOOKING_DATE: 'booking_date',
  BOOKING_TIME: 'booking_time',
  BOOKING_PAX: 'booking_pax',
  BOOKING_TRANSACTION: 'booking_transaction',
  BOOKING_SACRAMENT: 'booking_sacrament',
  
  // Common fields
  PRICE: 'price',
  PAID: 'paid',
  DATE_CREATED: 'date_created',
  ID: 'id'
};

export const SACRAMENT_FIELDS = [
  COMMON_FIELD_PATTERNS.USER_FIRSTNAME,
  COMMON_FIELD_PATTERNS.USER_LASTNAME,
  COMMON_FIELD_PATTERNS.BOOKING_STATUS,
  COMMON_FIELD_PATTERNS.BOOKING_DATE,
  COMMON_FIELD_PATTERNS.BOOKING_TIME,
  COMMON_FIELD_PATTERNS.BOOKING_PAX,
  COMMON_FIELD_PATTERNS.BOOKING_TRANSACTION,
  COMMON_FIELD_PATTERNS.PRICE,
  COMMON_FIELD_PATTERNS.PAID,
  'form'
];

export const SACRAMENT_REQUIRED_FIELDS = [
  COMMON_FIELD_PATTERNS.BOOKING_DATE,
  COMMON_FIELD_PATTERNS.BOOKING_TIME,
  COMMON_FIELD_PATTERNS.BOOKING_PAX,
  COMMON_FIELD_PATTERNS.BOOKING_STATUS,
  'user_id'
];

// Table structure definitions with standardized naming
export const TABLE_STRUCTURES = {
  booking_tbl: {
    fields: [
      COMMON_FIELD_PATTERNS.USER_FIRSTNAME,
      COMMON_FIELD_PATTERNS.USER_LASTNAME,
      COMMON_FIELD_PATTERNS.BOOKING_STATUS,
      COMMON_FIELD_PATTERNS.BOOKING_SACRAMENT,
      COMMON_FIELD_PATTERNS.BOOKING_DATE,
      COMMON_FIELD_PATTERNS.BOOKING_TIME,
      COMMON_FIELD_PATTERNS.BOOKING_PAX,
      COMMON_FIELD_PATTERNS.BOOKING_TRANSACTION,
      COMMON_FIELD_PATTERNS.PRICE,
      COMMON_FIELD_PATTERNS.PAID,
    ],
    displayName: 'Sacrament Bookings',
    tableName: 'booking_tbl',
    requiredFields: [
      COMMON_FIELD_PATTERNS.BOOKING_SACRAMENT,
      COMMON_FIELD_PATTERNS.BOOKING_DATE,
      COMMON_FIELD_PATTERNS.BOOKING_TIME,
      COMMON_FIELD_PATTERNS.BOOKING_PAX,
      COMMON_FIELD_PATTERNS.BOOKING_STATUS,
      'user_id'
    ],
    category: 'booking'
  },
  document_tbl: {
    fields: [
      'firstname',
      'middle',
      'lastname',
      'gender',
      'mobile',
      'bday',
      'marital_status',
      'baptismal_certificate',
      'confirmation_certificate',
      'wedding_certificate'
    ],
    displayName: 'Document Records',
    tableName: 'document_tbl',
    requiredFields: ['firstname', 'lastname'],
    category: 'document'
  },
  donation_tbl: {
    fields: [
      COMMON_FIELD_PATTERNS.USER_FIRSTNAME,
      COMMON_FIELD_PATTERNS.USER_LASTNAME,
      'donation_amount',
      'donation_intercession',
      COMMON_FIELD_PATTERNS.DATE_CREATED,
    ],
    displayName: 'Donation Records',
    tableName: 'donation_tbl',
    requiredFields: ['donation_amount'],
    category: 'financial'
  },
  request_tbl: {
    fields: [
      COMMON_FIELD_PATTERNS.USER_FIRSTNAME,
      COMMON_FIELD_PATTERNS.USER_LASTNAME,
      'request_baptismcert',
      'request_confirmationcert',
      'document_id'
    ],
    displayName: 'Certificate Requests',
    tableName: 'request_tbl',
    requiredFields: ['user_id'],
    category: 'request'
  },
  admin_tbl: {
    fields: [
      'admin_firstname',
      'admin_lastname',
      'admin_email',
      'admin_mobile',
      'admin_bday',
    ],
    displayName: 'Administrator Accounts',
    tableName: 'admin_tbl',
    requiredFields: ['admin_email', 'admin_firstname', 'admin_lastname'],
    category: 'admin'
  },
  priest_tbl: {
    fields: [
      'priest_name',
      'priest_diocese',
      'priest_parish',
      'priest_availability'
    ],
    displayName: 'Priest Directory',
    tableName: 'priest_tbl',
    requiredFields: ['priest_name'],
    category: 'staff'
  },
  user_tbl: {
    fields: [
      COMMON_FIELD_PATTERNS.USER_FIRSTNAME,
      COMMON_FIELD_PATTERNS.USER_MIDDLE,
      COMMON_FIELD_PATTERNS.USER_LASTNAME,
      COMMON_FIELD_PATTERNS.USER_GENDER,
      COMMON_FIELD_PATTERNS.USER_EMAIL,
      COMMON_FIELD_PATTERNS.USER_MOBILE,
      COMMON_FIELD_PATTERNS.USER_BIRTHDAY,
    ],
    displayName: 'User Accounts',
    tableName: 'user_tbl',
    requiredFields: [COMMON_FIELD_PATTERNS.USER_EMAIL, COMMON_FIELD_PATTERNS.USER_FIRSTNAME, COMMON_FIELD_PATTERNS.USER_LASTNAME],
    category: 'user'
  }
};

// Sacrament-specific table structures
export const SACRAMENT_TYPES = {
  WEDDING: 'Wedding',
  BAPTISM: 'Baptism',
  CONFESSION: 'Confession',
  ANOINTING: 'Anointing of the Sick',
  COMMUNION: 'First Communion',
  BURIAL: 'Burial'
};

export const SACRAMENT_TABLE_STRUCTURES = {
  wedding: {
    fields: SACRAMENT_FIELDS,
    displayName: 'Wedding Bookings',
    tableName: 'booking_tbl',
    sacramentType: SACRAMENT_TYPES.WEDDING,
    requiredFields: SACRAMENT_REQUIRED_FIELDS,
    category: 'sacrament'
  },
  baptism: {
    fields: SACRAMENT_FIELDS,
    displayName: 'Baptism Bookings',
    tableName: 'booking_tbl',
    sacramentType: SACRAMENT_TYPES.BAPTISM,
    requiredFields: SACRAMENT_REQUIRED_FIELDS,
    category: 'sacrament'
  },
  confession: {
    fields: SACRAMENT_FIELDS,
    displayName: 'Confession Bookings',
    tableName: 'booking_tbl',
    sacramentType: SACRAMENT_TYPES.CONFESSION,
    requiredFields: SACRAMENT_REQUIRED_FIELDS,
    category: 'sacrament'
  },
  anointing: {
    fields: SACRAMENT_FIELDS,
    displayName: 'Anointing Bookings',
    tableName: 'booking_tbl',
    sacramentType: SACRAMENT_TYPES.ANOINTING,
    requiredFields: SACRAMENT_REQUIRED_FIELDS,
    category: 'sacrament'
  },
  communion: {
    fields: SACRAMENT_FIELDS,
    displayName: 'First Communion Bookings',
    tableName: 'booking_tbl',
    sacramentType: SACRAMENT_TYPES.COMMUNION,
    requiredFields: SACRAMENT_REQUIRED_FIELDS,
    category: 'sacrament'
  },
  burial: {
    fields: SACRAMENT_FIELDS,
    displayName: 'Burial Bookings',
    tableName: 'booking_tbl',
    sacramentType: SACRAMENT_TYPES.BURIAL,
    requiredFields: SACRAMENT_REQUIRED_FIELDS,
    category: 'sacrament'
  }
};

// Helper functions for table management
export const getTablesByCategory = (category) => {
  return Object.entries(TABLE_STRUCTURES)
    .filter(([_, config]) => config.category === category)
    .reduce((acc, [key, config]) => {
      acc[key] = config;
      return acc;
    }, {});
};

export const getSacramentTableKeys = () => {
  return Object.keys(SACRAMENT_TABLE_STRUCTURES);
};

export const getRegularTableKeys = () => {
  return Object.keys(TABLE_STRUCTURES).filter(key => key !== 'booking_tbl');
};

export const formatFieldName = (fieldName) => {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

export const getTableStructure = (tableKey) => {
  return TABLE_STRUCTURES[tableKey] || null;
};

export const getSacramentStructure = (sacramentKey) => {
  return SACRAMENT_TABLE_STRUCTURES[sacramentKey] || null;
};

// Field validation helpers
export const getFieldType = (fieldName) => {
  if (fieldName.includes('email')) return TABLE_FIELD_TYPES.EMAIL;
  if (fieldName.includes('mobile') || fieldName.includes('phone')) return TABLE_FIELD_TYPES.PHONE;
  if (fieldName.includes('date') || fieldName.includes('bday')) return TABLE_FIELD_TYPES.DATE;
  if (fieldName.includes('time')) return TABLE_FIELD_TYPES.TIME;
  if (fieldName.includes('amount') || fieldName.includes('price') || fieldName.includes('pax')) return TABLE_FIELD_TYPES.NUMBER;
  if (fieldName.includes('paid') || fieldName.includes('availability')) return TABLE_FIELD_TYPES.BOOLEAN;
  if (fieldName.includes('status') || fieldName.includes('gender') || fieldName.includes('sacrament')) return TABLE_FIELD_TYPES.SELECT;
  if (fieldName.includes('certificate') || fieldName.includes('image') || fieldName.includes('1x1')) return TABLE_FIELD_TYPES.IMAGE;
  return TABLE_FIELD_TYPES.TEXT;
};

export default {
  TABLE_STRUCTURES,
  SACRAMENT_TABLE_STRUCTURES,
  COMMON_FIELD_PATTERNS,
  SACRAMENT_TYPES,
  getTablesByCategory,
  getSacramentTableKeys,
  getRegularTableKeys,
  formatFieldName,
  getTableStructure,
  getSacramentStructure,
  getFieldType
};