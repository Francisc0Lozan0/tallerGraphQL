import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

@InputType()
export class LoginDto {
  @Field()
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @Field()
  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password!: string;
}
