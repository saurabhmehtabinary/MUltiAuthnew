export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'org_admin' | 'org_user';
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  userId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}