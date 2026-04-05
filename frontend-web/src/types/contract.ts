export interface EntityNode {
  _id: string;
  name: string;
}

export interface Contract {
  _id: string;
  title: string;
  entityId: {
    name: string;
  };
  type: string;
  value: number;
  startDate?: string;
  endDate: string;
  status: string;
}

export interface ContractFormData {
  title: string;
  entityId: string;
  entityType: string;
  type: string;
  value: string;
  startDate: string;
  endDate: string;
  status: string;
}

// Force file to be treated as a module in all environments
export const CONTRACT_TYPES_VERSION = "1.0.0";
