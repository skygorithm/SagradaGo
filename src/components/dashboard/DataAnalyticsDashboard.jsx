// src/components/dashboard/DataAnalyticsDashboard.jsx

import React, { useMemo, useState } from "react";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChartLegend } from "../ChartLegends";

const CHART_COLORS = [
  "#0088FE",
  "#FF6B6B",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#00C49F",
];

const ALL_SACRAMENTS = [
  "Wedding",
  "Baptism",
  "Confession",
  "Anointing of the Sick",
  "First Communion",
  "Burial",
];

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

const safe = (obj, path, fallback = "—") => {
  return (
    path.split(".").reduce((acc, key) => acc?.[key], obj) ?? fallback
  );
};

const pesoFormat = (val) =>
  isNaN(val) || val === null || val === undefined
    ? "₱0.00"
    : new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
      }).format(val);

const DataAnalyticsDashboard = ({
  stats = {},
  allBookings = [],
  isMobile = false,
  setCurrentView,
  handleSacramentTableSelect,
  onShowPending,
}) => {
  const [openNoPending, setOpenNoPending] = useState(false);

  /** ---------- Derived Values ---------- **/
  const {
    approvedCount,
    pendingCount,
    mostCommonSacrament,
    monthlyFrequency,
  } = useMemo(() => {
    const approved = allBookings.filter(
      (b) => b.booking_status?.toLowerCase() === "approved"
    );
    const pending = allBookings.filter(
      (b) => b.booking_status?.toLowerCase() === "pending"
    );

    const sacCounts = {};
    allBookings.forEach((b) => {
      sacCounts[b.booking_sacrament] =
        (sacCounts[b.booking_sacrament] || 0) + 1;
    });

    const mostCommon =
      Object.entries(sacCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    const monthlyCounts = {};
    allBookings.forEach((b) => {
      if (!b.booking_date) return;
      const d = new Date(b.booking_date);
      if (isNaN(d)) return;
      const month = monthNames[d.getMonth()];
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    const monthlyArray = monthNames.map((m) => ({
      month: m,
      count: monthlyCounts[m] || 0,
    }));

    return {
      approvedCount: stats.approvedBookings ?? approved.length,
      pendingCount: stats.pendingBookings ?? pending.length,
      mostCommonSacrament: stats.mostCommonSacrament || mostCommon,
      monthlyFrequency: monthlyArray,
    };
  }, [allBookings, stats]);

  /** ---------- Charts ---------- **/

  // Completed bookings by sacrament
  const renderCompletedBarChart = () => {
    const approvedBySacrament = ALL_SACRAMENTS.map((sacrament) => {
      const found = (stats?.approvedBySacrament || []).find(
        (item) => item.sacrament === sacrament
      );
      return found || { sacrament, count: 0 };
    });

    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={approvedBySacrament}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="sacrament" fontSize={isMobile ? 10 : 12} />
          <YAxis fontSize={isMobile ? 10 : 12} allowDecimals={false} />
          <Tooltip />
          <Bar
            dataKey="count"
            onClick={(d) =>
              d?.sacrament &&
              setCurrentView?.("bookings") &&
              handleSacramentTableSelect?.(d.sacrament.toLowerCase())
            }
          >
            {approvedBySacrament.map((entry, idx) => (
              <Cell
                key={`bar-${entry.sacrament}`}
                fill={CHART_COLORS[idx % CHART_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Frequency of bookings by month
  const renderMonthlyBarChart = () => {
    const dataset = stats.bookingsByMonth || monthlyFrequency;
    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={dataset}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" fontSize={isMobile ? 10 : 12} />
          <YAxis fontSize={isMobile ? 10 : 12} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count">
            {dataset.map((entry, idx) => (
              <Cell
                key={`month-${entry.month}`}
                fill={CHART_COLORS[idx % CHART_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Monthly donations
  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={safe(stats, "monthlyDonations", [])}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" fontSize={isMobile ? 10 : 12} />
        <YAxis fontSize={isMobile ? 10 : 12} />
        <Tooltip formatter={(val) => pesoFormat(val)} />
        <Line type="monotone" dataKey="amount" stroke={CHART_COLORS[1]} />
      </LineChart>
    </ResponsiveContainer>
  );

  /** ---------- Render ---------- **/
  return (
    <div style={{ padding: 16 }}>
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: "Total Users", value: safe(stats, "totalUsers") },
          { label: "Total Documents", value: safe(stats, "totalDocuments") },
          { label: "Completed Bookings", value: approvedCount },
          { label: "Total Admins", value: safe(stats, "totalAdmins") },
          { label: "Total Priests", value: safe(stats, "totalPriests") },
          { label: "Available Priests", value: safe(stats, "availablePriests") },
          {
            label: "Most Common Sacrament",
            value: mostCommonSacrament,
          },
        ].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Card elevation={3}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {item.label}
                </Typography>
                <Typography variant="h4">{item.value ?? "—"}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pending Bookings Button */}
      <Button
        variant="contained"
        color={pendingCount > 0 ? "error" : "primary"}
        onClick={() =>
          pendingCount > 0 ? onShowPending?.() : setOpenNoPending(true)
        }
        sx={{ mb: 3 }}
      >
        Show Pending Bookings ({pendingCount})
      </Button>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Data Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Completed Bookings by Sacrament */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                Completed Bookings by Sacrament
              </Typography>
              {renderCompletedBarChart()}
              <BarChartLegend
                data={ALL_SACRAMENTS.map((sacrament) => ({
                  key: sacrament,
                  name: sacrament,
                  value:
                    (stats?.approvedBySacrament || []).find(
                      (item) => item.sacrament === sacrament
                    )?.count || 0,
                }))}
                colors={CHART_COLORS}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Frequency of Bookings by Month */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                Frequency of Bookings by Month
              </Typography>
              {renderMonthlyBarChart()}
              <BarChartLegend
                data={(stats.bookingsByMonth || monthlyFrequency).map((m) => ({
                  name: m.month,
                  value: m.count,
                }))}
                colors={CHART_COLORS}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Donations */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                Monthly Donations (Trend)
              </Typography>
              {renderLineChart()}
            </CardContent>
          </Card>
        </Grid>

        {/* Donation Summary */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                Donation Summary
              </Typography>
              <table className="min-w-full border-separate border-spacing-0 rounded-2xl overflow-hidden shadow-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 md:px-4 py-2 border text-left text-xs md:text-sm">
                      Donation Period
                    </th>
                    <th className="px-2 md:px-4 py-2 border text-xs md:text-sm">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: "Today",
                      value: pesoFormat(safe(stats, "donationSummary.today", 0)),
                    },
                    {
                      label: "Past 7 Days",
                      value: pesoFormat(
                        safe(stats, "donationSummary.lastWeek", 0)
                      ),
                    },
                    {
                      label: "This Month",
                      value: pesoFormat(
                        safe(stats, "donationSummary.thisMonth", 0)
                      ),
                    },
                    {
                      label: "Monthly Average",
                      value: pesoFormat(safe(stats, "donationSummary.average", 0)),
                    },
                    {
                      label: "Year‑to‑Date Total",
                      value: pesoFormat(
                        safe(stats, "donationSummary.yearTotal", 0)
                      ),
                    },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="px-2 md:px-4 py-2 border text-left text-xs md:text-sm">
                        {row.label}
                      </td>
                      <td className="px-2 md:px-4 py-2 border font-bold text-xs md:text-sm">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* No Pending Bookings Dialog */}
      <Dialog
        open={openNoPending}
        onClose={() => setOpenNoPending(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Pending Bookings
          <IconButton
            aria-label="close"
            onClick={() => setOpenNoPending(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography>No pending bookings at the moment.</Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataAnalyticsDashboard;