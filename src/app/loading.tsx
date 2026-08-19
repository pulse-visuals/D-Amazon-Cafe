export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-jungle-100 border-t-jungle-600 animate-spin motion-reduce:animate-none" />
        <p className="text-sm font-semibold text-jungle-400">Loading D&apos;Amazon Cafe...</p>
      </div>
    </div>
  );
}
