SELECT 'aspnet_Users' as TableName, COUNT(*) as RowCount FROM aspnet_Users
UNION ALL
SELECT 'plant', COUNT(*) FROM plant
UNION ALL
SELECT 'audits', COUNT(*) FROM audits
UNION ALL
SELECT 'audit_details', COUNT(*) FROM audit_details
UNION ALL
SELECT 'actions', COUNT(*) FROM actions
UNION ALL
SELECT 'schedules', COUNT(*) FROM schedules
UNION ALL
SELECT 'setts_action_status', COUNT(*) FROM setts_action_status
UNION ALL
SELECT 'setts_audit_types', COUNT(*) FROM setts_audit_types
UNION ALL
SELECT 'setts_audit_question_groups', COUNT(*) FROM setts_audit_question_groups;
