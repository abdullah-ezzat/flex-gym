export function Loader() {
  return (
    <div className="flex justify-center items-center">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-red-500/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-t-red-500 border-r-red-500 animate-spin"></div>
      </div>
    </div>
  );
}
