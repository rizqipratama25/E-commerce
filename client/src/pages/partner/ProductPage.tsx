import { Edit, Eye, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import TitleRoutesAdminPartner from "../../components/TitleRoutesAdminPartner";
import DataTable from "../../components/DataTable";
import { formatRupiah } from "../../utils/function";

import { useProductsPartner } from "../../hooks/product/useProductsPartner";
import { useProductDetail } from "../../hooks/product/useProductDetails";
import { useCreateProduct } from "../../hooks/product/useCreateProduct";
import { useUpdateProduct } from "../../hooks/product/useUpdateProduct";
import { useDeleteProduct } from "../../hooks/product/useDeleteProduct";

import type { Category } from "../../services/category.service";
import type { Data } from "../../services/product.service";
import { useMegaMenuCategories } from "../../hooks/category/useMegaMenuCategories";

import {
    buildHandleProductFormChange,
    buildHandleProductImagesChange,
    buildHandleRemoveNewProductImage,
    buildHandleSubmitNewProduct,
    buildHandleSubmitEditProduct,
    buildHandleDeleteProduct,
    emptyProductForm,
    type ProductFormState,
} from "../../handlers/product.handler";
import ConfirmDialog from "../../components/ConfirmDialog";

/* ======================
  helpers category options (leaf only)
====================== */
type CatOption = { id: number; label: string; level: number; disabled?: boolean };

const flattenLeafCategoryOptions = (cats: Category[], depth = 0): CatOption[] => {
    const rows: CatOption[] = [];

    for (const c of cats) {
        const isLeaf = !c.children || c.children.length === 0;

        if (isLeaf) {
            rows.push({
                id: c.id,
                level: c.level ?? depth + 1,
                label: `${"— ".repeat(depth)}${c.name}`,
                disabled: c.is_active === false,
            });
        }

        if (c.children?.length) {
            rows.push(...flattenLeafCategoryOptions(c.children, depth + 1));
        }
    }

    return rows;
};

export default function ProductPage() {
    /* ========= LIST ========= */
    const { data: productsResponse, isLoading: isProductsLoading } = useProductsPartner();
    const products = productsResponse?.data ?? [];

    /* ========= CATEGORY (leaf only) ========= */
    const { data: categoryTree = [], isLoading: isCategoriesLoading } = useMegaMenuCategories();

    const categoryOptions = useMemo(() => {
        return flattenLeafCategoryOptions(categoryTree).filter((c) => !c.disabled);
    }, [categoryTree]);

    /* ========= DETAIL ========= */
    const [selectedSlug, setSelectedSlug] = useState<string>("");
    const [showDetail, setShowDetail] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const { data: detailResp, isLoading: isDetailLoading } = useProductDetail(
        selectedSlug,
        !!selectedSlug && (showDetail || showEditModal)
    );

    const productDetail = detailResp?.data ?? null;
    const productImages = productDetail?.images ?? [];

    const [activeDetailImageIndex, setActiveDetailImageIndex] = useState(0);
    useEffect(() => {
        if (showDetail) setActiveDetailImageIndex(0);
    }, [showDetail, selectedSlug]);

    /* ========= CREATE/UPDATE/DELETE ========= */
    const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
    const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
    const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

    /* ========= FORM SHARED ========= */
    const [activeTab, setActiveTab] = useState<"info" | "detail">("info");
    const [form, setForm] = useState<ProductFormState>(emptyProductForm);

    const [newImages, setNewImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<Array<{ id: number; image: string }>>([]);

    const addFileInputRef = useRef<HTMLInputElement | null>(null);
    const editFileInputRef = useRef<HTMLInputElement | null>(null);

    // preview urls
    useEffect(() => {
        const urls = newImages.map((f) => URL.createObjectURL(f));
        setPreviewUrls(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [newImages]);

    const resetAllState = () => {
        setForm(emptyProductForm);
        setNewImages([]);
        setExistingImages([]);
        setActiveTab("info");
    };

    /* ========= open/close add ========= */
    const [showAddModal, setShowAddModal] = useState(false);

    const openAdd = () => {
        resetAllState();
        setShowAddModal(true);
    };

    const closeAdd = () => {
        setShowAddModal(false);
        resetAllState();
    };

    /* ========= open edit fill form ========= */
    useEffect(() => {
        if (!showEditModal) return;
        if (!productDetail) return;

        setForm({
            name: productDetail.name ?? "",
            price: String(productDetail.price ?? ""),
            stock: String(productDetail.stock ?? ""),
            product_specification: productDetail.product_specification ?? "",
            product_information: productDetail.product_information ?? "",
            category_id: String((productDetail as any)?.category?.id ?? (productDetail as any)?.category_id ?? ""),
            height: String(productDetail.height ?? ""),
            width: String(productDetail.width ?? ""),
            length: String(productDetail.length ?? ""),
            weight: String(productDetail.weight ?? ""),
        });

        setExistingImages(productDetail.images ?? []);
        setNewImages([]);
        setActiveTab("info");
    }, [showEditModal, productDetail]);

    /* ========= category validation (optional) ========= */
    const selectedCategoryExists = useMemo(() => {
        if (!form.category_id) return true;
        return categoryOptions.some((o) => String(o.id) === String(form.category_id));
    }, [categoryOptions, form.category_id]);

    /* ========= HANDLERS (from handler file) ========= */
    const handleFormChange = buildHandleProductFormChange(setForm);
    const handleImagesChange = buildHandleProductImagesChange(setNewImages);
    const removeNewImage = buildHandleRemoveNewProductImage(setNewImages);
    const handleDelete = buildHandleDeleteProduct(deleteProduct);

    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Data | null>(null);
    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        handleDelete(deleteTarget);
        setShowConfirm(false);
        setDeleteTarget(null);
    }

    const handleSubmitCreate = buildHandleSubmitNewProduct(
        form,
        newImages,
        createProduct as any,
        { closeAdd }
    );

    const handleSubmitUpdate = buildHandleSubmitEditProduct(
        selectedSlug,
        form,
        newImages,
        updateProduct as any,
        { setShowEditModal, setSelectedSlug, resetAllState }
    );

    const handlePickImages = (mode: "add" | "edit") => {
        if (mode === "add") addFileInputRef.current?.click();
        else editFileInputRef.current?.click();
    };

    /* ========= open detail/edit ========= */
    const openDetail = (slug: string) => {
        setSelectedSlug(slug);
        setShowDetail(true);
    };

    const openEdit = (slug: string) => {
        setSelectedSlug(slug);
        setShowEditModal(true);
    };

    /* ========= TABLE ========= */
    const productColumns = [
        {
            header: "Produk",
            accessor: "name",
            render: (row: Data) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {row.thumbnail?.image ? (
                            <img
                                src={`${row.thumbnail.image}`}
                                alt={row.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xs text-gray-400">No Img</span>
                        )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{row.name}</span>
                </div>
            ),
        },
        {
            header: "ID",
            accessor: "id",
            render: (row: Data) => <span className="text-sm text-gray-700">{row.id}</span>,
        },
        {
            header: "Kategori",
            accessor: "category",
            render: (row: Data) => <span className="text-sm text-gray-700">{row.category?.name ?? "-"}</span>,
        },
        {
            header: "Harga",
            accessor: "price",
            render: (row: Data) => <span className="text-sm font-medium text-gray-900">{formatRupiah(row.price)}</span>,
        },
        {
            header: "Stok",
            accessor: "stock",
            render: (row: Data) => (
                <span
                    className={`text-sm font-medium ${row.stock === 0 ? "text-red-600" : row.stock < 10 ? "text-yellow-600" : "text-gray-900"
                        }`}
                >
                    {row.stock} unit
                </span>
            ),
        },
        {
            header: "Status",
            accessor: "is_active",
            render: (row: Data) => (
                <span
                    className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${row.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                >
                    {row.is_active ? "Aktif" : "Tidak Aktif"}
                </span>
            ),
        },
    ];

    const productActions = [
        { label: "Lihat", icon: Eye, color: "text-blue-600", hoverColor: "bg-blue-50", onClick: (row: Data) => openDetail(row.slug) },
        { label: "Edit", icon: Edit, color: "text-[#F26A24]", hoverColor: "bg-orange-50", onClick: (row: Data) => openEdit(row.slug) },
        {
            label: "Hapus", icon: Trash2, color: "text-red-600", hoverColor: "bg-red-50", onClick: (row: Data) => {
                setDeleteTarget(row);
                setShowConfirm(true);
            }
        },
    ];

    if (isProductsLoading) return <p>Loading...</p>;

    return (
        <>
            <TitleRoutesAdminPartner title="Produk" description="Kelola seluruh produk yang tersedia di toko Anda.">
                <button
                    className="flex items-center gap-2 bg-[#F26A24] text-white mt-3 px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                    onClick={openAdd}
                >
                    <Plus size={20} />
                    Tambah Produk
                </button>
            </TitleRoutesAdminPartner>

            <DataTable columns={productColumns} data={products} actions={productActions} />

            {/* ===================== DETAIL MODAL ===================== */}
            {showDetail && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Detail Produk</h2>
                            <button
                                onClick={() => {
                                    setShowDetail(false);
                                    setSelectedSlug("");
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {isDetailLoading || !productDetail ? (
                                <p className="text-sm text-gray-500">Memuat detail...</p>
                            ) : (
                                <>
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="w-full md:w-56">
                                            <div className="w-full h-56 bg-gray-100 rounded-lg overflow-hidden mb-3">
                                                <img
                                                    src={`${productImages[activeDetailImageIndex]?.image}`}
                                                    alt={productDetail.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {productImages.length > 1 && (
                                                <div className="flex gap-2 overflow-x-auto">
                                                    {productImages.map((img: any, idx: number) => (
                                                        <button
                                                            key={img.id}
                                                            type="button"
                                                            onClick={() => setActiveDetailImageIndex(idx)}
                                                            className={`w-16 h-16 rounded-md overflow-hidden border ${idx === activeDetailImageIndex ? "border-[#F26A24]" : "border-gray-200"
                                                                }`}
                                                        >
                                                            <img
                                                                src={`${img.image}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-2xl font-bold">{productDetail.name}</h3>
                                                    <p className="text-sm text-gray-500">{productDetail.category?.path}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-[#F26A24]">{formatRupiah(productDetail.price)}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 space-y-3">
                                                <div>
                                                    <div className="text-xs font-semibold text-gray-500 uppercase">Spesifikasi</div>
                                                    <p className="text-sm text-gray-700">{productDetail.product_specification}</p>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-semibold text-gray-500 uppercase">Informasi</div>
                                                    <p className="text-sm text-gray-700">{productDetail.product_information}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Info Produk</div>
                                            <div className="text-sm text-gray-700 space-y-2">
                                                <div className="flex justify-between">
                                                    <span>ID</span>
                                                    <span className="font-medium">{productDetail.id}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Kategori</span>
                                                    <span className="font-medium">{productDetail.category?.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Stok</span>
                                                    <span className="font-medium">{productDetail.stock}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Dimensi</div>
                                            <div className="text-sm text-gray-700 space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Berat</span>
                                                    <span className="font-medium">{productDetail.weight} gr</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Tinggi</span>
                                                    <span className="font-medium">{productDetail.height} cm</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Lebar</span>
                                                    <span className="font-medium">{productDetail.width} cm</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Panjang</span>
                                                    <span className="font-medium">{productDetail.length} cm</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        <button
                                            className="flex-1 bg-[#F26A24] text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90"
                                            onClick={() => {
                                                setShowDetail(false);
                                                setShowEditModal(true);
                                            }}
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                <Edit size={18} /> Edit Produk
                                            </span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===================== ADD MODAL ===================== */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Tambah Produk</h2>
                            <button onClick={closeAdd} className="p-2 rounded hover:bg-gray-100">
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitCreate} className="space-y-4">
                            {/* Tabs */}
                            <div className="border-b border-gray-200 mb-3">
                                <div className="flex gap-8">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("info")}
                                        className={`pb-3 text-sm font-semibold border-b-2 ${activeTab === "info" ? "border-[#F26A24] text-[#F26A24]" : "border-transparent text-gray-600"
                                            }`}
                                    >
                                        Spesifikasi Produk
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("detail")}
                                        className={`pb-3 text-sm font-semibold border-b-2 ${activeTab === "detail"
                                            ? "border-[#F26A24] text-[#F26A24]"
                                            : "border-transparent text-gray-600"
                                            }`}
                                    >
                                        Informasi Produk
                                    </button>
                                </div>
                            </div>

                            {activeTab === "info" ? (
                                <>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleFormChange}
                                        placeholder="Nama Produk"
                                        className="w-full border rounded-lg p-2"
                                        required
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            name="price"
                                            type="number"
                                            value={form.price}
                                            onChange={handleFormChange}
                                            placeholder="Harga"
                                            className="border rounded-lg p-2"
                                            required
                                        />
                                        <input
                                            name="stock"
                                            type="number"
                                            value={form.stock}
                                            onChange={handleFormChange}
                                            placeholder="Stok"
                                            className="border rounded-lg p-2"
                                            required
                                        />
                                    </div>

                                    <select
                                        name="category_id"
                                        value={form.category_id}
                                        onChange={handleFormChange}
                                        className="w-full border rounded-lg p-2"
                                        required
                                        disabled={isCategoriesLoading}
                                    >
                                        <option value="">{isCategoriesLoading ? "Memuat Kategori..." : "Pilih Kategori"}</option>
                                        {categoryOptions.map((opt) => (
                                            <option key={opt.id} value={opt.id}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>

                                    {!selectedCategoryExists && (
                                        <p className="text-xs text-red-500">
                                            Kategori ini tidak tersedia (bukan leaf/aktif). Silakan pilih kategori leaf yang benar.
                                        </p>
                                    )}

                                    {/* Images */}
                                    <div className="border rounded-lg p-3 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handlePickImages("add")}
                                                className="inline-flex items-center px-3 py-2 border border-[#F26A24] rounded-md text-sm font-medium text-[#F26A24] hover:bg-orange-50"
                                            >
                                                Browse files
                                            </button>
                                            <span className="text-xs text-gray-500">
                                                {newImages.length === 0 ? "Belum ada file dipilih" : `${newImages.length} file dipilih`}
                                            </span>
                                        </div>

                                        <input
                                            ref={addFileInputRef}
                                            type="file"
                                            accept="image/jpg, image/jpeg, image/png"
                                            multiple
                                            className="hidden"
                                            onChange={handleImagesChange}
                                        />

                                        {newImages.length > 0 && (
                                            <div className="space-y-2">
                                                {newImages.map((file, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-2 border rounded-lg bg-gray-50">
                                                        <div className="w-14 h-14 rounded-md overflow-hidden bg-white border">
                                                            <img src={previewUrls[idx]} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewImage(idx)}
                                                            className="text-gray-400 hover:text-red-500 text-xl leading-none"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <textarea
                                        name="product_specification"
                                        value={form.product_specification}
                                        onChange={handleFormChange}
                                        placeholder="Spesifikasi produk"
                                        className="w-full border rounded-lg p-2"
                                        rows={3}
                                        required
                                    />
                                    <textarea
                                        name="product_information"
                                        value={form.product_information}
                                        onChange={handleFormChange}
                                        placeholder="Informasi produk"
                                        className="w-full border rounded-lg p-2"
                                        rows={3}
                                        required
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <input name="height" value={form.height} onChange={handleFormChange} placeholder="Tinggi (cm)" className="border rounded-lg p-2" />
                                        <input name="width" value={form.width} onChange={handleFormChange} placeholder="Lebar (cm)" className="border rounded-lg p-2" />
                                        <input name="length" value={form.length} onChange={handleFormChange} placeholder="Panjang (cm)" className="border rounded-lg p-2" />
                                        <input name="weight" value={form.weight} onChange={handleFormChange} placeholder="Berat (gr)" className="border rounded-lg p-2" />
                                    </div>
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={isCreating || !selectedCategoryExists}
                                className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-60"
                            >
                                {isCreating ? "Menyimpan..." : "Simpan Produk"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ===================== EDIT MODAL ===================== */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Edit Produk</h2>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    resetAllState();
                                }}
                                className="p-2 rounded hover:bg-gray-100"
                            >
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={(e: FormEvent) => {
                                // guard extra (optional)
                                if (!selectedCategoryExists) {
                                    e.preventDefault();
                                    return;
                                }
                                handleSubmitUpdate(e);
                            }}
                            className="space-y-4"
                        >
                            {/* Tabs */}
                            <div className="border-b border-gray-200 mb-3">
                                <div className="flex gap-8">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("info")}
                                        className={`pb-3 text-sm font-semibold border-b-2 ${activeTab === "info" ? "border-[#F26A24] text-[#F26A24]" : "border-transparent text-gray-600"
                                            }`}
                                    >
                                        Spesifikasi Produk
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("detail")}
                                        className={`pb-3 text-sm font-semibold border-b-2 ${activeTab === "detail"
                                            ? "border-[#F26A24] text-[#F26A24]"
                                            : "border-transparent text-gray-600"
                                            }`}
                                    >
                                        Informasi Produk
                                    </button>
                                </div>
                            </div>

                            {activeTab === "info" ? (
                                <>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleFormChange}
                                        placeholder="Nama Produk"
                                        className="w-full border rounded-lg p-2"
                                        required
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            name="price"
                                            type="number"
                                            value={form.price}
                                            onChange={handleFormChange}
                                            placeholder="Harga"
                                            className="border rounded-lg p-2"
                                            required
                                        />
                                        <input
                                            name="stock"
                                            type="number"
                                            value={form.stock}
                                            onChange={handleFormChange}
                                            placeholder="Stok"
                                            className="border rounded-lg p-2"
                                            required
                                        />
                                    </div>

                                    <select
                                        name="category_id"
                                        value={form.category_id}
                                        onChange={handleFormChange}
                                        className="w-full border rounded-lg p-2"
                                        required
                                        disabled={isCategoriesLoading}
                                    >
                                        <option value="">{isCategoriesLoading ? "Memuat Kategori..." : "Pilih Kategori"}</option>
                                        {categoryOptions.map((opt) => (
                                            <option key={opt.id} value={opt.id}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>

                                    {!selectedCategoryExists && (
                                        <p className="text-xs text-red-500">
                                            Kategori produk ini sekarang tidak tersedia (bukan leaf/aktif). Pilih kategori leaf lain.
                                        </p>
                                    )}

                                    {/* Existing images */}
                                    {existingImages.length > 0 && (
                                        <div className="border rounded-lg p-3 space-y-2 bg-gray-50">
                                            <div className="text-sm font-semibold text-gray-700">Gambar lama</div>
                                            <div className="flex gap-2 overflow-x-auto">
                                                {existingImages.map((img) => (
                                                    <div key={img.id} className="w-16 h-16 rounded-md overflow-hidden border bg-white shrink-0">
                                                        <img
                                                            src={`${img.image}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                *Belum ada fitur hapus gambar lama per item (nanti bisa ditambah).
                                            </div>
                                        </div>
                                    )}

                                    {/* New images */}
                                    <div className="border rounded-lg p-3 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handlePickImages("edit")}
                                                className="inline-flex items-center px-3 py-2 border border-[#F26A24] rounded-md text-sm font-medium text-[#F26A24] hover:bg-orange-50"
                                            >
                                                Tambah gambar baru
                                            </button>
                                            <span className="text-xs text-gray-500">
                                                {newImages.length === 0 ? "Belum ada file dipilih" : `${newImages.length} file dipilih`}
                                            </span>
                                        </div>

                                        <input
                                            ref={editFileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleImagesChange}
                                        />

                                        {newImages.length > 0 && (
                                            <div className="space-y-2">
                                                {newImages.map((file, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-2 border rounded-lg bg-gray-50">
                                                        <div className="w-14 h-14 rounded-md overflow-hidden bg-white border">
                                                            <img src={previewUrls[idx]} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewImage(idx)}
                                                            className="text-gray-400 hover:text-red-500 text-xl leading-none"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <textarea
                                        name="product_specification"
                                        value={form.product_specification}
                                        onChange={handleFormChange}
                                        placeholder="Spesifikasi produk"
                                        className="w-full border rounded-lg p-2"
                                        rows={3}
                                        required
                                    />
                                    <textarea
                                        name="product_information"
                                        value={form.product_information}
                                        onChange={handleFormChange}
                                        placeholder="Informasi produk"
                                        className="w-full border rounded-lg p-2"
                                        rows={3}
                                        required
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <input name="height" value={form.height} onChange={handleFormChange} placeholder="Tinggi (cm)" className="border rounded-lg p-2" />
                                        <input name="width" value={form.width} onChange={handleFormChange} placeholder="Lebar (cm)" className="border rounded-lg p-2" />
                                        <input name="length" value={form.length} onChange={handleFormChange} placeholder="Panjang (cm)" className="border rounded-lg p-2" />
                                        <input name="weight" value={form.weight} onChange={handleFormChange} placeholder="Berat (gr)" className="border rounded-lg p-2" />
                                    </div>
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={isUpdating || !selectedCategoryExists}
                                className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-60"
                            >
                                {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showConfirm && (
                <ConfirmDialog
                    title="Hapus Produk"
                    description={`Yakin ingin menghapus Produk "${deleteTarget?.name}"?`}
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => {
                        setShowConfirm(false);
                        setDeleteTarget(null);
                    }}
                />
            )}

            {/* status delete */}
            {isDeleting && <p className="text-xs text-gray-500 mt-2">Menghapus produk...</p>}
        </>
    );
}
