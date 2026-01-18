export interface ConfirmDialogProps {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}


export const ConfirmDialog = ({
    title,
    description,
    confirmText = "Ya",
    cancelText = "Batal",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg p-4 w-full max-w-sm">
                <h2 className="text-lg font-semibold mb-2">{title}</h2>
                {description && (
                    <p className="text-sm text-gray-600 mb-4">{description}</p>
                )}
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel} // ⬅️ pakai di tombol batal
                        className="px-3 py-1.5 text-sm rounded border border-gray-300 cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-3 py-1.5 text-sm rounded bg-[#F26A24] text-white cursor-pointer"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};


export default ConfirmDialog;