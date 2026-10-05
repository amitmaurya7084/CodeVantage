import Button from "../components/ui/Button";

function ComingSoon({ title, step }) {
  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <h1 className="text-2xl font-bold text-navy mb-2">{title}</h1>
      <p className="text-muted mb-6">
        This page is built in {step} of the development plan. It isn't wired up yet.
      </p>
      <Button to="/">Back to Home</Button>
    </div>
  );
}

export default ComingSoon;
