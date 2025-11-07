import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Building2, TrendingUp, CheckCircle, XCircle } from "lucide-react";

interface Company {
  name: string;
  batch: string;
  year: number;
  status: string;
  location: string | null;
  country: string | null;
}

interface Stats {
  total_companies: number;
  by_year: Record<string, number>;
  by_country: Record<string, number>;
  by_status: Record<string, number>;
}

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesRes, statsRes] = await Promise.all([
          fetch(import.meta.env.BASE_URL + 'yc_ai_companies.json'),
          fetch(import.meta.env.BASE_URL + 'yc_ai_stats.json')
        ]);
        
        const companiesData = await companiesRes.json();
        const statsData = await statsRes.json();
        
        setCompanies(companiesData);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Failed to load data</p>
      </div>
    );
  }

  // Prepare data for charts
  const countryData = Object.entries(stats.by_country)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const yearData = Object.entries(stats.by_year)
    .map(([year, count]) => ({ year, count }))
    .filter(item => parseInt(item.year) >= 2020)
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));

  const statusData = Object.entries(stats.by_status)
    .map(([name, value]) => ({ name, value }));

  // Calculate growth rate for last 5 years
  const last5Years = Object.entries(stats.by_year)
    .filter(([year]) => parseInt(year) >= 2020)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Y Combinator AI Startups Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive analytics of AI startups funded by Y Combinator
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total AI Startups</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.total_companies}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all batches
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Companies</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.by_status.Active || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((stats.by_status.Active / stats.total_companies) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Acquired</CardTitle>
            <XCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.by_status.Acquired || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((stats.by_status.Acquired / stats.total_companies) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">2025 Batch</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.by_year['2025'] || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Latest cohort
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">AI Startups by Year (2020-2025)</CardTitle>
            <CardDescription>Number of AI companies accepted per year</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  name="Companies"
                  dot={{ fill: '#f97316', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Company Status Distribution</CardTitle>
            <CardDescription>Active vs Acquired companies</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Top 10 Countries by AI Startups</CardTitle>
          <CardDescription>Geographic distribution of YC AI companies</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={countryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" width={120} stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }}
              />
              <Legend />
              <Bar dataKey="value" fill="#f97316" name="Companies" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Key Insights</CardTitle>
          <CardDescription>Notable trends and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
              <div>
                <p className="text-sm font-medium text-card-foreground">Geographic Concentration</p>
                <p className="text-sm text-muted-foreground">
                  The United States dominates with {stats.by_country['United States']} companies ({((stats.by_country['United States'] / stats.total_companies) * 100).toFixed(1)}% of total), 
                  reflecting YC's strong presence in the US tech ecosystem.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
              <div>
                <p className="text-sm font-medium text-card-foreground">Recent Growth Trend</p>
                <p className="text-sm text-muted-foreground">
                  2023 saw the highest number of AI startups ({stats.by_year['2023']}) in the last 5 years, 
                  showing peak interest in AI ventures during that period.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
              <div>
                <p className="text-sm font-medium text-card-foreground">Success Rate</p>
                <p className="text-sm text-muted-foreground">
                  {((stats.by_status.Active / stats.total_companies) * 100).toFixed(1)}% of companies remain active, 
                  while {stats.by_status.Acquired} have been acquired, demonstrating strong market validation.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

