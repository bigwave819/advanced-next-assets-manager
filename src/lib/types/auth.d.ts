declare module "better-auth" {
  interface SessionUser {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: string;
  }
}