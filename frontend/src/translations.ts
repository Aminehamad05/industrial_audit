export const translations = {
  fr: {
    // General
    hutchinson: "Hutchinson",
    system_title: "Système d'audit industriel",
    
    // Login
    login_title: "Bon retour",
    login_subtitle: "Connectez-vous au système d'audit industriel",
    email: "E-mail",
    email_placeholder: "ex. amine_hamad@hutchinson.com",
    password: "Mot de passe",
    password_placeholder: "••••••••",
    remember_me: "Se souvenir de moi",
    sign_in: "Se connecter",
    signing_in: "Connexion en cours...",
    need_account: "Besoin d'un compte ?",
    register_here: "S'inscrire ici",

    // Register
    register_title: "Créer un compte",
    register_subtitle: "Enregistrer un nouvel utilisateur",
    fullname: "Nom complet",
    fullname_placeholder: "ex. Amine Hamad",
    username: "Nom d'utilisateur",
    username_placeholder: "ex. amine_hamad",
    confirm_password: "Confirmer le mot de passe",
    confirm_password_placeholder: "Saisissez à nouveau votre mot de passe",
    role: "Rôle",
    division: "Division",
    create_account: "Créer le compte",
    creating_account: "Création du compte...",
    back_to_login: "Retour à la connexion",
    password_min_placeholder: "Min. 8 caractères",

    // Roles
    role_Auditor: "Auditeur",
    role_Supervisor: "Superviseur",
    role_MaintenanceTechnician: "Technicien de maintenance",
    role_Administrator: "Administrateur",

    // Divisions
    division_FMS: "FMS (Systèmes de gestion des fluides)",
    division_AD: "A&D (Aérospatiale & Défense)",

    // Home / Dashboard
    welcome: "Bienvenue",
    role_label: "Rôle",
    logged_in_as: "Connecté en tant que",
    user_management: "Gestion des utilisateurs",
    all: "Tous",
    pending: "En attente",
    active: "Actifs",
    blocked: "Bloqués",
    rejected: "Rejetés",
    col_name: "Nom complet",
    col_email: "E-mail",
    col_role: "Rôle",
    col_status: "Statut",
    col_actions: "Actions",
    btn_approve: "Approuver",
    btn_reject: "Rejeter",
    btn_block: "Bloquer",
    btn_unblock: "Débloquer",
    btn_delete: "Supprimer",
    no_users: "Aucun utilisateur trouvé.",
    err_fetch_users: "Erreur lors du chargement des utilisateurs",

    // Navigation and Logout
    logout: "Se déconnecter",
    tab_dashboard: "Tableau de bord",
    tab_user_management: "Utilisateurs",
    tab_audit_results: "Résultats d'audit",
    coming_soon: "Bientôt disponible",
    coming_soon_desc: "Cette section est en cours de développement.",

    // Statuses
    status_Pending: "En attente",
    status_Active: "Actif",
    status_Blocked: "Bloqué",
    status_Rejected: "Rejeté",

    // Validation Errors
    err_email_required: "L'e-mail est requis",
    err_email_invalid: "Veuillez entrer une adresse e-mail valide",
    err_password_required: "Le mot de passe est requis",
    err_password_min: "Le mot de passe doit comporter au moins 8 caractères",
    err_fullname_required: "Le nom complet est requis",
    err_fullname_min: "Le nom complet doit comporter au moins 2 caractères",
    err_username_required: "Le nom d'utilisateur est requis",
    err_username_min: "Le nom d'utilisateur doit comporter au moins 3 caractères",
    err_confirm_password_required: "Veuillez confirmer votre mot de passe",
    err_confirm_password_mismatch: "Les mots de passe ne correspondent pas",
    err_division_required: "La division est requise",

    // Alert & Server Errors
    success_login: "Connexion réussie !",
    success_register: "Compte créé avec succès !",
    err_connection: "Impossible de se connecter au serveur. Veuillez vérifier si le backend API est démarré.",
    err_registration_failed: "L'inscription a échoué",
    
    // Backend Mapped Errors
    "Invalid username or password": "E-mail ou mot de passe invalide",
    "Username is already taken": "Le nom d'utilisateur est déjà pris",
    "Your account is awaiting administrator approval": "Votre compte est en attente d'approbation par l'administrateur",
    "Your account has been blocked. Contact an administrator": "Votre compte a été bloqué. Contactez un administrateur",
    "Your account request was not approved": "Votre demande de compte n'a pas été approuvée",
  },
  en: {
    // General
    hutchinson: "Hutchinson",
    system_title: "Industrial Audit System",

    // Login
    login_title: "Welcome Back",
    login_subtitle: "Sign in to the Industrial Audit System",
    email: "Email",
    email_placeholder: "e.g. amine_hamad@hutchinson.com",
    password: "Password",
    password_placeholder: "••••••••",
    remember_me: "Remember me",
    sign_in: "Sign In",
    signing_in: "Signing in...",
    need_account: "Need an account?",
    register_here: "Register here",

    // Register
    register_title: "Create Account",
    register_subtitle: "Register a new user",
    fullname: "Full Name",
    fullname_placeholder: "e.g. Amine Hamad",
    username: "Username",
    username_placeholder: "e.g. amine_hamad",
    confirm_password: "Confirm Password",
    confirm_password_placeholder: "Re-enter your password",
    role: "Role",
    division: "Division",
    create_account: "Create Account",
    creating_account: "Creating Account...",
    back_to_login: "Back to Login",
    password_min_placeholder: "Min. 8 characters",

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
    role_label: "Role",
    logged_in_as: "Logged in as",
    user_management: "User Management",
    all: "All",
    pending: "Pending",
    active: "Active",
    blocked: "Blocked",
    rejected: "Rejected",
    col_name: "Full Name",
    col_email: "Email",
    col_role: "Role",
    col_status: "Status",
    col_actions: "Actions",
    btn_approve: "Approve",
    btn_reject: "Reject",
    btn_block: "Block",
    btn_unblock: "Unblock",
    btn_delete: "Delete",
    no_users: "No users found.",
    err_fetch_users: "Error loading users",

    // Navigation and Logout
    logout: "Logout",
    tab_dashboard: "Dashboard",
    tab_user_management: "Users",
    tab_audit_results: "Audit Results",
    coming_soon: "Coming Soon",
    coming_soon_desc: "This section is currently under development.",

    // Statuses
    status_Pending: "Pending",
    status_Active: "Active",
    status_Blocked: "Blocked",
    status_Rejected: "Rejected",

    // Validation Errors
    err_email_required: "Email is required",
    err_email_invalid: "Please enter a valid email address",
    err_password_required: "Password is required",
    err_password_min: "Password must be at least 8 characters",
    err_fullname_required: "Full name is required",
    err_fullname_min: "Full name must be at least 2 characters",
    err_username_required: "Username is required",
    err_username_min: "Username must be at least 3 characters",
    err_confirm_password_required: "Please confirm your password",
    err_confirm_password_mismatch: "Passwords do not match",
    err_division_required: "Division is required",

    // Alert & Server Errors
    success_login: "Login successful!",
    success_register: "Account created successfully!",
    err_connection: "Cannot connect to the server. Please check if the API backend is running.",
    err_registration_failed: "Registration failed",

    // Backend Mapped Errors
    "Invalid username or password": "Invalid email or password",
    "Username is already taken": "Username is already taken",
    "Your account is awaiting administrator approval": "Your account is awaiting administrator approval",
    "Your account has been blocked. Contact an administrator": "Your account has been blocked. Contact an administrator",
    "Your account request was not approved": "Your account request was not approved",
  }
};

export type Language = 'fr' | 'en';
export type TranslationKey = keyof typeof translations.fr;
