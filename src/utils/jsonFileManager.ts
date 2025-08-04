import { User, Organization, Order } from '@/types';

interface JsonData {
  users: User[];
  organizations: Organization[];
  orders: Order[];
}

class JsonFileManager {
  private static instance: JsonFileManager;

  private constructor() {}

  static getInstance(): JsonFileManager {
    if (!JsonFileManager.instance) {
      JsonFileManager.instance = new JsonFileManager();
    }
    return JsonFileManager.instance;
  }

  // Save users to JSON file
  async saveUsersToFile(users: User[]): Promise<void> {
    try {
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'users',
          data: users
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save users: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Users saved to JSON file successfully:', result);
    } catch (error) {
      console.error('Failed to save users to JSON file:', error);
      throw error;
    }
  }

  // Save organizations to JSON file
  async saveOrganizationsToFile(organizations: Organization[]): Promise<void> {
    try {
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'organizations',
          data: organizations
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save organizations: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Organizations saved to JSON file successfully:', result);
    } catch (error) {
      console.error('Failed to save organizations to JSON file:', error);
      throw error;
    }
  }

  // Save orders to JSON file
  async saveOrdersToFile(orders: Order[]): Promise<void> {
    try {
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'orders',
          data: orders
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save orders: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Orders saved to JSON file successfully:', result);
    } catch (error) {
      console.error('Failed to save orders to JSON file:', error);
      throw error;
    }
  }

  // Load users from JSON file
  async loadUsersFromFile(): Promise<User[]> {
    try {
      const response = await fetch('/api/save-data?type=users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load users: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Users loaded from JSON file successfully:', { count: result.data.length });
      return result.data || [];
    } catch (error) {
      console.error('Failed to load users from JSON file:', error);
      return [];
    }
  }

  // Load organizations from JSON file
  async loadOrganizationsFromFile(): Promise<Organization[]> {
    try {
      const response = await fetch('/api/save-data?type=organizations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load organizations: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Organizations loaded from JSON file successfully:', { count: result.data.length });
      return result.data || [];
    } catch (error) {
      console.error('Failed to load organizations from JSON file:', error);
      return [];
    }
  }

  // Load orders from JSON file
  async loadOrdersFromFile(): Promise<Order[]> {
    try {
      const response = await fetch('/api/save-data?type=orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load orders: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Orders loaded from JSON file successfully:', { count: result.data.length });
      return result.data || [];
    } catch (error) {
      console.error('Failed to load orders from JSON file:', error);
      return [];
    }
  }

  // Export all data to JSON files
  async exportAllData(users: User[], organizations: Organization[], orders: Order[]): Promise<void> {
    await Promise.all([
      this.saveUsersToFile(users),
      this.saveOrganizationsToFile(organizations),
      this.saveOrdersToFile(orders)
    ]);
  }

  // Import all data from JSON files
  async importAllData(): Promise<{ users: User[]; organizations: Organization[]; orders: Order[] }> {
    const [users, organizations, orders] = await Promise.all([
      this.loadUsersFromFile(),
      this.loadOrganizationsFromFile(),
      this.loadOrdersFromFile()
    ]);

    return { users, organizations, orders };
  }
}

export const jsonFileManager = JsonFileManager.getInstance(); 