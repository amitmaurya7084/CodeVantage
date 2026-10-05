import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import Container from "../components/ui/Container";
import { resetPassword } from "../services/authService";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");

  async function onSubmit(values) {
    try {
      await resetPassword(token, values.password);
      toast.success("Password reset. Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "This reset link is invalid or has expired.");
    }
  }

  return (
    <Container size="xs">
      <div className="text-center mb-8">
        <h1 className="text-h1 text-navy">Set a New Password</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Field label="New Password" htmlFor="password" error={errors.password}>
            <input
              id="password"
              type="password"
              className="input"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Minimum 8 characters" },
              })}
            />
          </Field>

          <Field label="Confirm New Password" htmlFor="confirmPassword" error={errors.confirmPassword}>
            <input
              id="confirmPassword"
              type="password"
              className="input"
              {...register("confirmPassword", {
                validate: (value) => value === password || "Passwords do not match",
              })}
            />
          </Field>

          <Button type="submit" disabled={isSubmitting} className="w-full justify-center">
            <KeyRound className="h-4 w-4" /> {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-muted mt-6">
        <Link to="/login" className="text-brand underline">
          Back to Login
        </Link>
      </p>
    </Container>
  );
}

export default ResetPassword;
