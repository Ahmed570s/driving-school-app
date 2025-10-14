import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Lock, User, Info } from "lucide-react";
import { Card } from "@/components/ui/card";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "instructor" | "admin" | "">("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!email || !password || !role) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call login function from context
      login(email, password, role as "student" | "instructor" | "admin");
      
      toast.success("Login successful!");
      
      // Redirect based on role
      if (role === "admin") navigate("/admin");
      else if (role === "instructor") navigate("/instructor");
      else navigate("/student");
      
    } catch (error) {
      toast.error("Login failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // The key change is here - we need to fix the type mismatch by ensuring
  // we're explicitly handling the string value from Select and converting it to our role type
  const handleRoleChange = (value: string) => {
    // Only set the role if it matches one of our expected values
    if (value === "student" || value === "instructor" || value === "admin" || value === "") {
      setRole(value);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to Driving School</h1>
        <p className="text-muted-foreground">Enter your details to sign in to your account</p>
      </div>
      
      <Card className="p-3 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-blue-900">Test Credentials</h3>
            <div className="text-xs text-blue-800 space-y-0.5">
              <p><strong>Email:</strong> admin@example.com <br></br>
              <strong>Password:</strong> admin <br></br> 
              <strong>Role:</strong> Admin</p>
            </div>
            <p className="text-xs text-blue-700">
              Note: Only admin role is currently in development.
            </p>
          </div>
        </div>
      </Card>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input 
              id="email" 
              placeholder="you@example.com" 
              type="email" 
              autoComplete="email"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      
      <div className="mt-4 text-center text-sm">
        <p className="text-muted-foreground">
          Need help? <a href="#" className="text-primary hover:underline">Contact admin</a>
        </p>
        <p className="text-muted-foreground mt-2">
          Don't have an account?{" "}
          <button 
            onClick={() => navigate("/signup")}
            className="text-primary hover:underline"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
