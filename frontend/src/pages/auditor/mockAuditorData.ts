import type { Severity } from '../../components/dashboard/SeverityBadge';
import type { FindingStatus } from '../../components/dashboard/FindingStatusBadge';

export interface Audit {
  id: string;
  name: string;
  plant: string;
  type: string;
  dueDate: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  submitted: boolean;
}

export interface Finding {
  id: string;
  auditId: string;
  auditName: string;
  description: string;
  severity: Severity;
  status: FindingStatus;
}

export interface Report {
  id: string;
  title: string;
  date: string;
  auditId: string;
  auditName: string;
  status: 'Draft' | 'Submitted';
}

export interface DashboardStats {
  assigned: number;
  completed: number;
  pending: number;
  openFindings: number;
  dueToday: number;
  pendingReports: number;
}

export interface UpcomingAudit {
  id: string;
  name: string;
  dueDate: string;
  relativeDue: string;
}

export interface RecentFinding {
  id: string;
  description: string;
  severity: Severity;
}

export const mockDashboardStats: DashboardStats = {
  assigned: 8,
  completed: 3,
  pending: 5,
  openFindings: 12,
  dueToday: 2,
  pendingReports: 4,
};

export const mockUpcomingAudits: UpcomingAudit[] = [
  { id: 'a1', name: 'Line A - Process Audit', dueDate: '2026-06-25', relativeDue: 'Tomorrow' },
  { id: 'a2', name: 'Warehouse Safety Inspection', dueDate: '2026-07-01', relativeDue: 'In 7 days' },
  { id: 'a3', name: 'Line C - Quality Control', dueDate: '2026-07-10', relativeDue: '18 Aug' },
  { id: 'a4', name: 'Packaging Unit Audit', dueDate: '2026-07-15', relativeDue: '23 Aug' },
];

export const mockRecentFindings: RecentFinding[] = [
  { id: 'f1', description: 'Line A - Guard missing on conveyor belt', severity: 'High' },
  { id: 'f2', description: 'Warehouse - Fire extinguisher expired', severity: 'Critical' },
  { id: 'f3', description: 'Line C - Calibration overdue', severity: 'Medium' },
  { id: 'f4', description: 'Packaging - Labeling mismatch', severity: 'Low' },
];

export const mockAudits: Audit[] = [
  { id: 'aud-001', name: 'Line A - Process Audit', plant: 'Line A', type: 'Process', dueDate: '2026-06-25', status: 'In Progress', submitted: false },
  { id: 'aud-002', name: 'Warehouse Safety Inspection', plant: 'Warehouse', type: 'Safety', dueDate: '2026-07-01', status: 'Planned', submitted: false },
  { id: 'aud-003', name: 'Line C - Quality Control', plant: 'Line C', type: 'Quality', dueDate: '2026-07-10', status: 'Planned', submitted: false },
  { id: 'aud-004', name: 'Packaging Unit Audit', plant: 'Packaging', type: 'Internal', dueDate: '2026-06-20', status: 'Completed', submitted: false },
  { id: 'aud-005', name: 'Maintenance Log Review', plant: 'Line A', type: 'Maintenance', dueDate: '2026-06-22', status: 'Completed', submitted: true },
  { id: 'aud-006', name: 'Chemical Storage Inspection', plant: 'Warehouse', type: 'Safety', dueDate: '2026-07-05', status: 'Planned', submitted: false },
  { id: 'aud-007', name: 'Assembly Line B Audit', plant: 'Line B', type: 'Process', dueDate: '2026-06-28', status: 'In Progress', submitted: false },
  { id: 'aud-008', name: 'Environmental Compliance', plant: 'Line C', type: 'Compliance', dueDate: '2026-08-01', status: 'Planned', submitted: false },
];

export const mockFindings: Finding[] = [
  { id: 'fin-001', auditId: 'aud-001', auditName: 'Line A - Process Audit', description: 'Guard missing on conveyor belt', severity: 'High', status: 'Open' },
  { id: 'fin-002', auditId: 'aud-002', auditName: 'Warehouse Safety Inspection', description: 'Fire extinguisher expired', severity: 'Critical', status: 'Open' },
  { id: 'fin-003', auditId: 'aud-003', auditName: 'Line C - Quality Control', description: 'Calibration overdue', severity: 'Medium', status: 'In Review' },
  { id: 'fin-004', auditId: 'aud-004', auditName: 'Packaging Unit Audit', description: 'Labeling mismatch on batch #4401', severity: 'Low', status: 'Closed' },
  { id: 'fin-005', auditId: 'aud-001', auditName: 'Line A - Process Audit', description: 'No PPE signage at entrance', severity: 'Medium', status: 'Open' },
  { id: 'fin-006', auditId: 'aud-007', auditName: 'Assembly Line B Audit', description: 'Torque wrench not calibrated', severity: 'High', status: 'In Review' },
  { id: 'fin-007', auditId: 'aud-005', auditName: 'Maintenance Log Review', description: 'Missing log entries for June', severity: 'Medium', status: 'Closed' },
  { id: 'fin-008', auditId: 'aud-002', auditName: 'Warehouse Safety Inspection', description: 'Emergency exit blocked', severity: 'Critical', status: 'Open' },
];

export const mockReports: Report[] = [
  { id: 'rpt-001', title: 'Line A - Process Audit Report', date: '2026-06-20', auditId: 'aud-001', auditName: 'Line A - Process Audit', status: 'Draft' },
  { id: 'rpt-002', title: 'Warehouse Safety Inspection Report', date: '2026-06-18', auditId: 'aud-002', auditName: 'Warehouse Safety Inspection', status: 'Draft' },
  { id: 'rpt-003', title: 'Line C - Quality Control Report', date: '2026-06-15', auditId: 'aud-003', auditName: 'Line C - Quality Control', status: 'Submitted' },
  { id: 'rpt-004', title: 'Packaging Unit Audit Report', date: '2026-06-10', auditId: 'aud-004', auditName: 'Packaging Unit Audit', status: 'Submitted' },
  { id: 'rpt-005', title: 'Assembly Line B Audit Report', date: '2026-06-22', auditId: 'aud-007', auditName: 'Assembly Line B Audit', status: 'Draft' },
];
