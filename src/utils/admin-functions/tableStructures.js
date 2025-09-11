// src/utils/adminFunctions/tableStructures.js
// Centralized table structures & field display names

export const getFieldDisplayName = (fieldName) => {
  const fieldMapping = {
    // User fields
    user_firstname: "First Name",
    user_middle: "Middle Name",
    user_lastname: "Last Name",
    user_gender: "Gender",
    user_email: "Email",
    user_mobile: "Mobile",
    user_bday: "Birthday",

    // Admin fields
    admin_firstname: "First Name",
    admin_lastname: "Last Name",
    admin_email: "Email",
    admin_mobile: "Mobile",
    admin_bday: "Birthday",

    // Priest fields
    priest_name: "Name",
    priest_diocese: "Diocese",
    priest_parish: "Parish",
    priest_availability: "Availability",

    // Donation fields
    donation_amount: "Amount",
    donation_intercession: "Intercession",
    date_created: "Date Created",

    // Request fields
    request_baptismcert: "Baptism Certificate",
    request_confirmationcert: "Confirmation Certificate",
    document_id: "Document ID",

    // Document fields
    firstname: "First Name",
    middle: "Middle Name",
    lastname: "Last Name",
    gender: "Gender",
    mobile: "Mobile",
    bday: "Birthday",
    marital_status: "Marital Status",
    baptismal_certificate: "Baptismal Certificate",
    confirmation_certificate: "Confirmation Certificate",
    wedding_certificate: "Wedding Certificate",

    // Booking fields
    booking_status: "Status",
    booking_sacrament: "Sacrament",
    booking_date: "Date",
    booking_time: "Time",
    booking_pax: "Participants",
    booking_transaction: "Transaction ID",
    price: "Price",
    paid: "Paid",
    form: "Form",
  };

  return (
    fieldMapping[fieldName] ||
    fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
};

// ============================
// Sacrament Booking Structures
// ============================
export const ALL_BOOKINGS_STRUCTURE = {
  fields: [
    "user_firstname",
    "user_lastname",
    "booking_status",
    "booking_sacrament",
    "booking_date",
    "booking_time",
    "booking_pax",
    "booking_transaction",
    "price",
    "paid",
  ],
  displayName: "All Sacrament Bookings",
  requiredFields: [
    "booking_sacrament",
    "booking_date",
    "booking_time",
    "booking_pax",
    "booking_status",
    "user_id",
  ],
};

const COMMON_BOOKING_STRUCTURE = {
  fields: [
    "user_firstname",
    "user_lastname",
    "booking_status",
    "booking_date",
    "booking_time",
    "booking_pax",
    "booking_transaction",
    "price",
    "paid",
    "form",
  ],
  requiredFields: [
    "booking_date",
    "booking_time",
    "booking_pax",
    "booking_status",
    "user_id",
  ],
};

export const BOOKING_TABLE_STRUCTURES = {
  wedding: { ...COMMON_BOOKING_STRUCTURE, displayName: "Wedding" },
  baptism: { ...COMMON_BOOKING_STRUCTURE, displayName: "Baptism" },
  confession: { ...COMMON_BOOKING_STRUCTURE, displayName: "Confession" },
  anointing: { ...COMMON_BOOKING_STRUCTURE, displayName: "Anointing" },
  communion: { ...COMMON_BOOKING_STRUCTURE, displayName: "First Communion" },
  burial: { ...COMMON_BOOKING_STRUCTURE, displayName: "Burial" },
};

// ============================
// Management Table Structures
// ============================
export const TABLE_STRUCTURES = {
  document_tbl: {
    fields: [
      "firstname",
      "middle",
      "lastname",
      "gender",
      "mobile",
      "bday",
      "marital_status",
      "baptismal_certificate",
      "confirmation_certificate",
      "wedding_certificate",
    ],
    displayName: "Documents",
    requiredFields: ["firstname", "lastname"],
  },
  donation_tbl: {
    fields: [
      "user_firstname",
      "user_lastname",
      "donation_amount",
      "donation_intercession",
      "date_created",
    ],
    displayName: "Donations",
    requiredFields: ["donation_amount"],
  },
  request_tbl: {
    fields: [
      "user_firstname",
      "user_lastname",
      "request_baptismcert",
      "request_confirmationcert",
      "document_id",
    ],
    displayName: "Requests",
    requiredFields: ["user_id"],
  },
  admin_tbl: {
    fields: [
      "admin_firstname",
      "admin_lastname",
      "admin_email",
      "admin_mobile",
      "admin_bday",
    ],
    displayName: "Admins",
    requiredFields: ["admin_email", "admin_firstname", "admin_lastname"],
  },
  priest_tbl: {
    fields: ["priest_name", "priest_diocese", "priest_parish", "priest_availability"],
    displayName: "Priests",
    requiredFields: ["priest_name"],
  },
  user_tbl: {
    fields: [
      "user_firstname",
      "user_middle",
      "user_lastname",
      "user_gender",
      "user_email",
      "user_mobile",
      "user_bday",
    ],
    displayName: "Users",
    requiredFields: ["user_email", "user_firstname", "user_lastname"],
  },
};