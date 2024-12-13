import { NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY_1INCH;
const BASE_URL = 'https://api.1inch.dev/price/v1.1';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get('chainId') || '1';
    const addresses = searchParams.get('addresses');

    const url = addresses 
      ? `${BASE_URL}/${chainId}/${addresses}`
      : `${BASE_URL}/${chainId}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Price fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { chainId, tokens } = await request.json();

    const response = await fetch(`${BASE_URL}/${chainId || '1'}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tokens })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Price fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
