interface LoginScreenProps {
  onLogin: () => void;
}

function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className=" no-drag w-full flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-4 text-white">Welcome Back</h2>

      <input
        type="text"
        placeholder="Enter your name"
        className="w-full bg-gray-800 text-white rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="password"
        placeholder="Enter your password"
        className="w-full bg-gray-800 text-white rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={onLogin}
        className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white font-medium transition-all"
      >
        Login
      </button>
    </div>
  );
}

export default LoginScreen;
