import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class ResetPasswordDto {
  @Field()
  @ApiProperty()
  @IsString()
  token!: string;

  @Field()
  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

