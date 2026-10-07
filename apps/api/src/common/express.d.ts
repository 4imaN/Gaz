declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: import('../auth/auth.types').AuthenticatedUser;
    }
  }
}

export {};
