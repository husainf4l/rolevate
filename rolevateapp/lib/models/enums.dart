/// User type enumeration
enum UserType {
  system,
  candidate,
  business,
  admin;

  static UserType fromString(String value) {
    switch (value.toUpperCase()) {
      case 'SYSTEM':
        return UserType.system;
      case 'CANDIDATE':
        return UserType.candidate;
      case 'BUSINESS':
        return UserType.business;
      case 'ADMIN':
        return UserType.admin;
      default:
        throw ArgumentError('Unknown UserType: $value');
    }
  }

  String toJson() => name.toUpperCase();
}

/// Job type enumeration
enum JobType {
  fullTime,
  partTime,
  contract,
  remote;

  static JobType fromString(String value) {
    switch (value.toUpperCase()) {
      case 'FULL_TIME':
        return JobType.fullTime;
      case 'PART_TIME':
        return JobType.partTime;
      case 'CONTRACT':
        return JobType.contract;
      case 'REMOTE':
        return JobType.remote;
      default:
        throw ArgumentError('Unknown JobType: $value');
    }
  }

  String toJson() {
    switch (this) {
      case JobType.fullTime:
        return 'FULL_TIME';
      case JobType.partTime:
        return 'PART_TIME';
      case JobType.contract:
        return 'CONTRACT';
      case JobType.remote:
        return 'REMOTE';
    }
  }

  String get displayName {
    switch (this) {
      case JobType.fullTime:
        return 'Full Time';
      case JobType.partTime:
        return 'Part Time';
      case JobType.contract:
        return 'Contract';
      case JobType.remote:
        return 'Remote';
    }
  }
}

/// Job level enumeration
enum JobLevel {
  entry,
  mid,
  senior,
  executive;

  static JobLevel fromString(String value) {
    switch (value.toUpperCase()) {
      case 'ENTRY':
        return JobLevel.entry;
      case 'MID':
        return JobLevel.mid;
      case 'SENIOR':
        return JobLevel.senior;
      case 'EXECUTIVE':
        return JobLevel.executive;
      default:
        throw ArgumentError('Unknown JobLevel: $value');
    }
  }

  String toJson() => name.toUpperCase();

  String get displayName {
    switch (this) {
      case JobLevel.entry:
        return 'Entry Level';
      case JobLevel.mid:
        return 'Mid Level';
      case JobLevel.senior:
        return 'Senior';
      case JobLevel.executive:
        return 'Executive';
    }
  }
}

/// Work type enumeration
enum WorkType {
  onsite,
  remote,
  hybrid;

  static WorkType fromString(String value) {
    switch (value.toUpperCase()) {
      case 'ONSITE':
        return WorkType.onsite;
      case 'REMOTE':
        return WorkType.remote;
      case 'HYBRID':
        return WorkType.hybrid;
      default:
        throw ArgumentError('Unknown WorkType: $value');
    }
  }

  String toJson() => name.toUpperCase();

  String get displayName {
    switch (this) {
      case WorkType.onsite:
        return 'On-site';
      case WorkType.remote:
        return 'Remote';
      case WorkType.hybrid:
        return 'Hybrid';
    }
  }
}

/// Job status enumeration
enum JobStatus {
  draft,
  active,
  paused,
  closed,
  expired,
  deleted;

  static JobStatus fromString(String value) {
    switch (value.toUpperCase()) {
      case 'DRAFT':
        return JobStatus.draft;
      case 'ACTIVE':
        return JobStatus.active;
      case 'PAUSED':
        return JobStatus.paused;
      case 'CLOSED':
        return JobStatus.closed;
      case 'EXPIRED':
        return JobStatus.expired;
      case 'DELETED':
        return JobStatus.deleted;
      default:
        throw ArgumentError('Unknown JobStatus: $value');
    }
  }

  String toJson() => name.toUpperCase();

  String get displayName {
    switch (this) {
      case JobStatus.draft:
        return 'Draft';
      case JobStatus.active:
        return 'Active';
      case JobStatus.paused:
        return 'Paused';
      case JobStatus.closed:
        return 'Closed';
      case JobStatus.expired:
        return 'Expired';
      case JobStatus.deleted:
        return 'Deleted';
    }
  }
}

/// Application status enumeration
enum ApplicationStatus {
  pending,
  reviewed,
  shortlisted,
  interviewed,
  offered,
  hired,
  analyzed,
  rejected,
  withdrawn;

  static ApplicationStatus fromString(String value) {
    switch (value.toUpperCase()) {
      case 'PENDING':
        return ApplicationStatus.pending;
      case 'REVIEWED':
        return ApplicationStatus.reviewed;
      case 'SHORTLISTED':
        return ApplicationStatus.shortlisted;
      case 'INTERVIEWED':
        return ApplicationStatus.interviewed;
      case 'OFFERED':
        return ApplicationStatus.offered;
      case 'HIRED':
        return ApplicationStatus.hired;
      case 'ANALYZED':
        return ApplicationStatus.analyzed;
      case 'REJECTED':
        return ApplicationStatus.rejected;
      case 'WITHDRAWN':
        return ApplicationStatus.withdrawn;
      default:
        throw ArgumentError('Unknown ApplicationStatus: $value');
    }
  }

  String toJson() => name.toUpperCase();

  String get displayName {
    switch (this) {
      case ApplicationStatus.pending:
        return 'Pending';
      case ApplicationStatus.reviewed:
        return 'Reviewed';
      case ApplicationStatus.shortlisted:
        return 'Shortlisted';
      case ApplicationStatus.interviewed:
        return 'Interviewed';
      case ApplicationStatus.offered:
        return 'Offered';
      case ApplicationStatus.hired:
        return 'Hired';
      case ApplicationStatus.analyzed:
        return 'Analyzed';
      case ApplicationStatus.rejected:
        return 'Rejected';
      case ApplicationStatus.withdrawn:
        return 'Withdrawn';
    }
  }
}
