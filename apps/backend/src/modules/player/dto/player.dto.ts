import { IsString, IsNumber, IsOptional, IsIn, IsNotEmpty, IsBoolean } from 'class-validator';

export class SetTextDto {
  @IsString()
  @IsNotEmpty()
  textRef: string;

  @IsNumber()
  @IsOptional()
  slideIndex?: number;
}

export class SetMediaDto {
  @IsString()
  @IsIn(['image', 'video', 'audio'])
  type: 'image' | 'video' | 'audio';

  @IsString()
  @IsNotEmpty()
  path: string;
}

export class SetScenarioDto {
  @IsString()
  @IsNotEmpty()
  scenarioId: string;

  @IsNumber()
  @IsOptional()
  stepIndex?: number;
}

export class NavigateDto {
  @IsString()
  @IsIn(['next', 'prev'])
  direction: 'next' | 'prev';
}

export class SetQRCodeDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsOptional()
  label?: string;
}

export class SetVisibilityDto {
  @IsBoolean()
  visible: boolean;
}

