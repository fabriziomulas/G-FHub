import dynamic from "next/dynamic";

const VerifyPageContent = dynamic(() => import("./VerifyPageContent"), {
  ssr: false,
});

export default function VerifyPage() {
  return <VerifyPageContent />;
}