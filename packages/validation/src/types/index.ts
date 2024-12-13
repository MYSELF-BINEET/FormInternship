export interface FormElementsType {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: Array<{ label: string; value: string }>;  
}
