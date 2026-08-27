export default function WakeupSplash() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 rounded-full border-[#1D1D1F]/20 border-t-[#1D1D1F] animate-spin" />
        <p className="text-sm text-[#6E6E73] font-medium">Loading Data...</p>
      </div>
    </div>
  );
}