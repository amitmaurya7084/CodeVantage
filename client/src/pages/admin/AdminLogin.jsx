import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useBranding } from "../../context/BrandingContext";
import logoIconWhite from "../../assets/logo-icon-white.png";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const { siteName } = useBranding();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    try {
      await login(values);
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed.");
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 mb-4">
            <img src={logoIconWhite} alt="" className="h-8 w-8" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-bold text-white">{siteName} Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Restricted access — administrators only.</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Email</label>
              <input className="input" {...register("email", { required: "Email is required" })} />
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Password</label>
              <input
                type="password"
                className="input"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default AdminLogin;
