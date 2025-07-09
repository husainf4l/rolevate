export class Invitation {
  id: string;
  code: string;
  companyId: string;
  used: boolean;
  createdAt: Date;
  usedAt?: Date;
}
