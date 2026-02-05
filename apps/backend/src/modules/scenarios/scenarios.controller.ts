import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ScenariosService } from './scenarios.service';
import { ScenarioDoc } from '../../types/scenarios';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { UpdateScenarioDto } from './dto/update-scenario.dto';
import { ScenarioDocDto } from './dto/scenario-response.dto';

@ApiTags('Scenarios')
@Controller('api/scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all scenarios',
    description: 'Retrieve a list of all available scenarios (playlists) with their metadata and steps',
  })
  @ApiResponse({
    status: 200,
    description: 'List of scenarios retrieved successfully',
    type: [ScenarioDocDto],
  })
  async findAll(): Promise<ScenarioDoc[]> {
    return this.scenariosService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get scenario by ID',
    description: 'Retrieve a single scenario by its ULID identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Scenario ULID identifier',
    example: '01HXZ3R8E7Q2V4VJ6T9G2J8N1P',
  })
  @ApiResponse({
    status: 200,
    description: 'Scenario found and returned',
    type: ScenarioDocDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Scenario not found',
  })
  async findOne(@Param('id') id: string): Promise<ScenarioDoc> {
    const scenario = await this.scenariosService.findById(id);
    if (!scenario) {
      throw new NotFoundException(`Scenario with id ${id} not found`);
    }
    return scenario;
  }

  @Post()
  @ApiOperation({
    summary: 'Create new scenario',
    description: 'Create a new scenario (playlist) with metadata and steps. A ULID will be automatically generated.',
  })
  @ApiBody({
    type: CreateScenarioDto,
    description: 'Scenario data to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Scenario created successfully',
    type: ScenarioDocDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async create(@Body() createScenarioDto: CreateScenarioDto): Promise<ScenarioDoc> {
    return this.scenariosService.create(createScenarioDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update scenario',
    description: 'Update an existing scenario. All fields are optional - only provided fields will be updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Scenario ULID identifier',
    example: '01HXZ3R8E7Q2V4VJ6T9G2J8N1P',
  })
  @ApiBody({
    type: UpdateScenarioDto,
    description: 'Scenario fields to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Scenario updated successfully',
    type: ScenarioDocDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Scenario not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async update(
    @Param('id') id: string,
    @Body() updateScenarioDto: UpdateScenarioDto,
  ): Promise<ScenarioDoc> {
    const scenario = await this.scenariosService.update(id, updateScenarioDto);
    if (!scenario) {
      throw new NotFoundException(`Scenario with id ${id} not found`);
    }
    return scenario;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete scenario',
    description: 'Delete a scenario by its ULID identifier. This operation is permanent.',
  })
  @ApiParam({
    name: 'id',
    description: 'Scenario ULID identifier',
    example: '01HXZ3R8E7Q2V4VJ6T9G2J8N1P',
  })
  @ApiResponse({
    status: 204,
    description: 'Scenario deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Scenario not found',
  })
  async delete(@Param('id') id: string): Promise<void> {
    const deleted = await this.scenariosService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Scenario with id ${id} not found`);
    }
  }

  @Post('reload')
  @ApiOperation({
    summary: 'Reload scenarios from disk',
    description: 'Reload all scenarios from disk files into memory. Useful after manual file changes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Scenarios reloaded successfully',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          example: 3,
          description: 'Number of scenarios loaded',
        },
      },
    },
  })
  async reload(): Promise<{ count: number }> {
    return this.scenariosService.reloadFromDisk();
  }
}






