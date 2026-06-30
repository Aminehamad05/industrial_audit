BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[audits] (
    [id] INT NOT NULL IDENTITY(1,1),
    [audit_type] NVARCHAR(100),
    [audit_type_name] NVARCHAR(200),
    [audit_target] NVARCHAR(100),
    [auditor_login] NVARCHAR(256),
    [auditor_full_name] NVARCHAR(100),
    [start_date] DATETIME,
    [end_date] DATETIME,
    [score] DECIMAL(18,3),
    [comment] NVARCHAR(200),
    [audit_target_area] NVARCHAR(100),
    [audit_target_subarea] NVARCHAR(100),
    [audit_target_section] NVARCHAR(100),
    [audit_shift_name] NVARCHAR(20),
    [supervisor] NVARCHAR(150),
    [supervisorlogin] NVARCHAR(256),
    [idplant] INT,
    [Matricule] NVARCHAR(100),
    [TeamLeader] INT,
    [id_Schedule] INT,
    CONSTRAINT [PK_audits] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[audit_details] (
    [id] INT NOT NULL IDENTITY(1,1),
    [audit_id] INT NOT NULL,
    [group_position] INT NOT NULL,
    [group_name] NVARCHAR(100) NOT NULL,
    [group_name_ENG] NVARCHAR(100) NOT NULL,
    [question_position] INT NOT NULL,
    [question] NVARCHAR(800) NOT NULL,
    [question_ENG] NVARCHAR(800) NOT NULL,
    [answer] NVARCHAR(100),
    [comment] NVARCHAR(200),
    [answer_OK] BIT NOT NULL,
    [answer_NOK] BIT NOT NULL,
    [answer_NC] BIT NOT NULL,
    [answer_NA] BIT NOT NULL,
    [id_plant] INT,
    [Photo_Path] NVARCHAR(100),
    CONSTRAINT [PK_audit_details] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[actions] (
    [id] INT NOT NULL IDENTITY(1,1),
    [audit_id] INT NOT NULL,
    [audit_detail_id] INT NOT NULL,
    [id_status] INT,
    [responsible_login] NVARCHAR(256) NOT NULL,
    [responsible_full_name] NVARCHAR(100) NOT NULL,
    [action] NVARCHAR(200),
    [planned_term] DATE,
    [term] DATE,
    [last_edit_date] DATETIME,
    [user_action] NVARCHAR(50),
    [idPlant] INT,
    [cause] NVARCHAR(50),
    CONSTRAINT [PK_actions] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[schedules] (
    [id] INT NOT NULL IDENTITY(1,1),
    [schedule_name] NVARCHAR(200) NOT NULL,
    [audit_type] NVARCHAR(200) NOT NULL,
    [audit_target] NVARCHAR(200),
    [audit_date] DATE,
    [audit_year] INT,
    [audit_month] INT,
    [audit_week] INT,
    [auditor_login] NVARCHAR(200),
    [audit_target_subarea] NVARCHAR(200),
    [audit_target_area] NVARCHAR(200),
    [idPlant] INT,
    [audit_status] INT,
    [section] NVARCHAR(200),
    CONSTRAINT [PK_schedules] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[AffectationUserUserChef] (
    [idaffectuser] INT NOT NULL IDENTITY(1,1),
    [UserId] UNIQUEIDENTIFIER,
    [UserIdSup] UNIQUEIDENTIFIER,
    [idPlant] INT,
    CONSTRAINT [PK_AffectationUserUserChef] PRIMARY KEY CLUSTERED ([idaffectuser])
);

-- CreateTable
CREATE TABLE [dbo].[aspnet_Applications] (
    [ApplicationName] NVARCHAR(256) NOT NULL,
    [LoweredApplicationName] NVARCHAR(256) NOT NULL,
    [ApplicationId] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__aspnet_Ap__Appli__08EA5793] DEFAULT newid(),
    [Description] NVARCHAR(256),
    CONSTRAINT [PK__aspnet_A__C93A4C98014935CB] PRIMARY KEY NONCLUSTERED ([ApplicationId]),
    CONSTRAINT [UQ__aspnet_A__3091033107020F21] UNIQUE NONCLUSTERED ([ApplicationName]),
    CONSTRAINT [UQ__aspnet_A__17477DE40425A276] UNIQUE NONCLUSTERED ([LoweredApplicationName])
);

-- CreateTable
CREATE TABLE [dbo].[aspnet_Membership] (
    [ApplicationId] UNIQUEIDENTIFIER NOT NULL,
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [Password] NVARCHAR(128) NOT NULL,
    [PasswordFormat] INT NOT NULL CONSTRAINT [DF__aspnet_Me__Passw__239E4DCF] DEFAULT 0,
    [PasswordSalt] NVARCHAR(128) NOT NULL,
    [MobilePIN] NVARCHAR(16),
    [Email] NVARCHAR(256),
    [LoweredEmail] NVARCHAR(256),
    [PasswordQuestion] NVARCHAR(256),
    [PasswordAnswer] NVARCHAR(128),
    [IsApproved] BIT NOT NULL,
    [IsLockedOut] BIT NOT NULL,
    [CreateDate] DATETIME NOT NULL,
    [LastLoginDate] DATETIME NOT NULL,
    [LastPasswordChangedDate] DATETIME NOT NULL,
    [LastLockoutDate] DATETIME NOT NULL,
    [FailedPasswordAttemptCount] INT NOT NULL,
    [FailedPasswordAttemptWindowStart] DATETIME NOT NULL,
    [FailedPasswordAnswerAttemptCount] INT NOT NULL,
    [FailedPasswordAnswerAttemptWindowStart] DATETIME NOT NULL,
    [Comment] NTEXT,
    [idPlant] INT,
    CONSTRAINT [PK__aspnet_M__1788CC4D1FCDBCEB] PRIMARY KEY NONCLUSTERED ([UserId])
);

-- CreateTable
CREATE TABLE [dbo].[aspnet_Paths] (
    [ApplicationId] UNIQUEIDENTIFIER NOT NULL,
    [PathId] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__aspnet_Pa__PathI__5BE2A6F2] DEFAULT newid(),
    [Path] NVARCHAR(256) NOT NULL,
    [LoweredPath] NVARCHAR(256) NOT NULL,
    CONSTRAINT [PK__aspnet_P__CD67DC5859063A47] PRIMARY KEY NONCLUSTERED ([PathId])
);

-- CreateTable
CREATE TABLE [dbo].[aspnet_PersonalizationAllUsers] (
    [PathId] UNIQUEIDENTIFIER NOT NULL,
    [PageSettings] IMAGE NOT NULL,
    [LastUpdatedDate] DATETIME NOT NULL,
    CONSTRAINT [PK__aspnet_P__CD67DC5960A75C0F] PRIMARY KEY CLUSTERED ([PathId])
);

-- CreateTable
CREATE TABLE [dbo].[aspnet_PersonalizationPerUser] (
    [Id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__aspnet_Perso__Id__6754599E] DEFAULT newid(),
    [PathId] UNIQUEIDENTIFIER,
    [UserId] UNIQUEIDENTIFIER,
    [PageSettings] IMAGE NOT NULL,
    [LastUpdatedDate] DATETIME NOT NULL,
    CONSTRAINT [PK__aspnet_P__3214EC06656C112C] PRIMARY KEY NONCLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[aspnet_Profile] (
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [PropertyNames] NTEXT NOT NULL,
    [PropertyValuesString] NTEXT NOT NULL,
    [PropertyValuesBinary] IMAGE NOT NULL,
    [LastUpdatedDate] DATETIME NOT NULL,
    CONSTRAINT [PK__aspnet_P__1788CC4C36B12243] PRIMARY KEY CLUSTERED ([UserId])
);

-- CreateTable
CREATE TABLE [dbo].[aspnet_Roles] (
    [ApplicationId] UNIQUEIDENTIFIER NOT NULL,
    [RoleId] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__aspnet_Ro__RoleI__44FF419A] DEFAULT newid(),
    [RoleName] NVARCHAR(256) NOT NULL,
    [LoweredRoleName] NVARCHAR(256) NOT NULL,
    [Description] NVARCHAR(256),
    [idPlant] INT,
    CONSTRAINT [PK__aspnet_R__8AFACE1B4222D4EF] PRIMARY KEY NONCLUSTERED ([RoleId])
);

-- CreateTable
CREATE TABLE [dbo].[aspnet_SchemaVersions] (
    [Feature] NVARCHAR(128) NOT NULL,
    [CompatibleSchemaVersion] NVARCHAR(128) NOT NULL,
    [IsCurrentVersion] BIT NOT NULL,
    CONSTRAINT [PK__aspnet_S__5A1E6BC11367E606] PRIMARY KEY CLUSTERED ([Feature],[CompatibleSchemaVersion])
);

-- CreateTable
CREATE TABLE [dbo].[aspnet_Users] (
    [ApplicationId] UNIQUEIDENTIFIER,
    [UserId] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__aspnet_Us__UserI__0EA330E9] DEFAULT newid(),
    [UserName] NVARCHAR(256),
    [LoweredUserName] NVARCHAR(256),
    [MobileAlias] NVARCHAR(16),
    [IsAnonymous] BIT CONSTRAINT [DF__aspnet_Us__IsAno__108B795B] DEFAULT 0,
    [LastActivityDate] DATETIME,
    [Name] NVARCHAR(50),
    [LastName] NVARCHAR(50),
    [Email] NVARCHAR(80),
    [FonctionID] INT,
    [ServiceID] INT,
    [statut] BIT,
    [passwordHash] NVARCHAR(255),
    CONSTRAINT [PK__aspnet_U__1788CC4D0BC6C43E] PRIMARY KEY NONCLUSTERED ([UserId]),
    CONSTRAINT [UQ_aspnet_Users_UserName] UNIQUE NONCLUSTERED ([UserName])
);

-- CreateTable
CREATE TABLE [dbo].[aspnet_UsersInRoles] (
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [RoleId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [PK__aspnet_U__AF2760AD47DBAE45] PRIMARY KEY CLUSTERED ([UserId],[RoleId])
);

-- CreateTable
CREATE TABLE [dbo].[aspnet_WebEvent_Events] (
    [EventId] CHAR(32) NOT NULL,
    [EventTimeUtc] DATETIME NOT NULL,
    [EventTime] DATETIME NOT NULL,
    [EventType] NVARCHAR(256) NOT NULL,
    [EventSequence] DECIMAL(19,0) NOT NULL,
    [EventOccurrence] DECIMAL(19,0) NOT NULL,
    [EventCode] INT NOT NULL,
    [EventDetailCode] INT NOT NULL,
    [Message] NVARCHAR(1024),
    [ApplicationPath] NVARCHAR(256),
    [ApplicationVirtualPath] NVARCHAR(256),
    [MachineName] NVARCHAR(256) NOT NULL,
    [RequestUrl] NVARCHAR(1024),
    [ExceptionType] NVARCHAR(256),
    [Details] NTEXT,
    CONSTRAINT [PK__aspnet_W__7944C810797309D9] PRIMARY KEY CLUSTERED ([EventId])
);

-- CreateTable
CREATE TABLE [dbo].[audit_details_old] (
    [id] INT NOT NULL IDENTITY(1,1),
    [audit_id] INT NOT NULL,
    [group_position] INT NOT NULL,
    [group_name] NVARCHAR(100) NOT NULL,
    [group_name_ENG] NVARCHAR(100) NOT NULL,
    [question_position] INT NOT NULL,
    [question] NVARCHAR(800) NOT NULL,
    [question_ENG] NVARCHAR(800) NOT NULL,
    [answer] NVARCHAR(100),
    [comment] NVARCHAR(200),
    [answer_OK] BIT NOT NULL,
    [answer_NOK] BIT NOT NULL,
    [answer_NC] BIT NOT NULL,
    [answer_NA] BIT NOT NULL,
    [id_plant] INT,
    [Photo_Path] NVARCHAR(100)
);

-- CreateTable
CREATE TABLE [dbo].[Audit_status] (
    [id_status] INT NOT NULL IDENTITY(1,1),
    [audit_type] NVARCHAR(100) NOT NULL
);

-- CreateTable
CREATE TABLE [dbo].[Correspondance_User_Plant] (
    [idCorrespondence] INT NOT NULL IDENTITY(1,1),
    [UserId] UNIQUEIDENTIFIER,
    [idPlant] INT,
    CONSTRAINT [PK_Correspondance_User_Plant] PRIMARY KEY CLUSTERED ([idCorrespondence])
);

-- CreateTable
CREATE TABLE [dbo].[deleted_idaudit_details] (
    [id] INT NOT NULL,
    [id_audit_deleted] INT NOT NULL
);

-- CreateTable
CREATE TABLE [dbo].[plant] (
    [idPlant] INT NOT NULL IDENTITY(1,1),
    [designationPlant] NVARCHAR(50),
    CONSTRAINT [PK_plant] PRIMARY KEY CLUSTERED ([idPlant])
);

-- CreateTable
CREATE TABLE [dbo].[setts_action_status] (
    [id_status] INT NOT NULL,
    [etat_status] NVARCHAR(100) NOT NULL,
    CONSTRAINT [PK_setts_action_status] PRIMARY KEY CLUSTERED ([id_status])
);

-- CreateTable
CREATE TABLE [dbo].[setts_audit_machines] (
    [Workshop] VARCHAR(50),
    [Ilot] VARCHAR(50),
    [MachineType] VARCHAR(50)
);

-- CreateTable
CREATE TABLE [dbo].[setts_audit_question_groups] (
    [id] INT NOT NULL IDENTITY(1,1),
    [audit_type] NVARCHAR(200) NOT NULL,
    [group_position] INT NOT NULL,
    [group_name] NVARCHAR(200) NOT NULL,
    [group_name_ENG] NVARCHAR(200) NOT NULL,
    [idPlant] INT,
    CONSTRAINT [PK_setts_audit_question_groups] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[setts_audit_questions] (
    [id] INT NOT NULL IDENTITY(1,1),
    [group_id] INT NOT NULL,
    [question_position] INT NOT NULL,
    [question] NVARCHAR(1500) NOT NULL,
    [question_ENG] NVARCHAR(1500) NOT NULL,
    [answer_OK] BIT NOT NULL,
    [answer_NOK] BIT NOT NULL,
    [answer_NA] BIT NOT NULL,
    [answer_NC] BIT NOT NULL,
    [idPlant] INT,
    CONSTRAINT [PK_setts_audit_questions] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[setts_audit_targets] (
    [id] INT NOT NULL IDENTITY(1,1),
    [audit_type] NVARCHAR(100) NOT NULL,
    [audit_target] NVARCHAR(100) NOT NULL,
    [area] NVARCHAR(100),
    [subarea] NVARCHAR(100),
    [section] NVARCHAR(100),
    [supervisor_login] NVARCHAR(100),
    [supervisor_login1] NVARCHAR(100),
    [supervisor_login2] NVARCHAR(100),
    [supervisor] NVARCHAR(100),
    [supervisor1] NVARCHAR(100),
    [supervisor2] NVARCHAR(100),
    [idPlant] INT,
    CONSTRAINT [PK_setts_audit_targets] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[setts_audit_types] (
    [id] INT NOT NULL IDENTITY(1,1),
    [audit_type] NVARCHAR(200) NOT NULL,
    [name] NVARCHAR(200) NOT NULL,
    [idPlant] INT,
    CONSTRAINT [PK_setts_audit_types] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[setts_auditors] (
    [id] INT NOT NULL IDENTITY(1,1),
    [audit_type] NVARCHAR(100) NOT NULL,
    [auditor_login] NVARCHAR(100) NOT NULL,
    [idPlant] INT,
    CONSTRAINT [PK_auditors] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[setts_fonctions] (
    [id] INT NOT NULL IDENTITY(1,1),
    [designation_fonction] NVARCHAR(50),
    CONSTRAINT [PK_setts_fonctions] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[setts_schedules] (
    [id] INT NOT NULL IDENTITY(1,1),
    [schedule_name] NVARCHAR(200) NOT NULL,
    [schedule_description] NVARCHAR(200) NOT NULL,
    [idPlant] INT,
    CONSTRAINT [PK_setts_schedules] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[setts_services] (
    [id] INT NOT NULL IDENTITY(1,1),
    [designation_service] NVARCHAR(200),
    [idPlant] INT,
    CONSTRAINT [PK_setts_services] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[setts_shifts] (
    [id] INT NOT NULL IDENTITY(1,1),
    [shift_name] NVARCHAR(20) NOT NULL,
    CONSTRAINT [PK_setts_shifts] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[setts_TeamLeader] (
    [id] INT NOT NULL IDENTITY(1,1),
    [Team_Leader] NVARCHAR(50),
    [idplant] INT,
    [matricule] NVARCHAR(50),
    CONSTRAINT [PK_setts_TeamLeader] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[TJ_FonctionUser] (
    [id] INT NOT NULL IDENTITY(1,1),
    [UserId] UNIQUEIDENTIFIER,
    [FonctionID] INT,
    CONSTRAINT [PK_TJ_FonctionUser] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[TJ_ServiceUser] (
    [idServiceUser] INT NOT NULL IDENTITY(1,1),
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [ServiceID] INT,
    CONSTRAINT [PK_TJ_ServiceUser] PRIMARY KEY CLUSTERED ([idServiceUser])
);

-- AddForeignKey
ALTER TABLE [dbo].[audits] ADD CONSTRAINT [FK_audits_plant] FOREIGN KEY ([idplant]) REFERENCES [dbo].[plant]([idPlant]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[audits] ADD CONSTRAINT [FK_audits_schedule] FOREIGN KEY ([id_Schedule]) REFERENCES [dbo].[schedules]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[audits] ADD CONSTRAINT [FK_audits_teamleader] FOREIGN KEY ([TeamLeader]) REFERENCES [dbo].[setts_TeamLeader]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[audits] ADD CONSTRAINT [FK_audits_auditor] FOREIGN KEY ([auditor_login]) REFERENCES [dbo].[aspnet_Users]([UserName]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[audits] ADD CONSTRAINT [FK_audits_supervisor] FOREIGN KEY ([supervisorlogin]) REFERENCES [dbo].[aspnet_Users]([UserName]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[audit_details] ADD CONSTRAINT [FK_audit_details_audit] FOREIGN KEY ([audit_id]) REFERENCES [dbo].[audits]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[audit_details] ADD CONSTRAINT [FK_audit_details_plant] FOREIGN KEY ([id_plant]) REFERENCES [dbo].[plant]([idPlant]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[actions] ADD CONSTRAINT [FK_actions_audit] FOREIGN KEY ([audit_id]) REFERENCES [dbo].[audits]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[actions] ADD CONSTRAINT [FK_actions_auditdetail] FOREIGN KEY ([audit_detail_id]) REFERENCES [dbo].[audit_details]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[actions] ADD CONSTRAINT [FK_actions_status] FOREIGN KEY ([id_status]) REFERENCES [dbo].[setts_action_status]([id_status]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[actions] ADD CONSTRAINT [FK_actions_plant] FOREIGN KEY ([idPlant]) REFERENCES [dbo].[plant]([idPlant]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[actions] ADD CONSTRAINT [FK_actions_responsible] FOREIGN KEY ([responsible_login]) REFERENCES [dbo].[aspnet_Users]([UserName]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[schedules] ADD CONSTRAINT [FK_schedules_plant] FOREIGN KEY ([idPlant]) REFERENCES [dbo].[plant]([idPlant]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AffectationUserUserChef] ADD CONSTRAINT [FK_Affectation_user] FOREIGN KEY ([UserId]) REFERENCES [dbo].[aspnet_Users]([UserId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AffectationUserUserChef] ADD CONSTRAINT [FK_Affectation_chef] FOREIGN KEY ([UserIdSup]) REFERENCES [dbo].[aspnet_Users]([UserId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AffectationUserUserChef] ADD CONSTRAINT [FK_AffectationUserUserChef_plant] FOREIGN KEY ([idPlant]) REFERENCES [dbo].[plant]([idPlant]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[aspnet_Membership] ADD CONSTRAINT [FK__aspnet_Me__Appli__21B6055D] FOREIGN KEY ([ApplicationId]) REFERENCES [dbo].[aspnet_Applications]([ApplicationId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[aspnet_Membership] ADD CONSTRAINT [FK_aspnet_Membership_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[aspnet_Users]([UserId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[aspnet_Membership] ADD CONSTRAINT [FK_aspnet_Membership_plant] FOREIGN KEY ([idPlant]) REFERENCES [dbo].[plant]([idPlant]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[aspnet_Paths] ADD CONSTRAINT [FK__aspnet_Pa__Appli__5AEE82B9] FOREIGN KEY ([ApplicationId]) REFERENCES [dbo].[aspnet_Applications]([ApplicationId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[aspnet_PersonalizationAllUsers] ADD CONSTRAINT [FK__aspnet_Pe__PathI__0F624AF8] FOREIGN KEY ([PathId]) REFERENCES [dbo].[aspnet_Paths]([PathId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[aspnet_PersonalizationPerUser] ADD CONSTRAINT [FK__aspnet_Pe__PathI__123EB7A3] FOREIGN KEY ([PathId]) REFERENCES [dbo].[aspnet_Paths]([PathId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[aspnet_PersonalizationPerUser] ADD CONSTRAINT [FK__aspnet_Pe__UserI__693CA210] FOREIGN KEY ([UserId]) REFERENCES [dbo].[aspnet_Users]([UserId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[aspnet_Profile] ADD CONSTRAINT [FK__aspnet_Pr__UserI__38996AB5] FOREIGN KEY ([UserId]) REFERENCES [dbo].[aspnet_Users]([UserId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[aspnet_Roles] ADD CONSTRAINT [FK__aspnet_Ro__Appli__440B1D61] FOREIGN KEY ([ApplicationId]) REFERENCES [dbo].[aspnet_Applications]([ApplicationId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[aspnet_Roles] ADD CONSTRAINT [FK_aspnet_Roles_plant] FOREIGN KEY ([idPlant]) REFERENCES [dbo].[plant]([idPlant]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[aspnet_Users] ADD CONSTRAINT [FK__aspnet_Us__Appli__0DAF0CB0] FOREIGN KEY ([ApplicationId]) REFERENCES [dbo].[aspnet_Applications]([ApplicationId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[aspnet_Users] ADD CONSTRAINT [FK_aspnet_Users_fonction] FOREIGN KEY ([FonctionID]) REFERENCES [dbo].[setts_fonctions]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[aspnet_Users] ADD CONSTRAINT [FK_aspnet_Users_service] FOREIGN KEY ([ServiceID]) REFERENCES [dbo].[setts_services]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[aspnet_UsersInRoles] ADD CONSTRAINT [FK__aspnet_Us__RoleI__18EBB532] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[aspnet_Roles]([RoleId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[aspnet_UsersInRoles] ADD CONSTRAINT [FK_aspnet_UsersInRoles_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[aspnet_Users]([UserId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Correspondance_User_Plant] ADD CONSTRAINT [FK_CorrUserPlant_user] FOREIGN KEY ([UserId]) REFERENCES [dbo].[aspnet_Users]([UserId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Correspondance_User_Plant] ADD CONSTRAINT [FK_CorrUserPlant_plant] FOREIGN KEY ([idPlant]) REFERENCES [dbo].[plant]([idPlant]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[setts_audit_question_groups] ADD CONSTRAINT [FK_question_groups_plant] FOREIGN KEY ([idPlant]) REFERENCES [dbo].[plant]([idPlant]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[setts_audit_questions] ADD CONSTRAINT [FK_questions_group] FOREIGN KEY ([group_id]) REFERENCES [dbo].[setts_audit_question_groups]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[setts_audit_questions] ADD CONSTRAINT [FK_questions_plant] FOREIGN KEY ([idPlant]) REFERENCES [dbo].[plant]([idPlant]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[setts_audit_targets] ADD CONSTRAINT [FK_audit_targets_plant] FOREIGN KEY ([idPlant]) REFERENCES [dbo].[plant]([idPlant]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[setts_audit_types] ADD CONSTRAINT [FK_audit_types_plant] FOREIGN KEY ([idPlant]) REFERENCES [dbo].[plant]([idPlant]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[setts_auditors] ADD CONSTRAINT [FK_auditors_plant] FOREIGN KEY ([idPlant]) REFERENCES [dbo].[plant]([idPlant]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[setts_schedules] ADD CONSTRAINT [FK_setts_schedules_plant] FOREIGN KEY ([idPlant]) REFERENCES [dbo].[plant]([idPlant]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[setts_services] ADD CONSTRAINT [FK_setts_services_plant] FOREIGN KEY ([idPlant]) REFERENCES [dbo].[plant]([idPlant]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[setts_TeamLeader] ADD CONSTRAINT [FK_TeamLeader_plant] FOREIGN KEY ([idplant]) REFERENCES [dbo].[plant]([idPlant]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[TJ_FonctionUser] ADD CONSTRAINT [FK_TJFonctionUser_user] FOREIGN KEY ([UserId]) REFERENCES [dbo].[aspnet_Users]([UserId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[TJ_FonctionUser] ADD CONSTRAINT [FK_TJFonctionUser_fonction] FOREIGN KEY ([FonctionID]) REFERENCES [dbo].[setts_fonctions]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[TJ_ServiceUser] ADD CONSTRAINT [FK_TJServiceUser_user] FOREIGN KEY ([UserId]) REFERENCES [dbo].[aspnet_Users]([UserId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[TJ_ServiceUser] ADD CONSTRAINT [FK_TJServiceUser_service] FOREIGN KEY ([ServiceID]) REFERENCES [dbo].[setts_services]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
