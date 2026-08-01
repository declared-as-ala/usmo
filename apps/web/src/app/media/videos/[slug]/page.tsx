'use client';

import React from 'react';
import { VideoDetail } from '../../../../views/VideoDetail';
import { useParams } from 'next/navigation';

export default function VideoDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  return <VideoDetail key={slug} slug={slug} />;
}
