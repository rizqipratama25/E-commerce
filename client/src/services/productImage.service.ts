import api from "../lib/axios";

interface UploadProductImagesPayload {
  productId: number;
  images: File[];
}

// Post
export const UploadProductImages = async ({productId, images}: UploadProductImagesPayload) : Promise<void> => {
    if(images.length === 0) return;

    await Promise.all(
        images.map((file) => {
            const formData = new FormData();
            formData.append("product_id", String(productId));
            formData.append("image", file);

            return api.post("/product-image", formData, {
                headers: {
                    "content-type": "multipart/form-data",
                }
            })
        })
    )
}

// Upload New Image when Update product
export const addProductImage = async (productId: number, images: File[]) : Promise<void> => {
    if (!images) return;

    await Promise.all(
        images.map((file) => {
            const fd  = new FormData();
            fd.append("product_id", String(productId));
            fd.append("image", file);

            return api.post("/product-image", fd, {
                headers: {
                    "content-type": "multipart/form-data",
                }
            });
        })
    )
}