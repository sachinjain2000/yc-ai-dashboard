import { useState, useEffect, useMemo } from "react";
import { fetchDashboardData } from "@/services/ycApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Company {
  name: string;
  batch: string;
  year: number;
  status: string;
  location: string | null;
  country: string | null;
}

const ITEMS_PER_PAGE = 10;

export default function RawData() {
  const [rawData, setRawData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch real-time data from YC API
        const { companies } = await fetchDashboardData();
        setRawData(companies);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchTerm) return rawData;
    const term = searchTerm.toLowerCase();
    return rawData.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.batch.toLowerCase().includes(term) ||
        (item.country?.toLowerCase() || '').includes(term) ||
        item.status.toLowerCase().includes(term) ||
        (item.location?.toLowerCase() || '').includes(term)
    );
  }, [rawData, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage]);

  const getStatusVariant = (status: string) => {
    return status === 'Active' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">YC AI Companies Data</h1>
        <p className="text-muted-foreground mt-1">Browse and search all AI startups</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Directory</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, batch, country, location, or status..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                          No results found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-orange-500 text-orange-500">
                              {item.batch}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.year}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(item.status)} className={item.status === 'Active' ? 'bg-green-600 hover:bg-green-700' : ''}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.country || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate" title={item.location || 'N/A'}>{item.location || 'N/A'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of{" "}
                  {filteredData.length} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

