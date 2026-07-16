const TextInput = ({value, onChange, placeholder, type = 'text', label, error, className = '', ...rest}) => {
  return (
    <div>
        {label && (
            <label className="label text-headline block mb-1.5">{label}</label>
        )}

          <input
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={`w-full bg-surface-container-low border border-outline-variant rounded-sm px-3 py-2 body-element text-headline placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ${className}`}
              {...rest}
          />

          {error && <p className="text-danger text-sm mt-1">{error}</p>}
    </div>
  )
}

export default TextInput