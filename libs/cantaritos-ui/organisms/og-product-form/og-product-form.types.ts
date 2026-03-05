export interface ProductFormValues {
  name: string;
  description: string;
  basePrice: string;
  stock: string;
}

export interface OgProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => void;
  isLoading?: boolean;
}
