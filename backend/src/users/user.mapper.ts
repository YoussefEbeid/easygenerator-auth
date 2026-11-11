import { UserDocument } from './schemas/user.schema';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
}

export function toPublicUser(user: UserDocument): PublicUser {
  return { id: user.id as string, email: user.email, name: user.name };
}
