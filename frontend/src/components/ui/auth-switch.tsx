import { cn } from "@/lib/utils";

interface AuthSwitchProps {
  mode: "signin" | "signup";
  onToggle: () => void;
}

export const AuthSwitch = ({ mode, onToggle }: AuthSwitchProps) => {
  return (
    <div className={cn("text-center text-sm text-slate-500 mt-6")}>
      {mode === "signin" ? (
        <p>
          Don't have an account?{" "}
          <button 
            onClick={onToggle}
            className="font-bold text-slate-900 hover:underline transition-all"
          >
            Sign Up
          </button>
        </p>
      ) : (
        <p>
          Already have an account?{" "}
          <button 
            onClick={onToggle}
            className="font-bold text-slate-900 hover:underline transition-all"
          >
            Sign In
          </button>
        </p>
      )}
    </div>
  );
};

export default AuthSwitch;