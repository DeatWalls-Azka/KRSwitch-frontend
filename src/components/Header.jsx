export default function Header({ isConnected = false }) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0 flex flex-row gap-1.5 items-center">
      <div className="relative inline-flex items-center justify-center">
        <span 
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300 animate-pulse'
          }`}
        />
        {isConnected && (
          <span className="animate-ping absolute inline-flex w-2 h-2 rounded-full bg-green-400 opacity-75" />
        )}
      </div>
      <h1 className="m-0 text-lg font-bold text-gray-900">KRSWITCH</h1>
    </header>
  );
}