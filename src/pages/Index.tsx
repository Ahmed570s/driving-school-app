import LoginForm from "@/components/LoginForm";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card text-card-foreground shadow-lg rounded-2xl p-8 border border-border">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
