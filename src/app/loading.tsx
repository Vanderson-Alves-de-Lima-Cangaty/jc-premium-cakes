export default function RootLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="h-full w-full animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
        Preparando delícias para você...
      </p>
    </div>
  );
}
