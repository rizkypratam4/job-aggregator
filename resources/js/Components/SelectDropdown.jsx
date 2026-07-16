import { ChevronDown } from "lucide-react";

const SelectDropdown = ({ label, options, value, onChange, name }) => {
    return (
        <div className="relative inline-block">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="appearance-none label bg-white border border-outline-variant rounded-sm pl-3 pr-9 py-1.5 h-9 text-headline font-medium cursor-pointer focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            >
                <option value="">{label}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
        </div>
    );
};

export default SelectDropdown;