import { NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY_1INCH;
const BASE_URL = 'https://api.1inch.dev';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chainId = searchParams.get('chainId');
  const query = searchParams.get('query');
  const ignoreListed = searchParams.get('ignore_listed');
  const onlyPositiveRating = searchParams.get('only_positive_rating');
  const limit = searchParams.get('limit');

  try {
    const response = await fetch(
      `${BASE_URL}/token/v1.2/${chainId}/search?${new URLSearchParams({
        query: query || '',
        ignore_listed: ignoreListed || 'true',
        only_positive_rating: onlyPositiveRating || 'true',
        limit: limit || '50'
      })}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Token fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}
