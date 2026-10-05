import Button from "../components/ui/Button";

function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <p className="text-brand font-bold text-sm mb-2">404</p>
      <h1 className="text-2xl font-bold text-navy mb-2">Page Not Found</h1>
      <p className="text-muted mb-6">The page you're looking for doesn't exist.</p>
      <Button to="/">Back to Home</Button>
    </div>
  );
}

export default NotFound;
