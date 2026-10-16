export interface ApiError {
  statusCode: number;
  /** Los 400 de class-validator traen un array de mensajes (en inglés, por propiedad). */
  message: string | string[];
  error?: string;
  /** Cuerpo completo del error, para campos propios de un endpoint (p. ej. `unavailableItems` del checkout). */
  body?: unknown;
}
