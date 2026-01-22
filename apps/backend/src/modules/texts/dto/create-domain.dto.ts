import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDomainDto {
  @ApiProperty({
    description: 'Domain name (will be used as folder name)',
    example: 'songs',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Domain name must contain only lowercase letters, numbers, and hyphens',
  })
  name: string;
}



