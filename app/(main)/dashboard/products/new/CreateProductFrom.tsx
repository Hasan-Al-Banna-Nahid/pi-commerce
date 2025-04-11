"use client";
import { useState, useRef } from "react";
import { useProducts } from "@/app/hooks/useProduct";
import { FiUpload, FiX } from "react-icons/fi";
import { AxiosError } from "axios";

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
  const { createProduct } = useProducts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormData>({
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
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  type FormErrors = Record<keyof FormData, string | undefined> & {
    images?: string;
  };

  const [errors, setErrors] = useState<FormErrors>({
    name: undefined,
    description: undefined,
    price: undefined,
    costPrice: undefined,
    quantity: undefined,
    category: undefined,
    stock: undefined,
    sku: undefined,
    subCategory: undefined,
    brand: undefined,
    model: undefined,
    images: undefined,
  });

  const generateSKU = () => {
    return `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      setImages([...images, ...newImages]);

      const newPreviewUrls = newImages.map((file) => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
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
    const newErrors: FormErrors = {
      name: undefined,
      description: undefined,
      price: undefined,
      costPrice: undefined,
      quantity: undefined,
      category: undefined,
      stock: undefined,
      sku: undefined,
      subCategory: undefined,
      brand: undefined,
      model: undefined,
      images: undefined,
    };
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
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Append all product data
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price.toString());
      formData.append("costPrice", form.costPrice.toString());
      formData.append("quantity", form.quantity.toString());
      formData.append("category", form.category);
      formData.append("stock", form.stock.toString());
      formData.append("sku", form.sku || generateSKU());

      // Append optional fields if they exist
      if (form.subCategory) formData.append("subCategory", form.subCategory);
      if (form.brand) formData.append("brand", form.brand);
      if (form.model) formData.append("model", form.model);

      // Append images
      images.forEach((image) => {
        formData.append("images", image);
      });

      await createProduct(formData);

      // Reset form
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
      setErrors({
        name: undefined,
        description: undefined,
        price: undefined,
        costPrice: undefined,
        quantity: undefined,
        category: undefined,
        stock: undefined,
        sku: undefined,
        subCategory: undefined,
        brand: undefined,
        model: undefined,
        images: undefined,
      });

      alert("Product created successfully!");
    } catch (error) {
      console.error("Error creating product:", error);

      if (error instanceof AxiosError) {
        alert(error.response?.data?.message || "Failed to create product");
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Failed to create product");
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
                Product Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows={4}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
                required
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
                Sub Category (Optional)
              </label>
              <input
                name="subCategory"
                value={form.subCategory}
                onChange={handleChange}
                placeholder="Enter sub category"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.subCategory ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.subCategory && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.subCategory}
                </p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  }`}
                  required
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
                  value={form.costPrice}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.costPrice ? "border-red-500" : "border-gray-300"
                  }`}
                  required
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
                  Quantity
                </label>
                <input
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.quantity ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.stock ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Images
          </label>
          <div className="flex space-x-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt="Product Preview"
                  className="w-24 h-24 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 text-white bg-red-600 rounded-full p-1"
                >
                  <FiX />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FiUpload className="inline-block mr-2" />
              Upload Images
            </button>
            {errors.images && (
              <p className="mt-1 text-sm text-red-600">{errors.images}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {isSubmitting ? "Submitting..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductForm;
