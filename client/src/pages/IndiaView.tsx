import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Building2, TrendingUp, MapPin, Briefcase, Users, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface IndiaCompany {
  id: number;
  name: string;
  batch: string;
  status: string;
  industry: string;
  all_locations: string;
  one_liner: string;
  top_company: boolean;
  isHiring: boolean;
  team_size: number | null;
  website: string;
  url: string;
}

interface IndiaStats {
  total: number;
  active: number;
  acquired: number;
  inactive: number;
  hiring: number;
  by_city: Record<string, number>;
  by_industry: Record<string, number>;
  by_year: Record<string, number>;
  top_companies: IndiaCompany[];
}

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

export default function IndiaView() {
  const [companies, setCompanies] = useState<IndiaCompany[]>([]);
  const [stats, setStats] = useState<IndiaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchIndiaData = async () => {
      try {
        // Fetch all companies and filter for India
        const response = await fetch('https://yc-oss.github.io/api/companies/all.json');
        const allCompanies = await response.json();
        
        // Filter for India companies
        const indiaCompanies = allCompanies.filter((c: IndiaCompany) => 
          c.all_locations?.includes('India') || 
          (c as any).regions?.includes('India')
        );

        setCompanies(indiaCompanies);

        // Calculate statistics
        const stats: IndiaStats = {
          total: indiaCompanies.length,
          active: indiaCompanies.filter((c: IndiaCompany) => c.status === 'Active').length,
          acquired: indiaCompanies.filter((c: IndiaCompany) => c.status === 'Acquired').length,
          inactive: indiaCompanies.filter((c: IndiaCompany) => c.status === 'Inactive').length,
          hiring: indiaCompanies.filter((c: IndiaCompany) => c.isHiring).length,
          by_city: {},
          by_industry: {},
          by_year: {},
          top_companies: indiaCompanies.filter((c: IndiaCompany) => c.top_company),
        };

        // Count by city
        indiaCompanies.forEach((c: IndiaCompany) => {
          if (c.all_locations) {
            const city = c.all_locations.split(',')[0].trim();
            stats.by_city[city] = (stats.by_city[city] || 0) + 1;
          }
        });

        // Count by industry
        indiaCompanies.forEach((c: IndiaCompany) => {
          const industry = c.industry || 'Unknown';
          stats.by_industry[industry] = (stats.by_industry[industry] || 0) + 1;
        });

        // Count by year
        indiaCompanies.forEach((c: IndiaCompany) => {
          const match = c.batch?.match(/\d{4}/);
          if (match) {
            const year = match[0];
            stats.by_year[year] = (stats.by_year[year] || 0) + 1;
          }
        });

        setStats(stats);
        setLastUpdated(new Date().toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }));
      } catch (error) {
        console.error('Error fetching India data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndiaData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading India dashboard...</p>
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

  // Prepare chart data
  const cityData = Object.entries(stats.by_city)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([city, count]) => ({ city, count }));

  const industryData = Object.entries(stats.by_industry)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([industry, count]) => ({ industry, count }));

  const yearData = Object.entries(stats.by_year)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .filter(([year]) => parseInt(year) >= 2015)
    .map(([year, count]) => ({ year, count }));

  const statusData = [
    { name: 'Active', value: stats.active },
    { name: 'Acquired', value: stats.acquired },
    { name: 'Inactive', value: stats.inactive },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold">🇮🇳 YC Companies in India</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Comprehensive analytics of Y Combinator-backed startups in India
        </p>
        {lastUpdated && (
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {lastUpdated}
          </p>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all batches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((stats.active / stats.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acquired</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{stats.acquired}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((stats.acquired / stats.total) * 100).toFixed(1)}% exit rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Hiring</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.hiring}</div>
            <p className="text-xs text-muted-foreground mt-1">Open positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Growth Trajectory (2015-2025)</CardTitle>
            <CardDescription>Number of Indian companies per year</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Line type="monotone" dataKey="count" name="Companies" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Company Status Distribution</CardTitle>
            <CardDescription>Active, Acquired, and Inactive companies</CardDescription>
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
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cities */}
        <Card>
          <CardHeader>
            <CardTitle>Top Cities</CardTitle>
            <CardDescription>Geographic distribution across India</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={cityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="city" type="category" width={100} stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Industries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Industries</CardTitle>
            <CardDescription>Most popular sectors in India</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={industryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="industry" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Notable Companies */}
      {stats.top_companies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🌟 Notable Indian YC Companies</CardTitle>
            <CardDescription>Top companies that have made significant impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.top_companies.map((company) => (
                <div key={company.id} className="border border-border rounded-lg p-4 hover:border-primary transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{company.name}</h3>
                      <Badge variant="outline" className="mt-1">{company.batch}</Badge>
                    </div>
                    {company.isHiring && (
                      <Badge className="bg-green-500">Hiring</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{company.one_liner}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{company.all_locations}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Key Insights</CardTitle>
          <CardDescription>Notable trends and statistics about Indian YC companies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold mb-1">Bengaluru Dominance</h4>
              <p className="text-sm text-muted-foreground">
                Bengaluru hosts {cityData[0]?.count || 0} companies ({((cityData[0]?.count || 0) / stats.total * 100).toFixed(1)}% of total), 
                cementing its position as India's startup capital.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold mb-1">Fintech & B2B Leadership</h4>
              <p className="text-sm text-muted-foreground">
                B2B ({stats.by_industry['B2B'] || 0}) and Fintech ({stats.by_industry['Fintech'] || 0}) companies 
                dominate the Indian YC ecosystem, reflecting India's digital transformation.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold mb-1">Strong Success Rate</h4>
              <p className="text-sm text-muted-foreground">
                {((stats.active / stats.total) * 100).toFixed(1)}% of companies remain active, with {stats.acquired} successful acquisitions, 
                demonstrating strong market validation and growth potential.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold mb-1">Hiring Momentum</h4>
              <p className="text-sm text-muted-foreground">
                {stats.hiring} companies ({((stats.hiring / stats.total) * 100).toFixed(1)}%) are actively hiring, 
                indicating robust growth and expansion across the ecosystem.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            All Indian YC Companies
          </CardTitle>
          <CardDescription>
            Browse all {stats.total} Y Combinator-backed startups in India
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Company</th>
                    <th className="p-3 text-left font-medium">Batch</th>
                    <th className="p-3 text-left font-medium">Industry</th>
                    <th className="p-3 text-left font-medium">Location</th>
                    <th className="p-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company, index) => (
                    <tr key={company.id || index} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div>
                          <a 
                            href={company.website || company.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium hover:text-orange-500 transition-colors"
                          >
                            {company.name}
                          </a>
                          {company.one_liner && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {company.one_liner}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">
                          {company.batch}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {company.industry || 'N/A'}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {company.all_locations}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={company.status === 'Active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {company.status}
                          </Badge>
                          {company.isHiring && (
                            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                              Hiring
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 text-center text-sm text-muted-foreground border-t bg-muted/30">
              Showing all {companies.length} companies • Scroll to view more
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
