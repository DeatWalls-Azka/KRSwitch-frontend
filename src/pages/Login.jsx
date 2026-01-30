export default function Login() {
  return (
    <div className="h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Login KRSwitch</h1>
        <button className="bg-white border border-gray-300 px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition mx-auto">
          <span>Login with Google</span>
        </button>
      </div>
    </div>
  );
}