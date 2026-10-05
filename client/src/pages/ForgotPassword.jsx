import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import Container from "../components/ui/Container";
import { requestPasswordReset } from "../services/authService";

function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  async function onSubmit(values) {
    try {
      const data = await requestPasswordReset(values.email);
      toast.success(data.message);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <Container size="xs">
      <div className="text-center mb-8">
        <h1 className="text-h1 text-navy">Forgot Password</h1>
        <p className="text-muted mt-1">We'll email you a link to reset it.</p>
      </div>

      <Card className="p-6">
        {isSubmitSuccessful ? (
          <p className="text-sm text-success text-center">
            If an account exists for that email, a reset link is on its way.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <Field label="Email" htmlFor="email" error={errors.email}>
              <input
                id="email"
                type="email"
                className="input"
                {...register("email", { required: "Email is required" })}
              />
            </Field>
            <Button type="submit" disabled={isSubmitting} className="w-full justify-center">
              <Mail className="h-4 w-4" /> {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}
      </Card>

      <p className="text-center text-sm text-muted mt-6">
        <Link to="/login" className="text-brand underline">
          Back to Login
        </Link>
      </p>
    </Container>
  );
}

export default ForgotPassword;
