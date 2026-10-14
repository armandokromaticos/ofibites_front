/** Prefijos del RIF venezolano (Figma 3244:12471: selector "J"). */
export const RIF_PREFIXES = [
  { key: "J", label: "J — Persona jurídica" },
  { key: "G", label: "G — Gobierno" },
  { key: "V", label: "V — Venezolano" },
  { key: "E", label: "E — Extranjero" },
  { key: "P", label: "P — Pasaporte" },
  { key: "C", label: "C — Comuna" },
] as const;

/**
 * Rangos de empleados del Figma. Decisión del usuario (T-03): se envía el límite inferior
 * como `employeeCount`; en el resumen se muestra el rango.
 */
export const EMPLOYEE_RANGES = [
  { value: "1", label: "1 a 10" },
  { value: "11", label: "11 a 50" },
  { value: "51", label: "51 a 200" },
  { value: "201", label: "201 a 500" },
  { value: "501", label: "Más de 500" },
] as const;

export interface PhoneCountry {
  code: string;
  name: string;
  flag: string;
  dial: string;
}

/**
 * Códigos de país del teléfono (Figma 3346:1839: "VE 🇻🇪 +58" por defecto). Venezuela primero.
 * La bandera no se muestra: Windows no pinta los emojis de bandera (salen como "VE" y duplican el código).
 */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: "VE", name: "Venezuela", flag: "🇻🇪", dial: "+58" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", dial: "+54" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", dial: "+591" },
  { code: "BR", name: "Brasil", flag: "🇧🇷", dial: "+55" },
  { code: "CA", name: "Canadá", flag: "🇨🇦", dial: "+1" },
  { code: "CL", name: "Chile", flag: "🇨🇱", dial: "+56" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", dial: "+57" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", dial: "+506" },
  { code: "CU", name: "Cuba", flag: "🇨🇺", dial: "+53" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", dial: "+593" },
  { code: "ES", name: "España", flag: "🇪🇸", dial: "+34" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸", dial: "+1" },
  { code: "FR", name: "Francia", flag: "🇫🇷", dial: "+33" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", dial: "+502" },
  { code: "IT", name: "Italia", flag: "🇮🇹", dial: "+39" },
  { code: "MX", name: "México", flag: "🇲🇽", dial: "+52" },
  { code: "PA", name: "Panamá", flag: "🇵🇦", dial: "+507" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", dial: "+595" },
  { code: "PE", name: "Perú", flag: "🇵🇪", dial: "+51" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", dial: "+351" },
  { code: "DO", name: "República Dominicana", flag: "🇩🇴", dial: "+1" },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧", dial: "+44" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", dial: "+598" },
];
