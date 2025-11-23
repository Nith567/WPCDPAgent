import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the content metadata file
    const filePath = path.join(process.cwd(), 'temp', 'content-metadata.json');
    const fileContents = readFileSync(filePath, 'utf8');
    const contentMetadata = JSON.parse(fileContents);
    
    return NextResponse.json(contentMetadata);
  } catch (error) {
    console.error('Error reading content metadata:', error);
    return NextResponse.json(
      { error: 'Failed to read content metadata' },
      { status: 500 }
    );
  }
}
