import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { User, Organization, Order } from '@/types';

interface SaveDataRequest {
  type: 'users' | 'organizations' | 'orders';
  data: User[] | Organization[] | Order[];
}

// In-memory storage for production (Vercel)
const memoryStorage: {
  users: User[];
  organizations: Organization[];
  orders: Order[];
} = {
  users: [],
  organizations: [],
  orders: []
};

// Check if we're in a serverless environment
const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
  try {
    const body: SaveDataRequest = await request.json();
    const { type, data } = body;

    if (isServerless) {
      // Use in-memory storage for production
      (memoryStorage as Record<string, User[] | Organization[] | Order[]>)[type] = data;
      console.log(`Data saved to memory storage (${type}):`, { count: data.length });
      
      return NextResponse.json({ 
        success: true, 
        message: `${type} data saved successfully to memory storage`,
        count: data.length 
      });
    } else {
      // Use file system for local development
      const dataDir = join(process.cwd(), 'src', 'data');
      const filePath = join(dataDir, `${type}.json`);

      // Ensure the data directory exists
      try {
        await mkdir(dataDir, { recursive: true });
      } catch (dirError) {
        console.log('Data directory already exists or cannot be created:', dirError);
      }

      // Create the JSON structure
      const jsonData = { [type]: data };

      // Write to file
      await writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');

      console.log(`Data saved to ${filePath}:`, { count: data.length });

      return NextResponse.json({ 
        success: true, 
        message: `${type} data saved successfully to file`,
        count: data.length 
      });
    }

  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save data', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'users' | 'organizations' | 'orders';

    if (!type) {
      return NextResponse.json(
        { success: false, message: 'Type parameter is required' },
        { status: 400 }
      );
    }

    if (isServerless) {
      // Use in-memory storage for production
      const data = memoryStorage[type] || [];
      console.log(`Data loaded from memory storage (${type}):`, { count: data.length });

      return NextResponse.json({ 
        success: true, 
        data: data,
        count: data.length 
      });
    } else {
      // Use file system for local development
      const dataDir = join(process.cwd(), 'src', 'data');
      const filePath = join(dataDir, `${type}.json`);

      // Read from file
      const fileContent = await readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);

      console.log(`Data loaded from ${filePath}:`, { count: data[type]?.length || 0 });

      return NextResponse.json({ 
        success: true, 
        data: data[type] || [],
        count: data[type]?.length || 0 
      });
    }

  } catch (error) {
    console.error('Error loading data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load data', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 