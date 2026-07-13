"use client";

import { Suspense } from "react";
import FilterChips from "./FilterChips";

export default function FilterChipsBoundary({ candidateSlug }: { candidateSlug: string }) {
  return (
    <Suspense fallback={null}>
      <FilterChips candidateSlug={candidateSlug} />
    </Suspense>
  );
}
