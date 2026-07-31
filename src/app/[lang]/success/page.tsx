import { Suspense } from "react";
import { CheckCircle } from "lucide-react";
import { SuccessContent } from "@/components/checkout/SuccessContent";

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary">
      <div className="text-center glass p-12 rounded-2xl max-w-md">
        <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Pagamento riuscito!
        </h1>
      </div>
    </div>
  );
}
