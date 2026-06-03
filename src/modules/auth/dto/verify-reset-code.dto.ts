import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

@InputType()
export class VerifyResetCodeDto {
  @Field()
  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  code!: string;

  @Field()
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;
}
