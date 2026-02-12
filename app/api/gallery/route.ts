import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Gallery from '@/models/Gallery';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    const items = await Gallery.find().sort({ order: 1 });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    const maxOrder = await Gallery.findOne().sort({ order: -1 });
    const item = await Gallery.create({ ...data, order: (maxOrder?.order || 0) + 1 });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
