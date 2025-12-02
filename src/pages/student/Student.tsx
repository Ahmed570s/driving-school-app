import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/ui/page-layout";

const Student = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Protect route - redirect if not student
    if (role !== "student") {
      navigate("/");
    }
  }, [role, navigate]);
  
  const handleLogout = async () => {
    try {
      await logout();
    navigate("/");
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-xl">Welcome to the Student Dashboard</p>
          <p className="text-gray-500 mt-2">This is a placeholder for the student interface.</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Student;
