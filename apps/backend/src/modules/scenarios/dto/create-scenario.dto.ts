import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ScenarioStep } from '../../../types/scenarios';
import { ScenarioStepDto } from './scenario-step.dto';

export class CreateScenarioDto {
  @ApiProperty({
    description: 'Scenario title',
    example: 'Niedziela 11:00',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Scenario description',
    example: 'Msza święta niedzielna',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Scenario steps (playlist items)',
    type: [ScenarioStepDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  steps?: ScenarioStep[];
}

