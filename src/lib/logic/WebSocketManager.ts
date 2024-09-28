class WebSocketManager {
    private static instance: WebSocketManager;
    private ws: WebSocket | null = null;
    private eventCallbacks: Map<string, Function> = new Map();
  
    private constructor() {}
  
    public static getInstance(): WebSocketManager {
      if (!WebSocketManager.instance) {
        WebSocketManager.instance = new WebSocketManager();
      }
      return WebSocketManager.instance;
    }
  
    public connect(url: string): void {
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        this.ws = new WebSocket(url);
  
        this.ws.onopen = () => this.handleEventCallback('open');
        this.ws.onmessage = (event) => this.handleEventCallback('message', event);
        this.ws.onclose = (event) => this.handleEventCallback('close', event);
        this.ws.onerror = (event) => this.handleEventCallback('error', event);
      }
    }
  
    public send(data: any): void {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(data));
      }
    }
  
    public close(): void {
      if (this.ws) {
        this.ws.close();
      }
    }
  
    public setEventCallback(eventType: string, callback: Function): void {
      this.eventCallbacks.set(eventType, callback);
    }
  
    private handleEventCallback(eventType: string, event?: any): void {
      const callback = this.eventCallbacks.get(eventType);
      if (callback) {
        if (event) {
          callback(event);
        } else {
          callback();
        }
      }
    }
  }
  
  export default WebSocketManager;
  