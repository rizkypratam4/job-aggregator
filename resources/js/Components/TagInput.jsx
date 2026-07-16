import { useState } from "react";
import { X } from "lucide-react";

const TagInput = ({ label, helperText, tags, onChange, placeholder }) => {
    const [inputValue, setInputValue] = useState("");

    const addTag = (value) => {
        const trimmed = value.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
        }
        setInputValue("");
    };

    const removeTag = (index) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    return (
        <div>
            <label className="label text-headline block mb-1.5">{label}</label>
            <div className="flex flex-wrap items-center gap-2 bg-surface-container-low border border-outline-variant rounded-sm px-3 py-2 min-h-11 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
                {tags.map((tag, idx) => (
                    <span
                        key={idx}
                        className="label bg-surface-container-high text-headline px-2.5 py-1 rounded-full flex items-center gap-1.5"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(idx)}
                            className="hover:text-danger transition-colors cursor-pointer"
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => addTag(inputValue)}
                    placeholder={placeholder}
                    className="flex-1 min-w-[120px] bg-transparent outline-none body-element text-headline placeholder:text-on-surface-variant"
                />
            </div>
            {helperText && <p className="caption text-primary mt-1.5">{helperText}</p>}
        </div>
    );
};

export default TagInput;