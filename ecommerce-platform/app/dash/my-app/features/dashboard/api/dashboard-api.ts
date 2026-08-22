import { adminFetch } from '../../../lib/admin-api';
import { DashboardOverview, DashboardOverviewApiResponse } from '../types/dashboard.types';

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const response = await adminFetch<DashboardOverviewApiResponse>('/admin/dashboard/overview');
  return response.data;
}
