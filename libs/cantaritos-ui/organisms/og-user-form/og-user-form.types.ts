import { UserRole } from "@/domain/types";

export interface UserFormValues {
  name: string;
  email: string;
  password?: string;
  phone: string;
  role?: UserRole;
}

export interface OgUserFormProps {
  defaultValues?: Partial<UserFormValues>;
  onSubmit: (values: UserFormValues) => void;
  isLoading?: boolean;
  isEditing?: boolean;
}
