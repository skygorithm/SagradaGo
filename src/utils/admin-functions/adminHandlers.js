import { supabase } from "../../config/supabase";
import fetchSacramentForms from "./fetch-documents/fetchSacramentForms";
import deleteSacramentDocuments from "./delete-documents/deleteSacramentDocuments";
import restoreSacramentDocuments from "./delete-documents/restoreSacramentDocuments";
import permanentlyDeleteSacramentDocuments from "./delete-documents/permanentlyDeleteSacramentDocuments";
import exportToCSV from "./exportToCSV";
import { applyFilters } from "./applyFilters";
import getDisplaySacrament from "./displaySacrament";
import generateTransactionId from "./generateTransactionId";

const isCompletedStatus = (status) =>
  status && String(status).toLowerCase() === "completed";
const isApprovedStatus = (status) =>
  status && String(status).toLowerCase() === "approved";
const isConfirmedStatus = (status) =>
  status && String(status).toLowerCase() === "confirmed";
const isPendingStatus = (status) =>
  status && ["pending", "waiting"].includes(String(status).toLowerCase());
const isRejectedStatus = (status) =>
  status && ["rejected", "cancelled", "declined"].includes(String(status).toLowerCase());

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const fetchStats = async (setStats) => {
  const fallback = {
    totalUsers: 0,
    totalDocuments: 0,
    pendingBookings: 0,
    completedBookings: 0,
    approvedBookings: 0,
    confirmedBookings: 0,
    rejectedBookings: 0,
    totalDonations: 0,
    totalAdmins: 0,
    totalPriests: 0,
    availablePriests: 0,
    mostCommonSacrament: "—",
    bookingsByMonth: [],
    monthlyDonations: [],
    donationSummary: {
      today: 0,
      lastWeek: 0,
      thisMonth: 0,
      yearTotal: 0,
      average: 0,
    },
    completedBySacrament: [],
  };

  try {
    const [
      { count: totalUsers } = {},
      { count: totalDocuments } = {},
      { count: totalDonations } = {},
      { count: totalAdmins } = {},
      { count: totalPriests } = {},
      { count: availablePriests } = {},
    ] = await Promise.all([
      supabase.from("user_tbl").select("*", { count: "exact" }),
      supabase.from("document_tbl").select("*", { count: "exact" }),
      supabase.from("donation_tbl").select("*", { count: "exact" }),
      supabase.from("admin_tbl").select("*", { count: "exact" }),
      supabase.from("priest_tbl").select("*", { count: "exact" }),
      supabase
        .from("priest_tbl")
        .select("*", { count: "exact" })
        .eq("priest_availability", "Yes"),
    ]);

    const { data: allBookingsForStats = [] } =
      (await supabase
        .from("booking_tbl")
        .select("booking_status, booking_sacrament, booking_date")) || {};

    const completedBookings = allBookingsForStats.filter((b) =>
      isCompletedStatus(b.booking_status)
    ).length;
    const approvedBookings = allBookingsForStats.filter((b) =>
      isApprovedStatus(b.booking_status)
    ).length;
    const confirmedBookings = allBookingsForStats.filter((b) =>
      isConfirmedStatus(b.booking_status)
    ).length;
    const pendingBookings = allBookingsForStats.filter((b) =>
      isPendingStatus(b.booking_status)
    ).length;
    const rejectedBookings = allBookingsForStats.filter((b) =>
      isRejectedStatus(b.booking_status)
    ).length;

    const bookingsMonthlyCounts = {};
    const completedBySacrament = {};

    allBookingsForStats.forEach((b) => {
      if (b.booking_date) {
        const d = new Date(b.booking_date);
        if (!isNaN(d.getTime())) {
          const mon = monthNames[d.getMonth()];
          bookingsMonthlyCounts[mon] = (bookingsMonthlyCounts[mon] || 0) + 1;
        }
      }
      if (b.booking_sacrament && isCompletedStatus(b.booking_status)) {
        completedBySacrament[b.booking_sacrament] =
          (completedBySacrament[b.booking_sacrament] || 0) + 1;
      }
    });

    const bookingsByMonth = monthNames.map((m) => ({
      month: m,
      count: bookingsMonthlyCounts[m] || 0,
    }));

    const completedBySacramentArr = Object.entries(completedBySacrament).map(
      ([sacrament, count]) => ({ sacrament, count })
    );

    const sacCounts = {};
    allBookingsForStats.forEach((b) => {
      if (b.booking_sacrament) {
        sacCounts[b.booking_sacrament] =
          (sacCounts[b.booking_sacrament] || 0) + 1;
      }
    });
    const mostCommonSacrament =
      Object.entries(sacCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    // ===== FIXED DONATION LOGIC (ALIGNED TO SHORT VERSION) =====
    const { data: donationDataRaw = [] } =
      (await supabase.from("donation_tbl").select("*")) || {};

    const donations = (donationDataRaw || []).map((don) => {
      let date = null;
      if (don.date_created) date = new Date(don.date_created);
      else if (don.donation_date) date = new Date(don.donation_date);
      else if (don.created_at) date = new Date(don.created_at);
      const amount = typeof don.donation_amount === "number"
        ? don.donation_amount
        : parseFloat(
            String(don.donation_amount || "0").replace(/[^\d.-]/g, "")
          );
      return { date, amount: isNaN(amount) ? 0 : amount };
    });

    const now = new Date();

    const monthlyDonations = monthNames.map((month, idx) => {
      const total = donations
        .filter(
          (d) =>
            d.date &&
            d.date.getMonth() === idx &&
            d.date.getFullYear() === now.getFullYear()
        )
        .reduce((acc, cur) => acc + cur.amount, 0);
      return { month, amount: total };
    });

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const donationSummary = {
      today: donations
        .filter((d) => d.date && d.date >= today)
        .reduce((a, b) => a + b.amount, 0),
      lastWeek: donations
        .filter((d) => d.date && d.date >= weekAgo)
        .reduce((a, b) => a + b.amount, 0),
      thisMonth: donations
        .filter((d) => d.date && d.date >= monthStart)
        .reduce((a, b) => a + b.amount, 0),
      yearTotal: donations
        .filter((d) => d.date && d.date >= yearStart)
        .reduce((a, b) => a + b.amount, 0),
      average:
        donations.length > 0
          ? donations.reduce((a, b) => a + b.amount, 0) / donations.length
          : 0,
    };

    setStats({
      totalUsers: totalUsers ?? fallback.totalUsers,
      totalDocuments: totalDocuments ?? fallback.totalDocuments,
      pendingBookings,
      completedBookings,
      approvedBookings,
      confirmedBookings,
      rejectedBookings,
      totalDonations: totalDonations ?? fallback.totalDonations,
      totalAdmins: totalAdmins ?? fallback.totalAdmins,
      totalPriests: totalPriests ?? fallback.totalPriests,
      availablePriests: availablePriests ?? fallback.availablePriests,
      mostCommonSacrament,
      bookingsByMonth,
      monthlyDonations,
      donationSummary,
      completedBySacrament: completedBySacramentArr,
    });
  } catch (error) {
    console.error("fetchStats error:", error);
    setStats({ ...fallback });
  }
};

export const handleAdd = ({ selectedTable, setFormData, setEditingRecord, setOpenDialog, formData = {} }) => {
  let initialFormData = {};
  if (selectedTable === "booking_tbl") {
    const transactionId = generateTransactionId();
    initialFormData = {
      booking_status: "pending",
      booking_transaction: transactionId,
      booking_pax: 1,
      paid: false,
    };
  } else if (selectedTable === "user_tbl") {
    initialFormData = {
      user_status: "active",
      user_gender: "",
    };
  } else if (selectedTable === "document_tbl") {
    initialFormData = {
      baptismal_certificate: null,
      confirmation_certificate: null,
      wedding_certificate: null,
    };
  } else if (selectedTable === "donation_tbl") {
    initialFormData = {
      donation_amount: 0,
      donation_status: "pending",
    };
  } else if (selectedTable === "priest_tbl") {
    initialFormData = {
      priest_availability: "Yes",
    };
  } else if (selectedTable === "admin_tbl") {
    initialFormData = {
      admin_status: "active",
    };
  }
  const finalFormData = { ...initialFormData, ...formData };
  setFormData(finalFormData);
  setEditingRecord(null);
  setOpenDialog(true);
};

export const handleSacramentAdd = ({ selectedSacrament, setFormData, setEditingRecord, setOpenSacramentDialog }) => {
  const transactionId = generateTransactionId();
  const initialFormData = {
    booking_status: "pending",
    booking_transaction: transactionId,
    booking_sacrament: getDisplaySacrament(selectedSacrament),
    booking_pax: 1,
    paid: false,
  };
  setFormData(initialFormData);
  setEditingRecord(null);
  setOpenSacramentDialog(true);
};

export const handleEdit = ({ selectedTable, record, setFormData, setEditingRecord, setOpenDialog }) => {
  if (!record) return;
  const cleanRecord = { ...record };
  delete cleanRecord.user_firstname;
  delete cleanRecord.user_lastname;
  delete cleanRecord.groom_fullname;
  delete cleanRecord.bride_fullname;
  delete cleanRecord.groom_1x1;
  delete cleanRecord.bride_1x1;
  if (selectedTable === "booking_tbl") {
    cleanRecord.booking_pax = cleanRecord.booking_pax || 1;
    cleanRecord.paid = cleanRecord.paid !== undefined ? cleanRecord.paid : false;
    cleanRecord.booking_status = cleanRecord.booking_status || "pending";
    if (cleanRecord.booking_date) {
      cleanRecord.booking_date = new Date(cleanRecord.booking_date).toISOString().split("T")[0];
    }
  } else if (selectedTable === "user_tbl") {
    if (cleanRecord.user_bday) {
      cleanRecord.user_bday = new Date(cleanRecord.user_bday).toISOString().split("T")[0];
    }
    cleanRecord.user_status = cleanRecord.user_status || "active";
  } else if (selectedTable === "document_tbl") {
    cleanRecord.baptismal_certificate = cleanRecord.baptismal_certificate || null;
    cleanRecord.confirmation_certificate = cleanRecord.confirmation_certificate || null;
    cleanRecord.wedding_certificate = cleanRecord.wedding_certificate || null;
  }
  setFormData(cleanRecord);
  setEditingRecord(record.id);
  setOpenDialog(true);
};

export const handleSacramentEdit = ({ record, setFormData, setEditingRecord, setOpenSacramentDialog }) => {
  if (!record) return;
  const cleanRecord = { ...record };
  delete cleanRecord.user_firstname;
  delete cleanRecord.user_lastname;
  cleanRecord.booking_pax = cleanRecord.booking_pax || 1;
  cleanRecord.paid = cleanRecord.paid !== undefined ? cleanRecord.paid : false;
  cleanRecord.booking_status = cleanRecord.booking_status || "pending";
  if (cleanRecord.booking_date) {
    cleanRecord.booking_date = new Date(cleanRecord.booking_date).toISOString().split("T")[0];
  }
  setFormData(cleanRecord);
  setEditingRecord(record.id);
  setOpenSacramentDialog(true);
};

export const fetchTables = (setTables, setLoading) => {
  setTables(["document_tbl", "donation_tbl", "request_tbl", "admin_tbl", "priest_tbl", "user_tbl"]);
  setLoading(false);
};

export const fetchUsers = async (setUsers) => {
  const { data, error } = await supabase
    .from("user_tbl")
    .select("id, user_firstname, user_lastname, user_email");
  if (!error) setUsers(data || []);
};

export const fetchManagementTableData = async (
  tableName,
  setSelectedTable,
  setTableData,
  setFilteredData,
  setSearchQuery,
  setLoading
) => {
  setSelectedTable(tableName);
  setLoading(true);
  let query = supabase.from(tableName).select("*");
  const { data, error } = await query;
  if (!error) {
    setTableData(data || []);
    setFilteredData(data || []);
    setSearchQuery("");
  }
  setLoading(false);
};

export const fetchSacramentTableData = async (
  sacrament,
  setSelectedSacrament,
  setSacramentTableData,
  setSacramentFilteredData,
  setLoading
) => {
  setSelectedSacrament(sacrament);
  setLoading(true);

  try {
    let query = supabase
      .from("booking_tbl")
      .select("*, user_tbl:user_id(user_firstname,user_lastname)")
      .order("booking_date", { ascending: false });

    if (sacrament && sacrament !== "all") {
      const displaySacrament = getDisplaySacrament(sacrament);
      query = query.eq("booking_sacrament", displaySacrament);
    }

    const { data, error } = await query;
    if (error) {
      setLoading(false);
      return;
    }

    let transformed = (data || []).map((r) => ({
      ...r,
      user_firstname: r.user_tbl?.user_firstname || "",
      user_lastname: r.user_tbl?.user_lastname || "",
    }));

    // Fetch wedding details for wedding bookings
    const weddingBookings = transformed.filter(
      (b) => b.booking_sacrament?.toLowerCase() === "wedding"
    );

    if (weddingBookings.length > 0) {
      const weddingIds = weddingBookings.map((b) => b.id);
      const { data: weddingData, error: weddingError } = await supabase
        .from("booking_wedding_docu_tbl")
        .select("booking_id, groom_fullname, bride_fullname")
        .in("booking_id", weddingIds);

      if (!weddingError && weddingData) {
        // Map wedding details back to bookings
        transformed = transformed.map((booking) => {
          if (booking.booking_sacrament?.toLowerCase() === "wedding") {
            const weddingDetail = weddingData.find(
              (w) => w.booking_id === booking.id
            );
            if (weddingDetail) {
              return {
                ...booking,
                groom_fullname: weddingDetail.groom_fullname,
                bride_fullname: weddingDetail.bride_fullname,
              };
            }
          }
          return booking;
        });
      }
    }

    setSacramentTableData(transformed);
    setSacramentFilteredData(transformed);
  } catch (err) {
    console.error("Error fetching sacrament data:", err);
  } finally {
    setLoading(false);
  }
};

export const fetchTransactionLogs = async (setTransactionLogs, setOpenLogsDialog) => {
  const { data } = await supabase
    .from("transaction_logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(100);
  setTransactionLogs(data || []);
  setOpenLogsDialog(true);
};

export const fetchDeletedRecords = async (setDeletedRecords, setOpenDeletedDialog) => {
  const { data } = await supabase
    .from("deleted_records")
    .select("*")
    .order("deleted_at", { ascending: false });
  setDeletedRecords(data || []);
  setOpenDeletedDialog(true);
};

export const handleLogout = ({ logout, navigate }) => {
  logout();
  navigate("/admin/login");
};

export const handleDelete = async ({
  id,
  tableData,
  selectedTable,
  adminData,
  setSuccess,
  setError,
  handleTableSelect,
  fetchStats,
}) => {
  if (!window.confirm("Are you sure you want to delete this record?")) return;
  
  try {
    const recordToDelete = tableData.find((r) => r.id === id);
    
    // Special handling for user_tbl due to foreign key constraints
    if (selectedTable === "user_tbl") {
      // Check for related bookings first
      const { data: relatedBookings, error: checkBookingsError } = await supabase
        .from("booking_tbl")
        .select("id, booking_sacrament, booking_status, booking_date")
        .eq("user_id", id);

      if (checkBookingsError) {
        throw new Error("Error checking related bookings: " + checkBookingsError.message);
      }

      // Check for related documents
      const { data: relatedDocuments, error: checkDocumentsError } = await supabase
        .from("document_tbl")
        .select("id")
        .eq("user_id", id);

      if (checkDocumentsError) {
        throw new Error("Error checking related documents: " + checkDocumentsError.message);
      }

      // Check for related donations
      const { data: relatedDonations, error: checkDonationsError } = await supabase
        .from("donation_tbl")
        .select("id, donation_amount")
        .eq("user_id", id);

      if (checkDonationsError) {
        throw new Error("Error checking related donations: " + checkDonationsError.message);
      }

      const totalRelatedRecords = (relatedBookings?.length || 0) + (relatedDocuments?.length || 0) + (relatedDonations?.length || 0);

      if (totalRelatedRecords > 0) {
        const relatedInfo = [];
        if (relatedBookings?.length > 0) {
          relatedInfo.push(`${relatedBookings.length} booking(s)`);
        }
        if (relatedDocuments?.length > 0) {
          relatedInfo.push(`${relatedDocuments.length} document(s)`);
        }
        if (relatedDonations?.length > 0) {
          relatedInfo.push(`${relatedDonations.length} donation(s)`);
        }

        const shouldDeleteAll = window.confirm(
          `This user has ${relatedInfo.join(' and ')}.\n\n` +
          `Do you want to delete the user along with all related records?\n\n` +
          `⚠️ This action cannot be undone and will permanently remove:\n` +
          `- The user account\n` +
          `- All associated bookings\n` +
          `- All associated documents\n` +
          `- All associated donations\n\n` +
          `Click OK to proceed or Cancel to abort.`
        );

        if (!shouldDeleteAll) {
          setError && setError(
            `Cannot delete user with existing related records. ` +
            `The user has ${relatedInfo.join(' and ')} that must be handled first.`
          );
          return;
        }

        // Delete related records first
        if (relatedBookings?.length > 0) {
          // Move bookings to deleted_records first
          for (const booking of relatedBookings) {
            await supabase.from("deleted_records").insert({
              original_table: "booking_tbl",
              record_id: booking.id,
              record_data: booking,
              deleted_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : "Unknown",
              deleted_by_email: adminData?.email || "Unknown",
              deletion_reason: "Cascade delete from user deletion"
            });

            await supabase.from("transaction_logs").insert({
              table_name: "booking_tbl",
              action: "CASCADE_DELETE",
              record_id: booking.id,
              old_data: booking,
              new_data: null,
              performed_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : "Unknown",
              performed_by_email: adminData?.email || "Unknown",
            });
          }

          // Delete bookings
          const { error: deleteBookingsError } = await supabase
            .from("booking_tbl")
            .delete()
            .eq("user_id", id);

          if (deleteBookingsError) {
            throw new Error("Error deleting related bookings: " + deleteBookingsError.message);
          }
        }

        if (relatedDocuments?.length > 0) {
          // Move documents to deleted_records first
          for (const document of relatedDocuments) {
            await supabase.from("deleted_records").insert({
              original_table: "document_tbl",
              record_id: document.id,
              record_data: document,
              deleted_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : "Unknown",
              deleted_by_email: adminData?.email || "Unknown",
              deletion_reason: "Cascade delete from user deletion"
            });

            await supabase.from("transaction_logs").insert({
              table_name: "document_tbl",
              action: "CASCADE_DELETE",
              record_id: document.id,
              old_data: document,
              new_data: null,
              performed_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : "Unknown",
              performed_by_email: adminData?.email || "Unknown",
            });
          }

          // Delete documents
          const { error: deleteDocumentsError } = await supabase
            .from("document_tbl")
            .delete()
            .eq("user_id", id);

          if (deleteDocumentsError) {
            throw new Error("Error deleting related documents: " + deleteDocumentsError.message);
          }
        }

        if (relatedDonations?.length > 0) {
          // Move donations to deleted_records first
          for (const donation of relatedDonations) {
            await supabase.from("deleted_records").insert({
              original_table: "donation_tbl",
              record_id: donation.id,
              record_data: donation,
              deleted_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : "Unknown",
              deleted_by_email: adminData?.email || "Unknown",
              deletion_reason: "Cascade delete from user deletion"
            });

            await supabase.from("transaction_logs").insert({
              table_name: "donation_tbl",
              action: "CASCADE_DELETE",
              record_id: donation.id,
              old_data: donation,
              new_data: null,
              performed_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : "Unknown",
              performed_by_email: adminData?.email || "Unknown",
            });
          }

          // Delete donations
          const { error: deleteDonationsError } = await supabase
            .from("donation_tbl")
            .delete()
            .eq("user_id", id);

          if (deleteDonationsError) {
            throw new Error("Error deleting related donations: " + deleteDonationsError.message);
          }
        }
      }
    }

    // Now proceed with the original deletion logic
    const { error: insertError } = await supabase.from("deleted_records").insert({
      original_table: selectedTable,
      record_id: id,
      record_data: recordToDelete,
      deleted_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : "Unknown",
      deleted_by_email: adminData?.email || "Unknown",
    });
    
    if (insertError) throw insertError;

    await supabase.from("transaction_logs").insert({
      table_name: selectedTable,
      action: "DELETE",
      record_id: id,
      old_data: recordToDelete,
      new_data: null,
      performed_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : "Unknown",
      performed_by_email: adminData?.email || "Unknown",
    });

    const { error: deleteError } = await supabase.from(selectedTable).delete().eq("id", id);
    if (deleteError) throw deleteError;

    const successMessage = selectedTable === "user_tbl" && tableData.find(r => r.id === id) 
      ? "User and all related records moved to trash"
      : "Record moved to trash";
    
    setSuccess && setSuccess(successMessage);
    handleTableSelect && handleTableSelect(selectedTable);
    fetchStats && fetchStats();

  } catch (error) {
    console.error("Delete operation failed:", error);
    setError && setError("Error deleting record: " + error.message);
  }
};

export const handleSacramentDelete = async ({
  id,
  sacramentTableData,
  selectedSacrament,
  adminData,
  setSuccess,
  setError,
  handleSacramentTableSelect,
  fetchStats,
}) => {
  if (!window.confirm("Are you sure you want to delete this record?")) return;
  try {
    const recordToDelete = sacramentTableData.find((r) => r.id === id);
    const bookingSacrament = recordToDelete.booking_sacrament;
    const specificId =
      bookingSacrament === "Wedding"
        ? recordToDelete.wedding_docu_id
        : bookingSacrament === "Baptism"
        ? recordToDelete.baptism_docu_id
        : bookingSacrament === "Burial"
        ? recordToDelete.burial_docu_id
        : null;
    let specificTable = null;
    if (specificId) {
      if (bookingSacrament === "Wedding") specificTable = "booking_wedding_docu_tbl";
      else if (bookingSacrament === "Baptism") specificTable = "booking_baptism_docu_tbl";
      else if (bookingSacrament === "Burial") specificTable = "booking_burial_docu_tbl";
      if (specificTable) {
        deleteSacramentDocuments({
          table: specificTable,
          sacrament: bookingSacrament,
          specificId,
          adminData,
        });
      }
    }
    const { error: insertError } = await supabase.from("deleted_records").insert({
      original_table: "booking_tbl",
      record_id: id,
      record_data: recordToDelete,
      deleted_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : "Unknown",
      deleted_by_email: adminData?.email || "Unknown",
    });
    await supabase.from("transaction_logs").insert({
      table_name: "booking_tbl",
      action: "DELETE",
      record_id: id,
      old_data: recordToDelete,
      new_data: null,
      performed_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : "Unknown",
      performed_by_email: adminData?.email || "Unknown",
    });
    const { error: deleteError } = await supabase.from("booking_tbl").delete().eq("id", id);
    if (specificId && specificTable) {
      await supabase.from(specificTable).delete().eq("id", specificId);
    }
    if (insertError) throw insertError;
    if (deleteError) throw deleteError;
    setSuccess && setSuccess("Record moved to trash");
    handleSacramentTableSelect && handleSacramentTableSelect(selectedSacrament);
    fetchStats && fetchStats();
  } catch (error) {
    setError && setError("Error deleting record: " + error.message);
  }
};

export const handleViewDeleted = async ({
  setDeletedRecords,
  setOpenDeletedDialog,
  setError
}) => {
  try {
    const { data, error } = await supabase
      .from("deleted_records")
      .select("*")
      .order("deleted_at", { ascending: false });
    if (error) throw error;
    setDeletedRecords(data || []);
    setOpenDeletedDialog(true);
  } catch (error) {
    setError("Error fetching deleted records: " + error.message);
  }
};

export const handleRestore = async ({
  record,
  setSuccess,
  setError,
  fetchStats,
  setDeletedRecords,
  setOpenDeletedDialog,
  handleTableSelect,
  selectedSacrament,
  handleSacramentTableSelect,
  adminData
}) => {
  if (!window.confirm("Are you sure you want to restore this record?")) return;
  try {
    await restoreSacramentDocuments({ id: record.id, adminData });
    setSuccess("Record restored successfully");
    fetchStats && fetchStats();
    handleViewDeleted({ setDeletedRecords, setOpenDeletedDialog, setError });
    if (handleTableSelect && record.original_table) handleTableSelect(record.original_table);
    if (
      record.original_table === "booking_tbl" &&
      typeof handleSacramentTableSelect === "function"
    )
      handleSacramentTableSelect(selectedSacrament || "all");
  } catch (error) {
    setError("Error restoring record: " + error.message);
  }
};

export const handlePermanentDelete = async ({
  record,
  setSuccess,
  setError,
  setDeletedRecords
}) => {
  if (
    !window.confirm(
      "Are you sure you want to permanently delete this record? This action cannot be undone."
    )
  )
    return;
  try {
    await permanentlyDeleteSacramentDocuments({ id: record.id });
    setSuccess("Record permanently deleted");
    handleViewDeleted({ setDeletedRecords, setOpenDeletedDialog: () => {}, setError });
  } catch (error) {
    setError("Error permanently deleting record: " + error.message);
  }
};

export const handleViewLogs = async ({
  setTransactionLogs,
  setOpenLogsDialog
}) => {
  await fetchTransactionLogs(setTransactionLogs, setOpenLogsDialog);
};

export const handleSort = (key, sortConfig, setSortConfig, filteredData, setFilteredData) => {
  let direction = "ascending";
  if (sortConfig.key === key && sortConfig.direction === "ascending")
    direction = "descending";
  setSortConfig({ key, direction });
  const sortedData = [...filteredData].sort((a, b) => {
    if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
    if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
    return 0;
  });
  setFilteredData(sortedData);
};

export const handleSacramentSort = (key, sortConfig, setSortConfig, filteredData, setFilteredData) => {
  handleSort(key, sortConfig, setSortConfig, filteredData, setFilteredData);
};

export const handleFilterChange = (searchQuery, tableData, setFilteredData) => {
  if (!searchQuery.trim()) {
    setFilteredData(tableData);
    return;
  }
  const filtered = tableData.filter((item) =>
    Object.values(item).some((value) => value?.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  );
  setFilteredData(filtered);
};

export const calculateTableStats = (data) => {
  if (!Array.isArray(data)) {
    return { total: 0, active: 0, inactive: 0 };
  }
  const total = data.length;
  const active = data.filter(
    (item) =>
      item.status === "active" ||
      isApprovedStatus(item.booking_status) ||
      isCompletedStatus(item.booking_status) ||
      isConfirmedStatus(item.booking_status) ||
      item.priest_availability === "Yes"
  ).length;
  const inactive = total - active;
  return { total, active, inactive };
};

export const sacramentCalculateTableStats = (data) => {
  if (!Array.isArray(data)) {
    return { total: 0, pending: 0, approved: 0, completed: 0, confirmed: 0, rejected: 0, sacramentBreakdown: {} };
  }
  const total = data.length;
  const pending = data.filter((item) => isPendingStatus(item.booking_status)).length;
  const approved = data.filter((item) => isApprovedStatus(item.booking_status)).length;
  const completed = data.filter((item) => isCompletedStatus(item.booking_status)).length;
  const confirmed = data.filter((item) => isConfirmedStatus(item.booking_status)).length;
  const rejected = data.filter((item) => isRejectedStatus(item.booking_status)).length;
  const sacramentBreakdown = {};
  data.forEach((item) => {
    const sacrament = item.booking_sacrament;
    if (sacrament) {
      sacramentBreakdown[sacrament] = (sacramentBreakdown[sacrament] || 0) + 1;
    }
  });
  return { total, pending, approved, completed, confirmed, rejected, sacramentBreakdown };
};

export const displaySacramentForm = async (sacrament, bookingId) => {
  try {
    return await fetchSacramentForms(sacrament, bookingId);
  } catch {
    return null;
  }
};

export { exportToCSV, applyFilters };