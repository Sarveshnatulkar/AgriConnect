/**
 * InputField — accessible, reusable form input with label and error display.
 *
 * Props:
 *  @param {string}   id           Ties the <label> to the <input> via htmlFor
 *  @param {string}   label        Label text shown above the input
 *  @param {string}   type         Input type: text, email, password, etc.
 *  @param {string}   placeholder
 *  @param {string}   value
 *  @param {Function} onChange
 *  @param {string}   error        Error message to display below the input
 *  @param {boolean}  required
 *  @param {boolean}  disabled
 *  @param {string}   className    Extra classes for the wrapper div
 */
const InputField = ({
  id,
  label,
  type        = "text",
  placeholder = "",
  value,
  onChange,
  error,
  required  = false,
  disabled  = false,
  className = "",
  ...rest
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`input-field ${
          error
            ? "border-red-400 focus:ring-red-400"
            : ""
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        {...rest}
      />

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs text-red-500 mt-0.5"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
