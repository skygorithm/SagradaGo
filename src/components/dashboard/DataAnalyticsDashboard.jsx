// src/components/dashboard/DataAnalyticsDashboard.jsx

import React, { useMemo, useState, useEffect } from "react";
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
  Tooltip,
  Box,
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
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
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

const safe = (obj, path, fallback = "—") =>
  path.split(".").reduce((acc, key) => acc?.[key], obj) ?? fallback;

const pesoFormat = (val) =>
  isNaN(val) || val === null || val === undefined
    ? "₱0.00"
    : new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
      }).format(val);

const isCompletedStatus = (status) => {
  if (!status) return false;
  const statusLower = String(status).toLowerCase().trim();
  return ["completed", "approved", "confirmed", "done", "finished", "success"].includes(statusLower);
};

const isPendingStatus = (status) => {
  if (!status) return false;
  const statusLower = String(status).toLowerCase().trim();
  return ["pending", "waiting", "submitted", "review"].includes(statusLower);
};

const DataAnalyticsDashboard = ({
  stats = {},
  allBookings = [],
  isMobile = false,
  setCurrentView,
  handleSacramentTableSelect,
  onShowPending,
  setSacramentActiveFilters, 
}) => {
  const [openNoPending, setOpenNoPending] = useState(false);

  useEffect(() => {
    console.log("Dashboard Debug Info:");
    console.log("Stats:", stats);
    console.log("All bookings:", allBookings?.length || 0);
  }, [stats, allBookings]);

  const {
    completedCount,
    pendingCount,
    mostCommonSacrament,
    monthlyFrequency,
  } = useMemo(() => {
    const bookingsArray = Array.isArray(allBookings) ? allBookings : [];

    const completed = bookingsArray.filter((b) =>
      isCompletedStatus(b.booking_status)
    );
    const pending = bookingsArray.filter((b) =>
      isPendingStatus(b.booking_status)
    );

    const sacCounts = {};
    bookingsArray.forEach((b) => {
      if (b.booking_sacrament) {
        sacCounts[b.booking_sacrament] =
          (sacCounts[b.booking_sacrament] || 0) + 1;
      }
    });
    const mostCommon =
      Object.entries(sacCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    // Filter bookings to current year only
    const currentYear = new Date().getFullYear();
    const monthlyCounts = {};
    bookingsArray.forEach((b) => {
      if (!b.booking_date) return;
      const d = new Date(b.booking_date);
      if (!isNaN(d.getTime()) && d.getFullYear() === currentYear) {
        const month = monthNames[d.getMonth()];
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
      }
    });
    const monthlyArray = monthNames.map((m) => ({
      month: m,
      count: monthlyCounts[m] || 0,
    }));

    return {
      completedCount: stats.completedBookings ?? completed.length,
      pendingCount: stats.pendingBookings ?? pending.length,
      mostCommonSacrament: stats.mostCommonSacrament || mostCommon,
      monthlyFrequency: monthlyArray,
    };
  }, [allBookings, stats]);

  const completedBySacramentData = useMemo(() => {
    const bookingsArray = Array.isArray(allBookings) ? allBookings : [];

    return ALL_SACRAMENTS.map((sacrament) => {
      const computedCount = bookingsArray.filter(
        (b) =>
          isCompletedStatus(b.booking_status) &&
          b.booking_sacrament === sacrament
      ).length;

      const statItem = stats.completedBySacrament?.find(
        (item) => item.sacrament === sacrament
      );

      return {
        sacrament,
        // Truncate long sacrament names for better display
        displayName: sacrament.length > 12 ? `${sacrament.substring(0, 10)}...` : sacrament,
        count: statItem?.count ?? computedCount,
      };
    });
  }, [allBookings, stats.completedBySacrament]);

  const monthlyData = useMemo(() => {
    // Force recalculation from allBookings to ensure current year only
    const bookingsArray = Array.isArray(allBookings) ? allBookings : [];
    const currentYear = new Date().getFullYear(); // Should be 2025
    
    // Recalculate monthly counts for current year only
    const currentYearMonthlyCounts = {};
    bookingsArray.forEach((b) => {
      if (!b.booking_date) return;
      const d = new Date(b.booking_date);
      if (!isNaN(d.getTime())) {
        const bookingYear = d.getFullYear();
        
        // Only count if it's exactly the current year (2025)
        if (bookingYear === currentYear) {
          const month = monthNames[d.getMonth()];
          currentYearMonthlyCounts[month] = (currentYearMonthlyCounts[month] || 0) + 1;
        }
      }
    });
    
    // Return only current year data - ignore any stats.bookingsByMonth completely
    return monthNames.map((m) => ({
      month: m,
      count: currentYearMonthlyCounts[m] || 0,
    }));
  }, [allBookings]);

  const monthlyDonationsData = useMemo(() => {
    if (Array.isArray(stats.monthlyDonations) && stats.monthlyDonations.length > 0) {
      return stats.monthlyDonations.map((d) => ({
        month: d.month,
        amount: typeof d.amount === "number" ? d.amount : 0,
      }));
    }
    return monthNames.map((m) => ({ month: m, amount: 0 }));
  }, [stats.monthlyDonations]);

  const donationSummaryData = useMemo(() => {
    return stats.donationSummary || {
      today: 0,
      lastWeek: 0,
      thisMonth: 0,
      average: 0,
      yearTotal: 0,
    };
  }, [stats.donationSummary]);

  // Updated function to handle showing pending bookings with filter
  const handleShowPending = () => {
    if (pendingCount > 0) {
      // Just use the prop - no need for fallback logic
      onShowPending?.();
    } else {
      setOpenNoPending(true);
    }
  };

  const renderCompletedBarChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={completedBySacramentData}
          margin={{ 
            top: 20, 
            right: 30, 
            left: 20, 
            bottom: isMobile ? 100 : 80 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="displayName"
            fontSize={isMobile ? 9 : 11}
            angle={-45}
            textAnchor="end"
            height={isMobile ? 100 : 80}
            interval={0}
            tick={{ fontSize: isMobile ? 9 : 11 }}
          />
          <YAxis 
            fontSize={isMobile ? 10 : 12} 
            allowDecimals={false}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <RechartsTooltip 
            formatter={(value, name, props) => [value, props.payload.sacrament]}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0) {
                return payload[0].payload.sacrament;
              }
              return label;
            }}
          />
          <Bar
            dataKey="count"
            onClick={(data) => {
              if (data?.sacrament) {
                setCurrentView?.("bookings");
                handleSacramentTableSelect?.(data.sacrament.toLowerCase());
              }
            }}
            cursor="pointer"
          >
            {completedBySacramentData.map((entry, idx) => (
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

  const renderMonthlyBarChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          key={`monthly-chart-${JSON.stringify(monthlyData)}`}
          data={monthlyData}
          margin={{ 
            top: 20, 
            right: 30, 
            left: 20, 
            bottom: 20 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            fontSize={isMobile ? 10 : 12}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <YAxis 
            fontSize={isMobile ? 10 : 12} 
            allowDecimals={false}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <RechartsTooltip />
          <Bar dataKey="count">
            {monthlyData.map((entry, idx) => (
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

  const renderLineChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart 
          data={monthlyDonationsData}
          margin={{ 
            top: 20, 
            right: 30, 
            left: 20, 
            bottom: 20 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            fontSize={isMobile ? 10 : 12}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <YAxis 
            fontSize={isMobile ? 10 : 12}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <RechartsTooltip formatter={(val) => pesoFormat(val)} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke={CHART_COLORS[1]}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS[1], r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Statistics Cards Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="h6">
                Total Users
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalUsers ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="h6">
                Total Documents
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalDocuments ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="h6">
                Completed Bookings
              </Typography>
              <Typography variant="h4" component="div">
                {completedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="h6">
                Total Admins
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalAdmins ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="h6">
                Total Priests
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalPriests ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="h6">
                Available Priests
              </Typography>
              <Typography variant="h4" component="div">
                {stats.availablePriests ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="h6">
                Most Common Sacrament
              </Typography>
              <Typography variant="h4" component="div">
                {mostCommonSacrament}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="h6">
                Pending Bookings
              </Typography>
              <Typography variant="h4" component="div" color="error">
                {pendingCount}
              </Typography>
              {pendingCount > 0 && (
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  sx={{ mt: 1 }}
                  onClick={handleShowPending}
                >
                  View Pending ({pendingCount})
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                Completed Bookings by Sacrament
              </Typography>
              {renderCompletedBarChart()}
              <BarChartLegend
                data={completedBySacramentData.map(item => ({
                  ...item,
                  sacrament: item.sacrament
                }))}
                colors={CHART_COLORS}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                Frequency of Bookings by Month ({new Date().getFullYear()})
              </Typography>
              {renderMonthlyBarChart()}
              <BarChartLegend data={monthlyData} colors={CHART_COLORS} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                Monthly Donations (Trend)
              </Typography>
              {renderLineChart()}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                Donation Summary
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'separate', 
                  borderSpacing: 0, 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
                }}>
                  <thead style={{ backgroundColor: '#f5f5f5' }}>
                    <tr>
                      <th style={{ 
                        padding: '8px 16px', 
                        border: '1px solid #ddd', 
                        textAlign: 'left', 
                        fontSize: isMobile ? '12px' : '14px' 
                      }}>
                        Donation Period
                      </th>
                      <th style={{ 
                        padding: '8px 16px', 
                        border: '1px solid #ddd', 
                        textAlign: 'right', 
                        fontSize: isMobile ? '12px' : '14px' 
                      }}>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Today", value: pesoFormat(donationSummaryData.today) },
                      { label: "Past 7 Days", value: pesoFormat(donationSummaryData.lastWeek) },
                      { label: "This Month", value: pesoFormat(donationSummaryData.thisMonth) },
                      { label: "Monthly Average", value: pesoFormat(donationSummaryData.average) },
                      { label: "Year-to-Date Total", value: pesoFormat(donationSummaryData.yearTotal) },
                    ].map((row, index) => (
                      <tr key={row.label} style={{ 
                        backgroundColor: index % 2 === 0 ? '#fafafa' : 'white' 
                      }}>
                        <td style={{ 
                          padding: '8px 16px', 
                          border: '1px solid #ddd', 
                          textAlign: 'left', 
                          fontSize: isMobile ? '12px' : '14px' 
                        }}>
                          {row.label}
                        </td>
                        <td style={{ 
                          padding: '8px 16px', 
                          border: '1px solid #ddd', 
                          fontWeight: 'bold', 
                          textAlign: 'right', 
                          fontSize: isMobile ? '12px' : '14px' 
                        }}>
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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