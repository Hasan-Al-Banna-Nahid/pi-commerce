"use client";
import { useState, useRef } from "react";
import { useProducts } from "@/app/hooks/useProduct";
import { FiUpload, FiX } from "react-icons/fi";
import axios from "axios";
import { toast } from "sonner";
import api from "@/app/lib/axios";

const CATEGORY_OPTIONS = [
  { value: "laptop", label: "Laptop" },
  { value: "mobile", label: "Mobile Phone" },
  { value: "tablet", label: "Tablet" },
  { value: "digital_device", label: "Digital Device" },
  { value: "automobile", label: "Automobile" },
  { value: "accessories", label: "Accessories" },
];

type FormData = {
  name: string;
  description: string;
  price: number;
  costPrice: number;
  quantity: number;
  category: string;
  stock: number;
  sku?: string;
  subCategory?: string;
  brand?: string;
  model?: string;
};

const CreateProductForm = () => {
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    price: 0,
    costPrice: 0,
    quantity: 0,
    category: "",
    stock: 0,
  });
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  type FormErrors = Partial<Record<keyof FormData, string>> & {
    images?: string;
  };

  const [errors, setErrors] = useState<FormErrors>({});

  const generateSKU = () => {
    return `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setImages(fileArray);

      const previews = fileArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls(previews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviewUrls = [...previewUrls];
    newImages.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    setImages(newImages);
    setPreviewUrls(newPreviewUrls);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!form.name.trim()) {
      newErrors.name = "Product name is required";
      isValid = false;
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    }

    if (form.price <= 0) {
      newErrors.price = "Price must be greater than zero";
      isValid = false;
    }

    if (form.costPrice < 0) {
      newErrors.costPrice = "Cost price cannot be negative";
      isValid = false;
    }

    if (form.quantity < 0) {
      newErrors.quantity = "Quantity cannot be negative";
      isValid = false;
    }

    if (!form.category) {
      newErrors.category = "Category is required";
      isValid = false;
    }

    if (form.stock < 0) {
      newErrors.stock = "Stock cannot be negative";
      isValid = false;
    }

    if (images.length === 0) {
      newErrors.images = "At least one image is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: ["price", "costPrice", "quantity", "stock"].includes(name)
        ? Number(value)
        : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Append image files
      if (images.length === 0) {
        toast.error("Please upload at least one image");
        return;
      }

      images.forEach((image, index) => {
        console.log(`Image ${index} - Is File:`, image instanceof File);
        if (image instanceof File) {
          formData.append("images", image); // ✅ APPEND IMAGE
        } else {
          console.warn("Skipping invalid image:", image);
        }
      });

      // Append product fields
      const productData = {
        ...form,
        sku: form.sku || generateSKU(),
        price: form.price.toString(),
        costPrice: form.costPrice.toString(),
        quantity: form.quantity.toString(),
        stock: form.stock.toString(),
      };

      Object.entries(productData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // ✅ Final debug
      console.log("🔥 Final FormData:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: [FILE] ${value.name}`);
        } else {
          console.log(`${key}:`, value);
        }
      }

      const response = await api.post("/api/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log(`Uploading: ${percent}%`);
        },
      });

      toast.success("Product created!");
      console.log("✅ API Response:", response.data);

      setForm({
        name: "",
        description: "",
        price: 0,
        costPrice: 0,
        quantity: 0,
        category: "",
        stock: 0,
        sku: "",
        subCategory: "",
        brand: "",
        model: "",
      });
      setImages([]);
      setPreviewUrls([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("❌ Submit Error:", error);
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.message;
        const validationErrors = error.response?.data?.errors;
        if (validationErrors)
          setErrors((prev) => ({ ...prev, ...validationErrors }));
        toast.error(serverMessage || "Failed to create product");
      } else {
        toast.error("Unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Create New Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select a category</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub Category
              </label>
              <input
                name="subCategory"
                value={form.subCategory || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($) *
                </label>
                <input
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price ($)
                </label>
                <input
                  name="costPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costPrice}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.costPrice ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.costPrice && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.costPrice}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.quantity ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.stock ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                name="brand"
                value={form.brand || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                name="model"
                value={form.model || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Images *
          </label>
          <div className="flex flex-wrap gap-4 mb-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Preview ${index}`}
                  className="w-24 h-24 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>
            ))}
          </div>
          <div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiUpload className="mr-2" />
              Upload Images
            </button>
            {errors.images && (
              <p className="mt-1 text-sm text-red-600">{errors.images}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Upload up to 5 images (JPEG, PNG, GIF). Max 5MB each.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {isSubmitting ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductForm;
