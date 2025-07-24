"use client";

import { Suspense } from "react";
import Properties from "@/components/pages/properties";

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Properties />
    </Suspense>
  );
} 