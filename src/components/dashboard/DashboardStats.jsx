import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis, Tooltip } from 'recharts';
import { BarChartLegend, PieChartLegend } from '../ChartLegends';

const CHART_COLORS = ['#0088FE', '#FF6B6B', '#FFBB28', '#FF8042', '#8884D8', '#00C49F'];

const DashboardStats = ({ stats, onSacramentSelect }) => {
  return (
    <>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Users</Typography>
              <Typography variant="h4">{stats.totalUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Documents</Typography>
              <Typography variant="h4">{stats.totalDocuments}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Pending Bookings</Typography>
              <Typography variant="h4">{stats.pendingBookings}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Approved Bookings</Typography>
              <Typography variant="h4">{stats.approvedBookings}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Admins</Typography>
              <Typography variant="h4">{stats.totalAdmins}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Priests</Typography>
              <Typography variant="h4">{stats.totalPriests}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Available Priests</Typography>
              <Typography variant="h4">{stats.availablePriests}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Most Common Sacrament</Typography>
              <Typography variant="h4">{stats.mostCommonSacraments}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mb: 2 }}>Data Analytics</Typography>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-5">
        {/* Gender Pie Chart */}
        <div className="bg-white p-4 rounded-2xl shadow text-center">
          <h3 className="text-xl font-semibold mb-2">User Gender Distribution</h3>
          <PieChart width={250} height={250} className='mx-auto'>
            <Pie
              data={stats.genderCounts}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
            >
              {stats.genderCounts.map((_, idx) => (
                <Cell key={`${_.name}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          <PieChartLegend data={stats.genderCounts} colors={CHART_COLORS} />
        </div>

        {/* Pending Bookings by Sacrament */}
        <div className="bg-white p-4 rounded-2xl shadow text-center">
          <h3 className="text-xl font-semibold mb-2">Pending Bookings by Sacrament</h3>
          <BarChart width={250} height={250} data={stats.pendingBySacrament} className='mx-auto'>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sacrament" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" onClick={(data) => {
              if (data && data.sacrament && onSacramentSelect) {
                onSacramentSelect(data.sacrament.toLowerCase());
              }
            }} cursor="pointer">
              {stats.pendingBySacrament.map((entry, index) => (
                <Cell key={`cell-${entry.sacrament}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
          <BarChartLegend data={stats.pendingBySacrament} colors={CHART_COLORS} />
        </div>

        {/* Monthly Donations Line Chart */}
        <div className="bg-white p-4 rounded-2xl shadow text-center">
          <h3 className="text-xl font-semibold mb-2">Monthly Donations (Last 6 Months)</h3>
          <LineChart width={250} height={250} data={stats.monthlyDonations} className='mx-auto'>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" />
          </LineChart>
        </div>

        {/* Donation Summary */}
        <div className='bg-white p-4 rounded-2xl shadow text-center'>
          <h3 className="text-xl font-semibold mb-2">Donation Summary</h3>
          <div className='overflow-x-auto'>
            <table className='min-w-full border-separate border-spacing-0 rounded-2xl overflow-hidden shadow-sm'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className="px-4 py-2 border text-left">Donation Period</th>
                  <th className="px-4 py-2 border">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border text-left">Today</td>
                  <td className="px-4 py-2 border font-bold">{stats.donationSummary.today}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border text-left">Past 7 Days</td>
                  <td className="px-4 py-2 border font-bold">{stats.donationSummary.lastWeek}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border text-left">This Month</td>
                  <td className="px-4 py-2 border font-bold">{stats.donationSummary.thisMonth}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border text-left">Monthly Average</td>
                  <td className="px-4 py-2 border font-bold">{stats.donationSummary.average}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border text-left">Year-to-Date Total</td>
                  <td className="px-4 py-2 border font-bold">{stats.donationSummary.yearTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardStats;