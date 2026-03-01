export {};

declare global {
  interface Window {
    api: {
      auth: {
        login: (data: {
          username: string;
          password: string;
        }) => Promise<string>;
      };
      members: {
        create: (data: any) => Promise<any>;
        search: (query: string, options?: any) => Promise<any[]>;
        byQR: (qr: string) => Promise<any>;
        update: (id: string, data: any) => Promise<any>;
        delete: (id: string) => Promise<any>;
        recent: () => Promise<any[]>;
        revenue: () => Promise<any[]>;
      };
      attendance: {
        log: (id: string) => Promise<void>;
      };
    };
  }
}
