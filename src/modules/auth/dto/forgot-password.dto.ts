import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

@InputType()
export class ForgotPasswordDto {
  @Field()
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;
}
