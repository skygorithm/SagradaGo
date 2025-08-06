const exportToCSV = (data, filename) => {
    const headers = {
      transaction_logs: ['Timestamp', 'Table', 'Action', 'Record ID', 'Performed By', 'Performed By Email', 'Old Data', 'New Data'],
      deleted_records: ['Deleted At', 'Table', 'Record ID', 'Deleted By', 'Deleted By Email', 'Record Data'],
      booking_tbl: ['ID', 'User ID', 'User Firstname', 'User Lastname', 'Booking Status', 'Booking Sacrament', 'Booking Date', 'Booking Time', 'Amount of People', 'Booking Transaction', "Price", "Paid", 'Status', 'Date Created'],
      document_tbl: ['ID', 'Firstname', 'Middle Name', 'Lastname', 'Gender', 'Bday', 'Mobile Number', 'Document Status', 'Document Baptismal', 'Document Confirmation', 'Document Wedding'],
      donation_tbl: ['ID', 'User ID', 'User Firstname', 'User Lastname', 'Donation Amount', 'Donation Intercession', 'Status', 'Date Created'],
      admin_tbl: ['ID', 'Firstname', 'Lastname', 'Admin Email', 'Mobile Number', 'Birthday', 'Role', 'Status', 'Date Created'],
      priest_tbl: ['ID', 'Priest Name', 'Diocese', 'Parish', 'Availability', 'Status', 'Date Created'],
      request_tbl: ['ID', 'User ID', 'User Firstname', 'User Lastname', 'Document ID', 'Request Baptism Certificate', 'Request Confirmation Certificate', 'Status', 'Date Created'],
      user_tbl: ['ID', 'Firstname', 'Middle Name', 'Lastname', 'Gender', 'Mobile Number', 'Birthday', 'Email', 'Status', 'Date Created'],

      // Booking Sacraments
      wedding: ['ID', 'User ID', 'User Firstname', 'User Lastname', 'Booking Status', 'Booking Sacrament', 'Booking Date', 'Booking Time', 'Amount of People', 'Booking Transaction', "Price", "Paid", 'Status', 'Date Created'],
      baptism: ['ID', 'User ID', 'User Firstname', 'User Lastname', 'Booking Status', 'Booking Sacrament', 'Booking Date', 'Booking Time', 'Amount of People', 'Booking Transaction', "Price", "Paid", 'Status', 'Date Created'],
      confession: ['ID', 'User ID', 'User Firstname', 'User Lastname', 'Booking Status', 'Booking Sacrament', 'Booking Date', 'Booking Time', 'Amount of People', 'Booking Transaction', "Price", "Paid", 'Status', 'Date Created'],
      anointing: ['ID', 'User ID', 'User Firstname', 'User Lastname', 'Booking Status', 'Booking Sacrament', 'Booking Date', 'Booking Time', 'Amount of People', 'Booking Transaction', "Price", "Paid", 'Status', 'Date Created'],
      communion: ['ID', 'User ID', 'User Firstname', 'User Lastname', 'Booking Status', 'Booking Sacrament', 'Booking Date', 'Booking Time', 'Amount of People', 'Booking Transaction', "Price", "Paid", 'Status', 'Date Created'],
      burial: ['ID', 'User ID', 'User Firstname', 'User Lastname', 'Booking Status', 'Booking Sacrament', 'Booking Date', 'Booking Time', 'Amount of People', 'Booking Transaction', "Price", "Paid", 'Status', 'Date Created']
    };

    if (!headers[filename]) {
      console.error(`No headers defined for filename: ${filename}`);
      return;
    }

    const formatData = {
      transaction_logs: (log) => [
        new Date(log.timestamp).toLocaleString(),
        log.table_name,
        log.action,
        log.record_id,
        log.performed_by,
        log.performed_by_email,
        JSON.stringify(log.old_data),
        JSON.stringify(log.new_data)
      ],
      deleted_records: (record) => [
        new Date(record.deleted_at).toLocaleString(),
        record.original_table,
        record.record_id,
        record.deleted_by,
        record.deleted_by_email,
        JSON.stringify(record.record_data)
      ],
      booking_tbl: (booking) => [
        booking.id,
        booking.user_id,
        booking.user_firstname,
        booking.user_lastname,
        booking.booking_status,
        booking.booking_sacrament,
        new Date(booking.booking_date).toLocaleDateString(),
        booking.booking_time,
        booking.booking_pax,
        booking.booking_transaction,
        booking.price || '',
        booking.paid,
        booking.status || '',
        new Date(booking.date_created).toLocaleString()
      ],
      wedding: (booking) => [
        booking.id,
        booking.user_id,
        booking.user_firstname,
        booking.user_lastname,
        booking.booking_status,
        booking.booking_sacrament,
        new Date(booking.booking_date).toLocaleDateString(),
        booking.booking_time,
        booking.booking_pax,
        booking.booking_transaction,
        booking.price || '',
        booking.paid,
        booking.status || '',
        new Date(booking.date_created).toLocaleString(),
      ],
      baptism: (booking) => [
        booking.id,
        booking.user_id,
        booking.user_firstname,
        booking.user_lastname,
        booking.booking_status,
        booking.booking_sacrament,
        new Date(booking.booking_date).toLocaleDateString(),
        booking.booking_time,
        booking.booking_pax,
        booking.booking_transaction,
        booking.price || '',
        booking.paid,
        booking.status || '',
        new Date(booking.date_created).toLocaleString()
      ],
      confession: (booking) => [
        booking.id,
        booking.user_id,
        booking.user_firstname,
        booking.user_lastname,
        booking.booking_status,
        booking.booking_sacrament,
        new Date(booking.booking_date).toLocaleDateString(),
        booking.booking_time,
        booking.booking_pax,
        booking.booking_transaction,
        booking.price || '',
        booking.paid,
        booking.status || '',
        new Date(booking.date_created).toLocaleString()
      ],
      anointing: (booking) => [
        booking.id,
        booking.user_id,
        booking.user_firstname,
        booking.user_lastname,
        booking.booking_status,
        booking.booking_sacrament,
        new Date(booking.booking_date).toLocaleDateString(),
        booking.booking_time,
        booking.booking_pax,
        booking.booking_transaction,
        booking.price || '',
        booking.paid,
        booking.status || '',
        new Date(booking.date_created).toLocaleString()
      ],
      communion: (booking) => [
        booking.id,
        booking.user_id,
        booking.user_firstname,
        booking.user_lastname,
        booking.booking_status,
        booking.booking_sacrament,
        new Date(booking.booking_date).toLocaleDateString(),
        booking.booking_time,
        booking.booking_pax,
        booking.booking_transaction,
        booking.price || '',
        booking.paid,
        booking.status || '',
        new Date(booking.date_created).toLocaleString()
      ],
      burial: (booking) => [
        booking.id,
        booking.user_id,
        booking.user_firstname,
        booking.user_lastname,
        booking.booking_status,
        booking.booking_sacrament,
        new Date(booking.booking_date).toLocaleDateString(),
        booking.booking_time,
        booking.booking_pax,
        booking.booking_transaction,
        booking.price || '',
        booking.paid,
        booking.status || '',
        new Date(booking.date_created).toLocaleString()
      ],
      document_tbl: (doc) => [
        doc.id,
        doc.firstname,
        doc.middle || '',
        doc.lastname,
        doc.gender,
        new Date(doc.bday).toLocaleDateString(),
        doc.mobile || '',
        doc.marital_status || '',
        doc.baptismal_certificate || '',
        doc.confirmation_certificate || '',
        doc.wedding_certificate || ''
      ],
      donation_tbl: (donation) => [
        donation.id,
        donation.user_id,
        donation.user_firstname,
        donation.user_lastname,
        donation.donation_amount,
        donation.donation_intercession || '',
        new Date(donation.date_created).toLocaleString()
      ],
      admin_tbl: (admin) => [
        admin.id,
        admin.admin_firstname,
        admin.admin_lastname,
        admin.admin_email || '',
        admin.admin_mobile || '',
        new Date(admin.admin_bday).toLocaleDateString(),
        admin.status || '',
        new Date(admin.date_created).toLocaleString()
      ],
      priest_tbl: (priest) => [
        priest.id,
        priest.priest_name,
        priest.priest_diocese || '',
        priest.priest_parish || '',
        priest.priest_availability || '',
        priest.status || '',
        new Date(priest.date_created).toLocaleString()
      ],
      request_tbl: (request) => [
        request.id, 
        request.user_id, 
        request.user_firstname, 
        request.user_lastname, 
        request.document_id, 
        request.request_baptismcert, 
        request.request_confirmationcert, 
        request.status, 
        request.date_created,
      ],
      user_tbl: (user) => [
        user.id,
        user.user_firstname,
        user.user_middle || '',
        user.user_lastname,
        user.user_gender,
        user.user_mobile || '',
        new Date(user.user_bday).toLocaleDateString(),
        user.user_email || '',
        user.user_status || '',
        new Date(user.date_created).toLocaleString()
      ],
    };

    const csvContent = [
      headers[filename].join(','),
      ...data.map(formatData[filename]).map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default exportToCSV;