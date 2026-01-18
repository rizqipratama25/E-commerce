type Props = {
    checked: boolean;
    onChange: (value: boolean) => void;
    label?: string;
    className?: string;
}

const Switch = ({ checked, onChange, label, className }: Props) => {
    const handleClick = () => {
        onChange(!checked);
    }

    return (
        <div className={`flex items-center justify-between gap-3 ${className ?? ""}`}>
            {label && (
                <span className="text-sm text-gray-700">
                    {label}
                </span>
            )}

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={handleClick}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-green-500" : "bg-red-500"
                    }`}
            >
                <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${checked ? "translate-x-5" : "translate-x-1"
                        }`}
                />
            </button>
        </div>
    )
}

export default Switch