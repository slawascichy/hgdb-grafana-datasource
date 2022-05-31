/**
 * Obsługa błędów
 */
export default class ErrorHandler {

  constructor() {}

  /**
   * Logowanie wyjątku do konsoli
   * 
   * @param methodName nazwa metody, z którego pochodzi wyjątek
   * @param message dodatkowy komunikat tekstowy
   * @param status status błędu
   * @param exception wyjątek Javascript
   */
  logException(methodName: string, message: string, status: any, exception: any) {
    console.error('%s --> %s, Status: %s, Exception: %s', methodName, message, status, exception);
  }
}
