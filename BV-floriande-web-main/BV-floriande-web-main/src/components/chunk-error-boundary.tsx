/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import React from 'react';

export default function ChunkErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  // Using simplified approach for Next.js 15 compatibility
  return <>{children}</>;
}
