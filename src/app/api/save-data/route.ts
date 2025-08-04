import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { User, Organization, Order } from '@/types';

interface SaveDataRequest {
  type: 'users' | 'organizations' | 'orders';
  data: User[] | Organization[] | Order[];
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveDataRequest = await request.json();
    const { type, data } = body;

    // Define the file path
    const dataDir = join(process.cwd(), 'src', 'data');
    const filePath = join(dataDir, `${type}.json`);

    // Create the JSON structure
    const jsonData = { [type]: data };

    // Write to file
    await writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');

    console.log(`Data saved to ${filePath}:`, { count: data.length });

    return NextResponse.json({ 
      success: true, 
      message: `${type} data saved successfully`,
      count: data.length 
    });

  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save data' },
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

    // Define the file path
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

  } catch (error) {
    console.error('Error loading data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load data' },
      { status: 500 }
    );
  }
} 