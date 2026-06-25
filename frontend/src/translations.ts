
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

    no_users: "Aucun utilisateur trouvé.",
    err_fetch_users: "Impossible de charger les utilisateurs.",

    // Navigation and Logout
    logout: "Déconnexion",
    tab_dashboard: "Tableau de bord",
    tab_create_audit: "Créer un audit",
    tab_user_management: "Utilisateurs",
    tab_audit_results: "Résultats des audits",

    coming_soon: "Bientôt disponible",
    coming_soon_desc:
      "Cette fonctionnalité est actuellement en cours de développement.",

    // Admin KPI
    total_audits: "Audits totaux",
    upcoming_audits: "À venir",
    in_progress_audits: "En cours",
    completed_audits: "Terminés",

    // Create Audit
    create_audit: "Créer un audit",
    create_audit_desc: "Définissez les informations générales de l'audit.",
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
    completed_audits: "Terminés",
    pending_audits: "En attente",
    open_findings: "Constats ouverts",
    upcoming_audits: "Audits à venir",
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

    no_users: "No users found.",
    err_fetch_users: "Unable to load users.",

    // Navigation and Logout
    logout: "Sign Out",
    tab_dashboard: "Dashboard",
    tab_create_audit: "Create Audit",
    tab_user_management: "Users",
    tab_audit_results: "Audit Results",

    coming_soon: "Coming Soon",
    coming_soon_desc:
      "This feature is currently under development.",

    // Admin KPI
    total_audits: "Total Audits",
    upcoming_audits: "Upcoming",
    in_progress_audits: "In Progress",
    completed_audits: "Completed",

    // Create Audit
    create_audit: "Create Audit",
    create_audit_desc: "Set the general audit information.",
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
    completed_audits: "Completed",
    pending_audits: "Pending",
    open_findings: "Open Findings",
    upcoming_audits: "Upcoming Audits",
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

