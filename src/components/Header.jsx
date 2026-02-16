export default function Header({ isConnected = false }) {
  const user = {
    name: "Azka Julian",
    nim: "M0403241029",
  };
  const onlineCount = 45; 

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0 flex items-center justify-between">
      
      <div className="flex items-center gap-2">
        <div className="relative inline-flex items-center justify-center">
          <span 
            className={`relative inline-flex rounded-full w-2.5 h-2.5 ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300 animate-pulse'
            }`}
          />
          {isConnected && (
            <span className="animate-ping absolute inline-flex w-2.5 h-2.5 rounded-full bg-green-400 opacity-75" />
          )}
        </div>
        <div className="flex flex-col">
          {/* Judul */}
          <h1 className="text-lg font-bold text-gray-900 leading-tight mb-[-3px]">
            KRSWITCH
          </h1>
          {/* Online Count */}
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            {onlineCount} Online
          </span>
        </div>

      </div>


      {/* === BAGIAN KANAN: HANYA PROFIL (Count sudah pindah) === */}
      <div className="flex items-center gap-3 pl-4 border-l border-gray-200 ml-auto">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-gray-900 leading-none mb-1">
            {user.name}
          </p>
          <p className="text-[10px] text-gray-500 font-mono tracking-wide">
            {user.nim}
          </p>
        </div>

        <div className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm shadow-sm cursor-pointer hover:bg-green-700 transition">
          {user.name.charAt(0)}
        </div>
      </div>

    </header>
  );
}