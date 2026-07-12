import { useState, type FormEvent } from "react";

interface LoginScreenProps {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  authError: string | null;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #e2e4e9",
  fontSize: 14,
  outline: "none",
};

export default function LoginScreen({ signIn, signUp, authError }: LoginScreenProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSignedUp(false);
    if (mode === "signin") {
      await signIn(email, password);
    } else {
      await signUp(email, password);
      setSignedUp(true);
    }
    setSubmitting(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f8fa",
        padding: 16,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 340,
          maxWidth: "100%",
          boxSizing: "border-box",
          background: "#fff",
          border: "1px solid #e2e4e9",
          borderRadius: 12,
          padding: 28,
        }}
      >
        <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>Run List</h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#8a8f98" }}>
          {mode === "signin" ? "Sign in to your account" : "Create an account"}
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={{ ...inputStyle, marginBottom: 14 }}
        />

        {authError && <div style={{ color: "#dc2626", fontSize: 12.5, marginBottom: 12 }}>{authError}</div>}
        {signedUp && !authError && (
          <div style={{ color: "#2563eb", fontSize: 12.5, marginBottom: 12 }}>
            Check your email to confirm your account, then sign in.
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            background: "#2563eb",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: submitting ? "default" : "pointer",
            opacity: submitting ? 0.7 : 1,
            marginBottom: 12,
          }}
        >
          {submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === "signin" ? "signup" : "signin"));
            setSignedUp(false);
          }}
          style={{ width: "100%", background: "none", border: "none", color: "#2563eb", fontSize: 13, cursor: "pointer" }}
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
