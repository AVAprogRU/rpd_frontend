export const environment = {
  production: true,
  // @ts-ignore
  serverUrl: window["env"]["serverUrl"] || "http://localhost",
  // @ts-ignore
  serverPort: window["env"]["serverPort"] || ":8080"
};
