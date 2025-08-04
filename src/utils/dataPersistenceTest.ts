// Test utility for data persistence
import { dataManager } from './dataManager';

export async function testDataPersistence() {
  console.log('=== Testing Data Persistence ===');
  
  // Wait for data manager to initialize
  await dataManager.waitForInitialization();
  
  // Test 1: Check initial data
  console.log('1. Initial data:');
  console.log('Users:', dataManager.getUsers().length);
  console.log('Organizations:', dataManager.getOrganizations().length);
  console.log('Orders:', dataManager.getOrders().length);
  
  // Test 2: Create a new user
  console.log('\n2. Creating a new user...');
  const newUser = await dataManager.createUser({
    email: 'test@example.com',
    name: 'Test User',
    role: 'org_user',
    organizationId: 'org-1'
  });
  console.log('New user created:', newUser);
  
  // Test 3: Check if user was saved
  console.log('\n3. Checking if user was saved...');
  const savedUser = dataManager.getUserById(newUser.id);
  console.log('Saved user found:', savedUser ? 'Yes' : 'No');
  
  // Test 4: Create a new organization
  console.log('\n4. Creating a new organization...');
  const newOrg = await dataManager.createOrganization({
    name: 'Test Organization',
    description: 'A test organization'
  });
  console.log('New organization created:', newOrg);
  
  // Test 5: Create a new order
  console.log('\n5. Creating a new order...');
  const newOrder = await dataManager.createOrder({
    title: 'Test Order',
    description: 'A test order',
    status: 'pending',
    userId: newUser.id,
    organizationId: newOrg.id
  });
  console.log('New order created:', newOrder);
  
  // Test 6: Check final data counts
  console.log('\n6. Final data counts:');
  console.log('Users:', dataManager.getUsers().length);
  console.log('Organizations:', dataManager.getOrganizations().length);
  console.log('Orders:', dataManager.getOrders().length);
  
  // Test 7: Update an order
  console.log('\n7. Updating an order...');
  const updatedOrder = await dataManager.updateOrder(newOrder.id, {
    status: 'in_progress'
  });
  console.log('Order updated:', updatedOrder);
  
  console.log('\n=== Data Persistence Test Complete ===');
  
  return {
    users: dataManager.getUsers().length,
    organizations: dataManager.getOrganizations().length,
    orders: dataManager.getOrders().length
  };
}

export async function resetDataToDefaults() {
  console.log('=== Resetting Data to Defaults ===');
  await dataManager.resetToDefaults();
  console.log('Data reset complete');
  
  console.log('Current data counts:');
  console.log('Users:', dataManager.getUsers().length);
  console.log('Organizations:', dataManager.getOrganizations().length);
  console.log('Orders:', dataManager.getOrders().length);
} 