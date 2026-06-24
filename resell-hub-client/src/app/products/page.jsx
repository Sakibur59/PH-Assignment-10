import { Suspense } from "react";
import { Spinner } from "@heroui/react";
import ProductsContent from "./ProductsContent";

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="success" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}