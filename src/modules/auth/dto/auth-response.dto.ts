import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class AuthUser {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field()
  first_name!: string;

  @Field()
  last_name!: string;

  @Field()
  role!: string;
}

@ObjectType()
export class AuthResponse {
  @Field()
  access_token!: string;

  @Field(() => AuthUser)
  user!: AuthUser;
}

@ObjectType()
export class LogoutResponse {
  @Field()
  message!: string;
}

@ObjectType()
export class ForgotPasswordResponse {
  @Field()
  message!: string;
}

@ObjectType()
export class VerifyResetCodeResponse {
  @Field()
  resetToken!: string;

  @Field()
  message!: string;
}
