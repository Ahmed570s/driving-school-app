
import LoginForm from "@/components/LoginForm";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
