/**
 * Shared form field wrapper — label, the actual input/select/textarea
 * (passed as children), and an error message. Every form in the app
 * (Login, Register, Contact, Verify, ...) should use this instead of
 * hand-rolling its own label+error markup, so spacing and error styling
 * stay identical everywhere.
 *
 * Usage:
 *   <Field label="Email" error={errors.email}>
 *     <input type="email" className="input" {...register("email")} />
 *   </Field>
 */
function Field({ label, labelExtra, htmlFor, error, hint, required = false, className = "", children }) {
  return (
    <div className={className}>
      {label && (
        <div className={`flex items-center mb-1.5 ${labelExtra ? "justify-between" : ""}`}>
          <label htmlFor={htmlFor} className="block text-sm font-medium text-navy">
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
          {labelExtra}
        </div>
      )}
      {children}
      {hint && !error && <p className="text-caption text-muted mt-1">{hint}</p>}
      {error && <p className="text-caption text-danger mt-1">{error.message || error}</p>}
    </div>
  );
}

export default Field;
