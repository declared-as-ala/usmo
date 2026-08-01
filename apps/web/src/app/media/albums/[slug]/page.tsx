'use client';

import React from 'react';
import { AlbumDetail } from '../../../../views/AlbumDetail';
import { useParams } from 'next/navigation';

export default function AlbumDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  return <AlbumDetail key={slug} slug={slug} />;
}
