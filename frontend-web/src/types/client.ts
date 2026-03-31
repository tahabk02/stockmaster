export type Client = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  type: "INDIVIDUAL" | "COMPANY";
  taxId?: string;
  vatNumber?: string;
  totalDebt: number;
  creditLimit: number;
  status: "ACTIVE" | "INACTIVE" | "BAD_DEBT";
  createdAt: string;
};
