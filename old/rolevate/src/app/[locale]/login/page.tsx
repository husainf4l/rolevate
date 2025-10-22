import LoginImage from '@/components/login/LoginImage';
import GoogleLoginForm from '@/components/login/GoogleLoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left side - Image (2/3 width) */}
      <div className="w-2/3 relative">
        <LoginImage />
      </div>
      
      {/* Right side - Login Form (1/3 width) */}
      <div className="w-1/3 flex items-center justify-center p-8 bg-gray-50">
        <GoogleLoginForm />
      </div>
    </div>
  );
}