export class NetworkError extends Error {
  constructor(message, statusCode = null) {
    super(message);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
  }
}
