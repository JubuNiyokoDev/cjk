import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Gallery from '@/models/Gallery';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();
    const { items } = await req.json();
    
    await Promise.all(
      items.map((item: { id: string; order: number }) =>
        Gallery.findByIdAndUpdate(item.id, { order: item.order })
      )
    );

    return NextResponse.json({ message: 'Ordre mis à jour' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
