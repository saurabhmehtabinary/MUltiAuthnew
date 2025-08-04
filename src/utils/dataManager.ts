import { User, Organization, Order } from '@/types';
import { jsonFileManager } from './jsonFileManager';

class DataManager {
  private users: User[] = [];
  private organizations: Organization[] = [];
  private orders: Order[] = [];
  private isInitialized = false;

  constructor() {
    // Initialize data asynchronously
    this.initializeData();
  }

  private async initializeData(): Promise<void> {
    console.log('Initializing DataManager...');
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('Server-side rendering - using default data');
      this.users = this.getDefaultUsers();
      this.organizations = this.getDefaultOrganizations();
      this.orders = this.getDefaultOrders();
      this.isInitialized = true;
      return;
    }

    console.log('Browser environment - loading data from JSON files...');

    try {
      // Load data from JSON files first
      const [fileUsers, fileOrganizations, fileOrders] = await Promise.all([
        jsonFileManager.loadUsersFromFile(),
        jsonFileManager.loadOrganizationsFromFile(),
        jsonFileManager.loadOrdersFromFile()
      ]);

      console.log('JSON file data loaded:', {
        users: fileUsers.length,
        organizations: fileOrganizations.length,
        orders: fileOrders.length
      });

      // Use file data if available, otherwise use localStorage or defaults
      this.users = fileUsers.length > 0 ? fileUsers : this.getUsersFromStorage();
      this.organizations = fileOrganizations.length > 0 ? fileOrganizations : this.getOrganizationsFromStorage();
      this.orders = fileOrders.length > 0 ? fileOrders : this.getOrdersFromStorage();

      // If no data found anywhere, use defaults
      if (this.users.length === 0) {
        console.log('No users found, using defaults');
        this.users = this.getDefaultUsers();
      }
      if (this.organizations.length === 0) {
        console.log('No organizations found, using defaults');
        this.organizations = this.getDefaultOrganizations();
      }
      if (this.orders.length === 0) {
        console.log('No orders found, using defaults');
        this.orders = this.getDefaultOrders();
      }

      console.log('Final data loaded:', {
        users: this.users.length,
        organizations: this.organizations.length,
        orders: this.orders.length
      });

      // Save the current data to JSON files to ensure persistence
      await this.saveToFiles();

    } catch (error) {
      console.error('Failed to load data from files, using localStorage:', error);
      this.users = this.getUsersFromStorage();
      this.organizations = this.getOrganizationsFromStorage();
      this.orders = this.getOrdersFromStorage();
    }

    this.isInitialized = true;
  }

  private getUsersFromStorage(): User[] {
    const storedUsers = localStorage.getItem('app_users');
    return storedUsers ? JSON.parse(storedUsers) : this.getDefaultUsers();
  }

  private getOrganizationsFromStorage(): Organization[] {
    const storedOrganizations = localStorage.getItem('app_organizations');
    return storedOrganizations ? JSON.parse(storedOrganizations) : this.getDefaultOrganizations();
  }

  private getOrdersFromStorage(): Order[] {
    const storedOrders = localStorage.getItem('app_orders');
    return storedOrders ? JSON.parse(storedOrders) : this.getDefaultOrders();
  }

  private getDefaultUsers(): User[] {
    return [
      {
        id: "user-1",
        email: "superadmin@example.com",
        name: "Super Admin",
        role: "super_admin",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      },
      {
        id: "user-2",
        email: "admin@techcorp.com",
        name: "Tech Corp Admin",
        role: "org_admin",
        organizationId: "org-1",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      },
      {
        id: "user-3",
        email: "user@techcorp.com",
        name: "Tech Corp User",
        role: "org_user",
        organizationId: "org-1",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      }
    ];
  }

  private getDefaultOrganizations(): Organization[] {
    return [
      {
        id: "org-1",
        name: "Tech Corp",
        description: "Technology company",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      },
      {
        id: "org-2",
        name: "Marketing Inc",
        description: "Marketing agency",
        createdAt: "2024-01-02T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z"
      }
    ];
  }

  private getDefaultOrders(): Order[] {
    return [
      {
        id: "order-1",
        title: "Website Development",
        description: "Create a new company website",
        status: "in_progress",
        userId: "user-3",
        organizationId: "org-1",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      },
      {
        id: "order-2",
        title: "Marketing Campaign",
        description: "Launch social media campaign",
        status: "pending",
        userId: "user-3",
        organizationId: "org-1",
        createdAt: "2024-01-02T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z"
      }
    ];
  }

  private async saveToStorage(): Promise<void> {
    // Only save to localStorage if we're in a browser environment
    if (typeof window !== 'undefined') {
      console.log('Saving data to localStorage...');
      console.log('Users count:', this.users.length);
      console.log('Organizations count:', this.organizations.length);
      console.log('Orders count:', this.orders.length);
      
      localStorage.setItem('app_users', JSON.stringify(this.users));
      localStorage.setItem('app_organizations', JSON.stringify(this.organizations));
      localStorage.setItem('app_orders', JSON.stringify(this.orders));
      
      console.log('Data saved to localStorage successfully');
    } else {
      console.log('Not in browser environment, skipping localStorage save');
    }
  }

  private async saveToFiles(): Promise<void> {
    try {
      console.log('Saving data to JSON files...');
      await jsonFileManager.exportAllData(this.users, this.organizations, this.orders);
      console.log('Data saved to JSON files successfully');
    } catch (error) {
      console.error('Failed to save to JSON files:', error);
    }
  }

  private async saveData(): Promise<void> {
    // Save to both localStorage and JSON files
    await Promise.all([
      this.saveToStorage(),
      this.saveToFiles()
    ]);
  }

  // User methods
  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email);
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    await this.saveData();
    
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.saveData();
    return this.users[userIndex];
  }

  async deleteUser(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    await this.saveData();
    return true;
  }

  // Organization methods
  getOrganizations(): Organization[] {
    return this.organizations;
  }

  getOrganizationById(id: string): Organization | undefined {
    return this.organizations.find(org => org.id === id);
  }

  async createOrganization(orgData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    const newOrg: Organization = {
      ...orgData,
      id: `org-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.organizations.push(newOrg);
    await this.saveData();
    
    return newOrg;
  }

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | null> {
    const orgIndex = this.organizations.findIndex(org => org.id === id);
    if (orgIndex === -1) return null;

    this.organizations[orgIndex] = {
      ...this.organizations[orgIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.saveData();
    return this.organizations[orgIndex];
  }

  async deleteOrganization(id: string): Promise<boolean> {
    const orgIndex = this.organizations.findIndex(org => org.id === id);
    if (orgIndex === -1) return false;

    this.organizations.splice(orgIndex, 1);
    await this.saveData();
    return true;
  }

  // Order methods
  getOrders(): Order[] {
    return this.orders;
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find(order => order.id === id);
  }

  getOrdersByOrganization(organizationId: string): Order[] {
    return this.orders.filter(order => order.organizationId === organizationId);
  }

  getOrdersByUser(userId: string): Order[] {
    return this.orders.filter(order => order.userId === userId);
  }

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.push(newOrder);
    await this.saveData();
    
    return newOrder;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const orderIndex = this.orders.findIndex(order => order.id === id);
    if (orderIndex === -1) return null;

    this.orders[orderIndex] = {
      ...this.orders[orderIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.saveData();
    return this.orders[orderIndex];
  }

  async deleteOrder(id: string): Promise<boolean> {
    const orderIndex = this.orders.findIndex(order => order.id === id);
    if (orderIndex === -1) return false;

    this.orders.splice(orderIndex, 1);
    await this.saveData();
    return true;
  }

  // Utility methods
  async resetToDefaults(): Promise<void> {
    this.users = this.getDefaultUsers();
    this.organizations = this.getDefaultOrganizations();
    this.orders = this.getDefaultOrders();
    await this.saveData();
  }

  async clearAllData(): Promise<void> {
    this.users = [];
    this.organizations = [];
    this.orders = [];
    await this.saveData();
  }

  // Wait for initialization to complete
  async waitForInitialization(): Promise<void> {
    while (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

export const dataManager = new DataManager(); 