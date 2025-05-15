
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const Instructor = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Protect route - redirect if not instructor
    if (role !== "instructor") {
      navigate("/");
    }
  }, [role, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-xl">Welcome to the Instructor Dashboard</p>
          <p className="text-gray-500 mt-2">This is a placeholder for the instructor interface.</p>
        </div>
      </div>
    </div>
  );
};

export default Instructor;
