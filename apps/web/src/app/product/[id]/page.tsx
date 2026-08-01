'use client';

import React from 'react';
import { ProductDetail } from '../../../views/ProductDetail';
import { useParams } from 'next/navigation';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  return <ProductDetail key={id} productId={id} />;
}
