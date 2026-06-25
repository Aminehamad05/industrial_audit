// src/modules/audits/dto/create-audit.dto.ts
export interface CreateAuditDto {
  auditType: string;
  auditTypeName: string;
  auditTarget: string;
  auditTargetArea?: string;
  auditTargetSubarea?: string;
  auditTargetSection?: string;
  auditShiftName?: string;
  auditorId: string;
  auditorLogin: string;
  auditorFullName: string;
  supervisorId?: string;
  supervisorName?: string;
  supervisorLogin?: string;
  startDate: string; // ISO date string
  plantId: number;
  matricule?: string;
  scheduleId?: number;
}