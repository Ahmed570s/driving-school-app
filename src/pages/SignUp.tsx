import { SignupForm } from "@/components/SignupForm"

export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card text-card-foreground shadow-lg rounded-2xl p-8 border border-border">
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
