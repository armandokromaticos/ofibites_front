export interface ApiError {
  statusCode: number;
  /** Los 400 de class-validator traen un array de mensajes (en inglés, por propiedad). */
  message: string | string[];
  error?: string;
}
