/**
 * Y Combinator API Service
 * Fetches real-time data from the unofficial YC API
 * API Source: https://github.com/yc-oss/api
 */

const YC_API_BASE = 'https://yc-oss.github.io/api';

export interface YCCompany {
  id: number;
  name: string;
  slug: string;
  former_names: string[];
  small_logo_thumb_url: string;
  website: string;
  all_locations: string;
  long_description: string;
  one_liner: string;
  team_size: number;
  industry: string;
  subindustry: string;
  launched_at: number;
  tags: string[];
  tags_highlighted: string[];
  top_company: boolean;
  isHiring: boolean;
  nonprofit: boolean;
  batch: string;
  status: string;
  industries: string[];
  regions: string[];
  stage: string;
  app_video_public: boolean;
  demo_day_video_public: boolean;
  app_answers: any;
  question_answers: boolean;
  url: string;
  api: string;
}

export interface CompanyStats {
  total_companies: number;
  by_year: Record<string, number>;
  by_country: Record<string, number>;
  by_status: Record<string, number>;
}

export interface SimplifiedCompany {
  name: string;
  batch: string;
  year: number;
  status: string;
  location: string | null;
  country: string | null;
}

/**
 * Fetch all AI-tagged companies from YC API
 */
export async function fetchAICompanies(): Promise<YCCompany[]> {
  try {
    const response = await fetch(`${YC_API_BASE}/tags/artificial-intelligence.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching AI companies:', error);
    throw error;
  }
}

/**
 * Extract year from batch string (e.g., "Summer 2023" -> 2023)
 */
function extractYear(batch: string): number {
  const match = batch.match(/\d{4}/);
  return match ? parseInt(match[0]) : new Date().getFullYear();
}

/**
 * Extract country from all_locations string
 */
function extractCountry(location: string): string | null {
  if (!location) return null;
  
  // Split by comma and get the last part (usually country)
  const parts = location.split(',').map(p => p.trim());
  const lastPart = parts[parts.length - 1];
  
  // Common country mappings
  const countryMappings: Record<string, string> = {
    'USA': 'United States',
    'US': 'United States',
    'UK': 'United Kingdom',
    'UAE': 'United Arab Emirates',
  };
  
  return countryMappings[lastPart] || lastPart;
}

/**
 * Process raw YC companies into simplified format
 */
export function processCompanies(companies: YCCompany[]): SimplifiedCompany[] {
  return companies.map(company => ({
    name: company.name,
    batch: company.batch,
    year: extractYear(company.batch),
    status: company.status,
    location: company.all_locations,
    country: extractCountry(company.all_locations),
  }));
}

/**
 * Calculate statistics from company data
 */
export function calculateStats(companies: SimplifiedCompany[]): CompanyStats {
  const stats: CompanyStats = {
    total_companies: companies.length,
    by_year: {},
    by_country: {},
    by_status: {},
  };

  companies.forEach(company => {
    // Count by year
    const year = company.year.toString();
    stats.by_year[year] = (stats.by_year[year] || 0) + 1;

    // Count by country
    const country = company.country || 'Unknown';
    stats.by_country[country] = (stats.by_country[country] || 0) + 1;

    // Count by status
    const status = company.status || 'Unknown';
    stats.by_status[status] = (stats.by_status[status] || 0) + 1;
  });

  return stats;
}

/**
 * Fetch and process all AI company data
 */
export async function fetchDashboardData(): Promise<{
  companies: SimplifiedCompany[];
  stats: CompanyStats;
}> {
  const rawCompanies = await fetchAICompanies();
  const companies = processCompanies(rawCompanies);
  const stats = calculateStats(companies);
  
  return { companies, stats };
}

/**
 * Fetch API metadata
 */
export async function fetchMetadata() {
  try {
    const response = await fetch(`${YC_API_BASE}/meta.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
  }
}
