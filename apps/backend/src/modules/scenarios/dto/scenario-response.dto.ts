import { ApiProperty } from '@nestjs/swagger';
import { ScenarioStepDto } from './scenario-step.dto';

class ScenarioMetaDto {
  @ApiProperty({
    description: 'Schema version',
    example: 'scenario-1',
  })
  schemaVersion: 'scenario-1';

  @ApiProperty({
    description: 'Scenario ULID identifier',
    example: '01HXZ3R8E7Q2V4VJ6T9G2J8N1P',
  })
  id: string;

  @ApiProperty({
    description: 'Scenario title',
    example: 'Niedziela 11:00',
  })
  title: string;

  @ApiProperty({
    description: 'Scenario description',
    example: 'Msza święta niedzielna',
  })
  description: string;
}

export class ScenarioDocDto {
  @ApiProperty({
    description: 'Scenario metadata',
    type: ScenarioMetaDto,
  })
  meta: ScenarioMetaDto;

  @ApiProperty({
    description: 'Scenario steps (playlist items)',
    type: [ScenarioStepDto],
  })
  steps: ScenarioStepDto[];
}






