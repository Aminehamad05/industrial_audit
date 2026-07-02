
export const translations = {
  fr: {
    // General
    hutchinson: "Hutchinson",
    system_title: "Plateforme d'audit industriel",

    // Login
    login_title: "Bienvenue",
    login_subtitle: "Accédez à la plateforme d'audit industriel",
    email: "Adresse e-mail",
    email_placeholder: "ex. amine_hamad@hutchinson.com",
    password: "Mot de passe",
    password_placeholder: "••••••••",
    remember_me: "Rester connecté",
    sign_in: "Se connecter",
    signing_in: "Connexion en cours...",
    need_account: "Vous n'avez pas de compte ?",
    register_here: "Créer un compte",

    // Register
    register_title: "Création de compte",
    register_subtitle: "Créer un nouveau compte utilisateur",
    fullname: "Nom et prénom",
    fullname_placeholder: "ex. Amine Hamad",
    username: "Identifiant",
    username_placeholder: "ex. amine_hamad",
    confirm_password: "Confirmation du mot de passe",
    confirm_password_placeholder: "Saisissez à nouveau votre mot de passe",
    role: "Fonction",
    division: "Division",
    plant: "Usine",
    plant_placeholder: "Sélectionnez une usine",
    supervisor: "Superviseur / Mentor",
    supervisor_placeholder: "Sélectionnez un superviseur",
    err_plant_required: "L'usine est requise.",
    err_supervisor_required: "Le superviseur est requis pour les auditeurs.",
    create_account: "Créer le compte",
    creating_account: "Création en cours...",
    back_to_login: "Retour à la connexion",
    password_min_placeholder: "Au moins 8 caractères",

    // Roles
    role_Auditor: "Auditeur",
    role_Supervisor: "Responsable",
    role_MaintenanceTechnician: "Technicien de maintenance",
    role_Administrator: "Administrateur",

    // Divisions
    division_FMS: "FMS (Fluid Management Systems)",
    division_AD: "A&D (Aerospace & Defense)",

    // Home / Dashboard
    welcome: "Bienvenue",
    role_label: "Fonction",
    logged_in_as: "Connecté en tant que",
    user_management: "Gestion des utilisateurs",

    all: "Tous",
    pending: "En attente",
    active: "Actifs",
    blocked: "Bloqués",
    rejected: "Refusés",

    col_name: "Nom",
    col_email: "Adresse e-mail",
    col_role: "Fonction",
    col_status: "Statut",
    col_actions: "Actions",

    btn_approve: "Valider",
    btn_reject: "Refuser",
    btn_block: "Bloquer",
    btn_unblock: "Débloquer",
    btn_delete: "Supprimer",
    assign_supervisor: "Superviseurs",
    manage_supervisors_title: "Gérer les superviseurs pour",
    no_supervisor_assigned: "Aucun superviseur assigné",
    btn_assign: "Assigner",
    btn_clear: "Effacer",
    btn_close: "Fermer",

    no_users: "Aucun utilisateur trouvé.",
    err_fetch_users: "Impossible de charger les utilisateurs.",

    // Navigation and Logout
    logout: "Déconnexion",
    tab_dashboard: "Tableau de bord",
    tab_create_audit: "Créer un audit",
    tab_user_management: "Utilisateurs",
    tab_schedules: "Plannings",
    tab_audit_results: "Résultats des audits",

    // Schedules Management
    schedules_desc: "Planifiez les audits industriels pour les usines et les auditeurs.",
    btn_create_schedule: "Nouveau planning",
    no_schedules: "Aucun planning trouvé.",
    success_delete_schedule: "Planning supprimé avec succès !",
    success_create_schedule: "Planning créé avec succès !",
    success_update_schedule: "Planning mis à jour avec succès !",
    confirm_delete: "Voulez-vous vraiment supprimer ce planning ?",
    btn_edit: "Modifier",

    // Supervisor Dashboard
    supervised_audits: "Audits supervisés",
    supervised_audits_desc: "Consultez les performances et résultats des auditeurs sous votre supervision.",
    view_details: "Voir les détails",
    audit_details: "Détails de l'audit",
    conducted_by: "Effectué par",
    result: "Résultat",
    passed: "RÉUSSI",
    failed_ko: "ÉCHOUÉ (Éliminatoire)",
    comment_title: "Commentaire de l'auditeur / superviseur",
    questionnaire_answers: "Réponses au questionnaire",
    no_answers_recorded: "Aucune réponse enregistrée pour cet audit.",

    coming_soon: "Bientôt disponible",
    coming_soon_desc:
      "Cette fonctionnalité est actuellement en cours de développement.",

    // Admin KPI
    total_audits: "Audits totaux",
    upcoming_audits: "À venir",
    in_progress_audits: "En cours",
    completed_audits: "Terminés",

    // KPI Dashboard
    kpi_pass_rate: "Taux de réussite",
    kpi_avg_score: "Score moyen",
    kpi_eliminated: "Éliminatoires (KO)",
    kpi_missed: "Manqués",
    kpi_from: "Du",
    kpi_to: "Au",
    kpi_score_trend: "Évolution des scores",
    kpi_score_trend_desc: "Score moyen mensuel et audits éliminatoires (plus sévères qu'un score bas).",
    kpi_completion_breakdown: "Répartition des statuts",
    kpi_completion_breakdown_desc: "Terminés, manqués, à venir, en cours et éliminatoires.",
    kpi_by_plant: "Performance par usine",
    kpi_by_auditor: "Performance par auditeur",
    kpi_recurring_failures: "Points de défaillance récurrents",
    kpi_recurring_failures_desc: "Questions les plus souvent répondues NOK.",
    kpi_nok_count: "Réponses NOK",
    kpi_nok_rate: "Taux NOK",
    kpi_no_data: "Aucune donnée pour ces filtres.",
    kpi_no_failures: "Aucune défaillance récurrente détectée.",
    kpi_alert_critical: "Attention critique",
    kpi_alert_warning: "Point d'attention",
    kpi_scoped_supervisor: "Vue limitée à vos auditeurs assignés",
    plant_knockout_detail: "audits éliminatoires ce mois-ci sur cette usine",
    auditor_knockout_detail: "audits éliminatoires ce mois-ci pour cet auditeur",
    auditor_low_score_detail: "score moyen faible ce mois-ci pour cet auditeur",
    plant_low_trend_detail: "tendance de score la plus faible ce mois-ci sur cette usine",
    err_fetch_kpis: "Impossible de charger les indicateurs.",

    // Calendar
    tab_calendar: "Calendrier",
    calendar_desc: "Plannings et audits réels superposés sur le même calendrier.",
    calendar_scoped_desc: "Vue limitée à votre périmètre (auditeurs assignés ou vos propres audits).",
    calendar_state_planned: "Planifié",
    calendar_state_in_progress: "En cours",
    calendar_state_done: "Terminé",
    calendar_state_failed_ko: "Échoué (KO)",
    calendar_unscheduled_audit: "Audit hors planning",
    calendar_event_detail: "Détail de l'événement",
    calendar_day_events: "Événements du jour",
    calendar_match_type: "Correspondance planning/audit",
    calendar_match_fk: "Lien direct (scheduleId)",
    calendar_match_heuristic: "Correspondance estimée (usine + auditeur + date)",
    err_fetch_calendar: "Impossible de charger le calendrier.",

    shift: "Équipe (8h)",
    select_auditor: "Choisir un auditeur",
    assign_audits_title: "Audits à assigner",
    assign_audits_desc: "Ces audits vous ont été confiés par l'administrateur. Sélectionnez un auditeur de votre équipe.",
    success_assign_auditor: "Auditeur assigné avec succès.",
    err_assign_auditor: "Impossible d'assigner l'auditeur.",
    assigning: "Assignation...",
    loading: "Chargement",
    status_missed: "Manqués",
    status_upcoming: "À venir",
    status_in_progress: "En cours",
    status_completed: "Terminés",
    status_failed: "Échoués",

    // Create Audit
    create_audit: "Créer un audit",
    create_audit_desc: "Définissez l'audit et assignez-le à un responsable. Celui-ci choisira l'auditeur.",
    create_audit_supervisor_note: "Le responsable assignera ensuite l'auditeur depuis son tableau de bord.",
    define_questions: "Définir les questions",
    define_questions_desc: "Ajoutez des groupes et des questions pour cet audit.",
    audit_type: "Type d'audit",
    audit_target: "Cible",
    auditor: "Auditeur",
    start_date: "Date de début",
    end_date: "Date de fin",
    score: "Score",
    select: "Sélectionner",
    btn_create_audit: "Créer l'audit",
    btn_save_questions: "Enregistrer les questions",
    btn_cancel: "Annuler",
    creating: "Création...",
    saving: "Enregistrement...",
    add_group: "Ajouter un groupe",
    add_question: "Ajouter une question",
    group: "Groupe",
    group_name_fr: "Nom du groupe (FR)",
    group_name_en: "Group name (EN)",
    question_fr: "Question (FR)",
    question_en: "Question (EN)",
    audit_id: "Audit",
    questions: "Questions",
    back: "Retour",
    photo_attached: "Photo jointe",
    audit_results_desc: "Consultez les résultats détaillés des audits.",

    // Errors
    err_fill_required: "Veuillez remplir tous les champs obligatoires.",
    err_create_audit: "Échec de la création de l'audit.",
    err_fill_questions: "Veuillez remplir tous les champs des questions.",
    err_save_questions: "Échec de l'enregistrement des questions.",
    err_fetch_audit: "Impossible de charger les détails de l'audit.",
    audit_created: "Audit créé avec succès !",
    questions_saved: "Questions enregistrées avec succès !",

    // Auditor tabs
    tab_my_audits: "Mes audits",
    tab_findings: "Constats",
    tab_reports: "Rapports",

    // Severity badges
    severity_Low: "Faible",
    severity_Medium: "Moyen",
    severity_High: "Élevé",
    severity_Critical: "Critique",

    // Finding status badges
    finding_status_Open: "Ouvert",
    finding_status_In_Review: "En cours",
    finding_status_Closed: "Fermé",

    // Audit status badges
    audit_status_Planned: "Planifié",
    audit_status_In_Progress: "En cours",
    audit_status_Completed: "Terminé",

    // Report status badges
    report_status_Draft: "Brouillon",
    report_status_Submitted: "Soumis",

    // Auditor columns
    col_audit: "Audit",
    col_plant: "Site",
    col_type: "Type",
    col_due_date: "Date d'échéance",
    col_id: "ID",
    col_severity: "Sévérité",
    col_report: "Rapport",
    col_date: "Date",

    // Auditor buttons
    btn_open: "Ouvrir",
    btn_continue: "Continuer",
    btn_submit: "Soumettre",
    btn_view: "Voir",
    btn_download_pdf: "Télécharger PDF",
    submitted: "Soumis",

    // Auditor page titles & descriptions
    my_audits: "Mes audits",
    my_audits_desc: "Consultez et gérez vos audits assignés.",
    findings: "Constats",
    findings_desc: "Examinez et suivez les constats d'audit.",
    reports: "Rapports",
    reports_desc: "Consultez et téléchargez les rapports d'audit.",
    assigned_audits: "Assignés",
    pending_audits: "En attente",
    open_findings: "Constats ouverts",
    recent_findings: "Constats récents",
    auditor_summary: "Vous avez {assigned} audits assignés, {dueToday} pour aujourd'hui, {openFindings} constats ouverts et {pendingReports} rapports en attente de soumission.",

    // Auditor empty states
    no_audits: "Aucun audit trouvé",
    no_audits_desc: "Aucun audit ne correspond au filtre actuel.",
    no_findings: "Aucun constat trouvé",
    no_findings_desc: "Aucun constat ne correspond au filtre actuel.",
    no_reports: "Aucun rapport trouvé",
    no_reports_desc: "Aucun rapport n'est encore disponible.",

    // Auditor error messages
    err_fetch_audits: "Impossible de charger les audits.",
    err_fetch_findings: "Impossible de charger les constats.",
    err_fetch_reports: "Impossible de charger les rapports.",

    // Statuses
    status_Pending: "En attente",
    status_Active: "Actif",
    status_Blocked: "Bloqué",
    status_Rejected: "Refusé",

    // Validation Errors
    err_email_required: "L'adresse e-mail est obligatoire.",
    err_email_invalid: "Veuillez saisir une adresse e-mail valide.",
    err_password_required: "Le mot de passe est obligatoire.",
    err_password_min:
      "Le mot de passe doit contenir au moins 8 caractères.",
    err_fullname_required: "Le nom et prénom sont obligatoires.",
    err_fullname_min:
      "Le nom et prénom doivent contenir au moins 2 caractères.",
    err_username_required: "L'identifiant est obligatoire.",
    err_username_min:
      "L'identifiant doit contenir au moins 3 caractères.",
    err_confirm_password_required:
      "Veuillez confirmer votre mot de passe.",
    err_confirm_password_mismatch:
      "Les mots de passe ne correspondent pas.",
    err_division_required:
      "Veuillez sélectionner une division.",

    // Alert & Server Errors
    success_login: "Connexion réussie.",
    success_register: "Compte créé avec succès.",

    err_connection:
      "Connexion au serveur impossible. Vérifiez que l'API est bien démarrée.",

    err_registration_failed:
      "La création du compte a échoué.",

    // Backend Mapped Errors
    "Invalid username or password":
      "Adresse e-mail ou mot de passe incorrect.",

    "Username is already taken":
      "Cet identifiant est déjà utilisé.",

    "Your account is awaiting administrator approval":
      "Votre compte est en attente de validation par un administrateur.",

    "Your account has been blocked. Contact an administrator":
      "Votre compte a été bloqué. Veuillez contacter un administrateur.",

    "Your account request was not approved":
      "Votre demande de création de compte a été refusée."
  },

  en: {
    // General
    hutchinson: "Hutchinson",
    system_title: "Industrial Audit Platform",

    // Login
    login_title: "Welcome Back",
    login_subtitle: "Access the Industrial Audit Platform",
    email: "Email Address",
    email_placeholder: "e.g. amine_hamad@hutchinson.com",
    password: "Password",
    password_placeholder: "••••••••",
    remember_me: "Keep me signed in",
    sign_in: "Sign In",
    signing_in: "Signing in...",
    need_account: "Don't have an account?",
    register_here: "Create an account",

    // Register
    register_title: "Create Account",
    register_subtitle: "Create a new user account",
    fullname: "Full Name",
    fullname_placeholder: "e.g. Amine Hamad",
    username: "Username",
    username_placeholder: "e.g. amine_hamad",
    confirm_password: "Confirm Password",
    confirm_password_placeholder: "Re-enter your password",
    role: "Position",
    division: "Division",
    plant: "Plant",
    plant_placeholder: "Select a plant",
    supervisor: "Supervisor / Mentor",
    supervisor_placeholder: "Select a supervisor",
    err_plant_required: "Plant is required.",
    err_supervisor_required: "Supervisor is required for auditors.",
    create_account: "Create Account",
    creating_account: "Creating account...",
    back_to_login: "Back to Sign In",
    password_min_placeholder: "At least 8 characters",

    // Roles
    role_Auditor: "Auditor",
    role_Supervisor: "Supervisor",
    role_MaintenanceTechnician: "Maintenance Technician",
    role_Administrator: "Administrator",

    // Divisions
    division_FMS: "FMS (Fluid Management Systems)",
    division_AD: "A&D (Aerospace & Defense)",

    // Home / Dashboard
    welcome: "Welcome",
    role_label: "Position",
    logged_in_as: "Logged in as",
    user_management: "User Management",

    all: "All",
    pending: "Pending",
    active: "Active",
    blocked: "Blocked",
    rejected: "Rejected",

    col_name: "Name",
    col_email: "Email Address",
    col_role: "Position",
    col_status: "Status",
    col_actions: "Actions",

    btn_approve: "Approve",
    btn_reject: "Reject",
    btn_block: "Block",
    btn_unblock: "Unblock",
    btn_delete: "Delete",
    assign_supervisor: "Supervisors",
    manage_supervisors_title: "Manage Supervisors for",
    no_supervisor_assigned: "No supervisor assigned",
    btn_assign: "Assign",
    btn_clear: "Clear",
    btn_close: "Close",

    no_users: "No users found.",
    err_fetch_users: "Unable to load users.",

    // Navigation and Logout
    logout: "Sign Out",
    tab_dashboard: "Dashboard",
    tab_create_audit: "Create Audit",
    tab_user_management: "Users",
    tab_schedules: "Schedules",
    tab_audit_results: "Audit Results",

    // Schedules Management
    schedules_desc: "Plan and schedule industrial audits for plants and auditors.",
    btn_create_schedule: "New Schedule",
    no_schedules: "No schedules planned.",
    success_delete_schedule: "Schedule deleted successfully!",
    success_create_schedule: "Schedule created successfully!",
    success_update_schedule: "Schedule updated successfully!",
    confirm_delete: "Are you sure you want to delete this schedule?",
    btn_edit: "Edit",

    // Supervisor Dashboard
    supervised_audits: "Supervised Audits",
    supervised_audits_desc: "Review performance and results for auditors under your supervision.",
    view_details: "View Details",
    audit_details: "Audit Details",
    conducted_by: "Conducted by",
    result: "Result",
    passed: "PASSED",
    failed_ko: "FAILED (Knockout)",
    comment_title: "Supervisor/Auditor Comment",
    questionnaire_answers: "Questionnaire Answers",
    no_answers_recorded: "No answers recorded for this audit.",

    coming_soon: "Coming Soon",
    coming_soon_desc:
      "This feature is currently under development.",

    // Admin KPI
    total_audits: "Total Audits",
    upcoming_audits: "Upcoming",
    in_progress_audits: "In Progress",
    completed_audits: "Completed",

    // KPI Dashboard
    kpi_pass_rate: "Pass rate",
    kpi_avg_score: "Average score",
    kpi_eliminated: "Knockout failures",
    kpi_missed: "Missed",
    kpi_from: "From",
    kpi_to: "To",
    kpi_score_trend: "Score trend",
    kpi_score_trend_desc: "Monthly average score with knockout failures shown separately (more severe than a low score).",
    kpi_completion_breakdown: "Completion breakdown",
    kpi_completion_breakdown_desc: "Completed, missed, upcoming, in progress, and knockout failures.",
    kpi_by_plant: "Performance by plant",
    kpi_by_auditor: "Performance by auditor",
    kpi_recurring_failures: "Recurring failure points",
    kpi_recurring_failures_desc: "Questions most often answered NOK across audits.",
    kpi_nok_count: "NOK answers",
    kpi_nok_rate: "NOK rate",
    kpi_no_data: "No data for these filters.",
    kpi_no_failures: "No recurring failures detected.",
    kpi_alert_critical: "Critical attention",
    kpi_alert_warning: "Needs attention",
    kpi_scoped_supervisor: "Scoped to your assigned auditors",
    plant_knockout_detail: "knockout audits this month at this plant",
    auditor_knockout_detail: "knockout audits this month for this auditor",
    auditor_low_score_detail: "low average score this month for this auditor",
    plant_low_trend_detail: "weakest score trend this month at this plant",
    err_fetch_kpis: "Failed to load KPI data.",

    // Calendar
    tab_calendar: "Calendar",
    calendar_desc: "Scheduled and actual audits overlaid on one calendar.",
    calendar_scoped_desc: "Scoped to your perimeter (assigned auditors or your own audits).",
    calendar_state_planned: "Planned",
    calendar_state_in_progress: "In progress",
    calendar_state_done: "Done",
    calendar_state_failed_ko: "Failed (KO)",
    calendar_unscheduled_audit: "Unscheduled audit",
    calendar_event_detail: "Event detail",
    calendar_day_events: "Day events",
    calendar_match_type: "Schedule/audit match",
    calendar_match_fk: "Direct link (scheduleId)",
    calendar_match_heuristic: "Estimated match (plant + auditor + date)",
    err_fetch_calendar: "Failed to load calendar.",

    shift: "Shift (8h)",
    select_auditor: "Select auditor",
    assign_audits_title: "Audits to assign",
    assign_audits_desc: "These audits were assigned to you by the administrator. Pick an auditor from your team.",
    success_assign_auditor: "Auditor assigned successfully.",
    err_assign_auditor: "Failed to assign auditor.",
    assigning: "Assigning...",
    loading: "Loading",
    status_missed: "Missed",
    status_upcoming: "Upcoming",
    status_in_progress: "In progress",
    status_completed: "Completed",
    status_failed: "Failed",

    // Create Audit
    create_audit: "Create Audit",
    create_audit_desc: "Define the audit and assign it to a supervisor. They will pick the auditor.",
    create_audit_supervisor_note: "The supervisor will then assign an auditor from their dashboard.",
    define_questions: "Define Questions",
    define_questions_desc: "Add groups and questions for this audit.",
    audit_type: "Audit Type",
    audit_target: "Target",
    auditor: "Auditor",
    start_date: "Start Date",
    end_date: "End Date",
    score: "Score",
    select: "Select",
    btn_create_audit: "Create Audit",
    btn_save_questions: "Save Questions",
    btn_cancel: "Cancel",
    creating: "Creating...",
    saving: "Saving...",
    add_group: "Add Group",
    add_question: "Add Question",
    group: "Group",
    group_name_fr: "Group Name (FR)",
    group_name_en: "Group Name (EN)",
    question_fr: "Question (FR)",
    question_en: "Question (EN)",
    audit_id: "Audit",
    questions: "Questions",
    back: "Back",
    photo_attached: "Photo attached",
    audit_results_desc: "View detailed audit results.",

    // Errors
    err_fill_required: "Please fill all required fields.",
    err_create_audit: "Failed to create audit.",
    err_fill_questions: "Please fill all question fields.",
    err_save_questions: "Failed to save questions.",
    err_fetch_audit: "Unable to load audit details.",
    audit_created: "Audit created successfully!",
    questions_saved: "Questions saved successfully!",

    // Auditor tabs
    tab_my_audits: "My Audits",
    tab_findings: "Findings",
    tab_reports: "Reports",

    // Severity badges
    severity_Low: "Low",
    severity_Medium: "Medium",
    severity_High: "High",
    severity_Critical: "Critical",

    // Finding status badges
    finding_status_Open: "Open",
    finding_status_In_Review: "In Review",
    finding_status_Closed: "Closed",

    // Audit status badges
    audit_status_Planned: "Planned",
    audit_status_In_Progress: "In Progress",
    audit_status_Completed: "Completed",

    // Report status badges
    report_status_Draft: "Draft",
    report_status_Submitted: "Submitted",

    // Auditor columns
    col_audit: "Audit",
    col_plant: "Plant",
    col_type: "Type",
    col_due_date: "Due Date",
    col_id: "ID",
    col_severity: "Severity",
    col_report: "Report",
    col_date: "Date",

    // Auditor buttons
    btn_open: "Open",
    btn_continue: "Continue",
    btn_submit: "Submit",
    btn_view: "View",
    btn_download_pdf: "Download PDF",
    submitted: "Submitted",

    // Auditor page titles & descriptions
    my_audits: "My Audits",
    my_audits_desc: "View and manage your assigned audits.",
    findings: "Findings",
    findings_desc: "Review and track audit findings.",
    reports: "Reports",
    reports_desc: "View and download audit reports.",
    assigned_audits: "Assigned",
    pending_audits: "Pending",
    open_findings: "Open Findings",
    recent_findings: "Recent Findings",
    auditor_summary: "You have {assigned} audits assigned, {dueToday} due today, {openFindings} open findings, and {pendingReports} reports awaiting submission.",

    // Auditor empty states
    no_audits: "No audits found",
    no_audits_desc: "No audits match the current filter.",
    no_findings: "No findings found",
    no_findings_desc: "No findings match the current filter.",
    no_reports: "No reports found",
    no_reports_desc: "No reports are available yet.",

    // Auditor error messages
    err_fetch_audits: "Unable to load audits.",
    err_fetch_findings: "Unable to load findings.",
    err_fetch_reports: "Unable to load reports.",

    // Statuses
    status_Pending: "Pending",
    status_Active: "Active",
    status_Blocked: "Blocked",
    status_Rejected: "Rejected",

    // Validation Errors
    err_email_required: "Email address is required.",
    err_email_invalid:
      "Please enter a valid email address.",
    err_password_required: "Password is required.",
    err_password_min:
      "Password must be at least 8 characters long.",
    err_fullname_required: "Full name is required.",
    err_fullname_min:
      "Full name must contain at least 2 characters.",
    err_username_required: "Username is required.",
    err_username_min:
      "Username must contain at least 3 characters.",
    err_confirm_password_required:
      "Please confirm your password.",
    err_confirm_password_mismatch:
      "Passwords do not match.",
    err_division_required:
      "Please select a division.",

    // Alert & Server Errors
    success_login: "Successfully signed in.",
    success_register: "Account created successfully.",

    err_connection:
      "Unable to connect to the server. Please ensure the API backend is running.",

    err_registration_failed:
      "Account creation failed.",

    // Backend Mapped Errors
    "Invalid username or password":
      "Invalid email address or password.",

    "Username is already taken":
      "This username is already in use.",

    "Your account is awaiting administrator approval":
      "Your account is awaiting administrator approval.",

    "Your account has been blocked. Contact an administrator":
      "Your account has been blocked. Please contact an administrator.",

    "Your account request was not approved":
      "Your account request has been declined."
  }
};

export type Language = 'fr' | 'en';
export type TranslationKey = keyof typeof translations.fr;

