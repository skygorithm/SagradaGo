import { supabase } from "../../config/supabase";
import fetchSacramentForms from "./fetch-documents/fetchSacramentForms";

// Month short names (consistent with DataAnalyticsDashboard)
const monthNames = [
  "Jan", "Feb", "Mar", "Apr",
  "May", "Jun", "Jul", "Aug",
  "Sep", "Oct", "Nov", "Dec",
];

// ===== FETCH STATS (for DataAnalyticsDashboard) =====
export const fetchStats = async (setStats) => {
  try {
    // USERS
    const { count: totalUsers } = await supabase
      .from("user_tbl")
      .select("*", { count: "exact" });

    // DOCUMENTS
    const { count: totalDocuments } = await supabase
      .from("document_tbl")
      .select("*", { count: "exact" });

    // BOOKINGS
    const { count: pendingBookings } = await supabase
      .from("booking_tbl")
      .select("*", { count: "exact" })
      .eq("booking_status", "pending");

    const { count: approvedBookings } = await supabase
      .from("booking_tbl")
      .select("*", { count: "exact" })
      .eq("booking_status", "approved");

    // DONATIONS
    const { count: totalDonations } = await supabase
      .from("donation_tbl")
      .select("*", { count: "exact" });

    // ADMINS & PRIESTS
    const { count: totalAdmins } = await supabase
      .from("admin_tbl")
      .select("*", { count: "exact" });

    const { count: totalPriests } = await supabase
      .from("priest_tbl")
      .select("*", { count: "exact" });

    const { count: availablePriests } = await supabase
      .from("priest_tbl")
      .select("*", { count: "exact" })
      .eq("priest_availability", "Yes");

    // APPROVED BOOKINGS BY SACRAMENT
    const { data: approvedSacraments } = await supabase
      .from("booking_tbl")
      .select("booking_sacrament")
      .eq("booking_status", "approved");

    const sacramentMap = {};
    approvedSacraments?.forEach((s) => {
      sacramentMap[s.booking_sacrament] =
        (sacramentMap[s.booking_sacrament] || 0) + 1;
    });
    const approvedBySacrament = Object.entries(sacramentMap).map(
      ([sacrament, count]) => ({ sacrament, count })
    );

    // MOST COMMON SACRAMENT
    const { data: allSacraments } = await supabase
      .from("booking_tbl")
      .select("booking_sacrament");

    const countMap = {};
    allSacraments?.forEach((s) => {
      countMap[s.booking_sacrament] = (countMap[s.booking_sacrament] || 0) + 1;
    });
    const mostCommonSacrament =
      Object.entries(countMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    // BOOKINGS BY MONTH
    const { data: allBookings } = await supabase
      .from("booking_tbl")
      .select("booking_date");

    const bookingsByMonth = monthNames.map((m) => ({ month: m, count: 0 }));
    allBookings?.forEach((b) => {
      const d = new Date(b.booking_date);
      if (!isNaN(d)) {
        const monthIdx = d.getMonth();
        bookingsByMonth[monthIdx].count += 1;
      }
    });

    // DONATIONS (last 6 months)
    let sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: donationsData } = await supabase
      .from("donation_tbl")
      .select("*")
      .gte("date_created", sixMonthsAgo.toISOString());

    const donations = (donationsData ?? []).map((d) => ({
      ...d,
      date: new Date(d.date_created),
    }));

    const monthlyDonations = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const label = d.toLocaleString("default", { month: "short" });
      const total = donations
        .filter(
          (e) =>
            e.date.getMonth() === d.getMonth() &&
            e.date.getFullYear() === d.getFullYear()
        )
        .reduce((acc, cur) => acc + (cur.donation_amount || 0), 0);
      return { month: label, amount: total };
    });

    // DONATION SUMMARY
    const today = new Date();
    const todayDonations = donations
      .filter((d) => d.date.toDateString() === today.toDateString())
      .reduce((a, b) => a + b.donation_amount, 0);

    const lastWeekTotal = donations
      .filter(
        (d) => d.date >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      )
      .reduce((a, b) => a + b.donation_amount, 0);

    const thisMonthTotal = donations
      .filter(
        (d) =>
          d.date.getMonth() === today.getMonth() &&
          d.date.getFullYear() === today.getFullYear()
      )
      .reduce((a, b) => a + b.donation_amount, 0);

    const yearTotal = donations
      .filter((d) => d.date.getFullYear() === today.getFullYear())
      .reduce((a, b) => a + b.donation_amount, 0);

    const averageDonation = donations.length ? yearTotal / donations.length : 0;

    // RECENT TRANSACTIONS
    const { data: recentTransactions } = await supabase
      .from("transaction_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(5);

    // SET STATS
    setStats({
      totalUsers,
      totalDocuments,
      pendingBookings,
      approvedBookings,
      totalDonations,
      totalAdmins,
      totalPriests,
      availablePriests,
      approvedBySacrament,
      mostCommonSacrament,
      recentTransactions,
      bookingsByMonth,
      monthlyDonations,
      donationSummary: {
        today: todayDonations,
        lastWeek: lastWeekTotal,
        thisMonth: thisMonthTotal,
        average: Math.round(averageDonation),
        yearTotal,
      },
    });
  } catch (err) {
    console.error("fetchStats error:", err);
  }
};

// ===== TABLES =====
export const fetchTables = (setTables, setLoading) => {
  setTables([
    "document_tbl",
    "donation_tbl",
    "request_tbl",
    "admin_tbl",
    "priest_tbl",
    "user_tbl",
  ]);
  setLoading(false);
};

// ===== USERS =====
export const fetchUsers = async (setUsers) => {
  const { data, error } = await supabase
    .from("user_tbl")
    .select("id, user_firstname, user_lastname, user_email");
  if (!error) setUsers(data || []);
};

// ===== MANAGEMENT DATA =====
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

// ===== SACRAMENT DATA =====
export const fetchSacramentTableData = async (
  sacrament,
  setSelectedSacrament,
  setSacramentTableData,
  setSacramentFilteredData,
  setLoading
) => {
  setSelectedSacrament(sacrament);
  setLoading(true);

  let query = supabase
    .from("booking_tbl")
    .select("*, user_tbl:user_id(user_firstname,user_lastname)")
    .order("booking_date", { ascending: false });

  if (sacrament && sacrament !== "all")
    query = query.eq("booking_sacrament", sacrament);

  const { data } = await query;
  let transformed = (data || []).map((r) => ({
    ...r,
    user_firstname: r.user_tbl?.user_firstname || "",
    user_lastname: r.user_tbl?.user_lastname || "",
  }));

  setSacramentTableData(transformed);
  setSacramentFilteredData(transformed);
  setLoading(false);
};

// ===== TRANSACTION LOGS =====
export const fetchTransactionLogs = async (
  setTransactionLogs,
  setOpenLogsDialog
) => {
  const { data } = await supabase
    .from("transaction_logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(100);
  setTransactionLogs(data || []);
  setOpenLogsDialog(true);
};

// ===== TRASH =====
export const fetchDeletedRecords = async (
  setDeletedRecords,
  setOpenDeletedDialog
) => {
  const { data } = await supabase
    .from("deleted_records")
    .select("*")
    .order("deleted_at", { ascending: false });
  setDeletedRecords(data || []);
  setOpenDeletedDialog(true);
};

// ===== DISPLAY SACRAMENT FORM =====
export const displaySacramentForm = async (
  title,
  id,
  sacrament,
  setCardOpen,
  setCardTitle,
  setCardContent
) => {
  setCardOpen(true);
  setCardTitle(title);
  setCardContent(await fetchSacramentForms(id, sacrament));
};