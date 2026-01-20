import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { TextsService } from './texts.service';
import { TextDoc } from '../../types';
import { CreateTextDto } from './dto/create-text.dto';
import { UpdateTextDto } from './dto/update-text.dto';
import { CreateDomainDto } from './dto/create-domain.dto';
import { TextDocDto } from './dto/text-response.dto';

@ApiTags('Texts')
@Controller('api/texts')
export class TextsController {
  constructor(private readonly textsService: TextsService) {}

  // ========== DOMAINS ==========

  @Get('domains')
  @ApiOperation({
    summary: 'Get all domains',
    description: 'Retrieve a list of all available text domains (folders like songs, readings, psalms, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of domains retrieved successfully',
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: ['songs', 'readings', 'psalms'],
    },
  })
  async getDomains(): Promise<string[]> {
    return this.textsService.getDomains();
  }

  @Post('domains')
  @ApiOperation({
    summary: 'Create new domain',
    description: 'Create a new text domain (folder). Domain names must be lowercase with hyphens only.',
  })
  @ApiBody({
    type: CreateDomainDto,
    description: 'Domain data to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Domain created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid domain name',
  })
  async createDomain(@Body() createDomainDto: CreateDomainDto): Promise<void> {
    await this.textsService.createDomain(createDomainDto.name);
  }

  // ========== TEXTS ==========

  @Get()
  @ApiOperation({
    summary: 'Get all texts',
    description: 'Retrieve a list of all available texts (songs, readings, etc.) with their metadata and content',
  })
  @ApiResponse({
    status: 200,
    description: 'List of texts retrieved successfully',
    type: [TextDocDto],
  })
  async findAll(): Promise<TextDoc[]> {
    return this.textsService.findAll();
  }

  @Get('by-path')
  @ApiOperation({
    summary: 'Get text by path',
    description: 'Retrieve a text by its file path (domain/filename). Example: songs/barka__01HXZ3R8E7Q2V4VJ6T9G2J8N1P',
  })
  @ApiQuery({
    name: 'path',
    required: true,
    description: 'Text path (domain/filename)',
    example: 'songs/barka__01HXZ3R8E7Q2V4VJ6T9G2J8N1P',
  })
  @ApiResponse({
    status: 200,
    description: 'Text found and returned',
    type: TextDocDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Text not found',
  })
  async findByPath(@Query('path') path: string): Promise<TextDoc> {
    if (!path) {
      throw new NotFoundException('Path is required');
    }
    const text = await this.textsService.findByPath(path);
    if (!text) {
      throw new NotFoundException(`Text not found: ${path}`);
    }
    return text;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get text by ID',
    description: 'Retrieve a single text by its ULID identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Text ULID identifier',
    example: '01HXZ3R8E7Q2V4VJ6T9G2J8N1P',
  })
  @ApiResponse({
    status: 200,
    description: 'Text found and returned',
    type: TextDocDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Text not found',
  })
  async findOne(@Param('id') id: string): Promise<TextDoc> {
    const text = await this.textsService.findById(id);
    if (!text) {
      throw new NotFoundException(`Text with id ${id} not found`);
    }
    return text;
  }

  @Post()
  @ApiOperation({
    summary: 'Create new text',
    description: 'Create a new text (song, reading, etc.) with complete metadata and content. A ULID will be automatically generated.',
  })
  @ApiBody({
    type: CreateTextDto,
    description: 'Text data to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Text created successfully',
    type: TextDocDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async create(@Body() createTextDto: CreateTextDto): Promise<TextDoc> {
    return this.textsService.create(createTextDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update text',
    description: 'Update an existing text. All fields are optional - only provided fields will be updated. Changing domain will move the file to a new folder.',
  })
  @ApiParam({
    name: 'id',
    description: 'Text ULID identifier',
    example: '01HXZ3R8E7Q2V4VJ6T9G2J8N1P',
  })
  @ApiBody({
    type: UpdateTextDto,
    description: 'Text fields to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Text updated successfully',
    type: TextDocDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Text not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTextDto: UpdateTextDto,
  ): Promise<TextDoc> {
    const text = await this.textsService.update(id, updateTextDto);
    if (!text) {
      throw new NotFoundException(`Text with id ${id} not found`);
    }
    return text;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete text',
    description: 'Delete a text by its ULID identifier. This operation is permanent.',
  })
  @ApiParam({
    name: 'id',
    description: 'Text ULID identifier',
    example: '01HXZ3R8E7Q2V4VJ6T9G2J8N1P',
  })
  @ApiResponse({
    status: 204,
    description: 'Text deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Text not found',
  })
  async delete(@Param('id') id: string): Promise<void> {
    const deleted = await this.textsService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Text with id ${id} not found`);
    }
  }

  @Post('reload')
  @ApiOperation({
    summary: 'Reload texts from disk',
    description: 'Reload all texts from disk files into memory. Useful after manual file changes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Texts reloaded successfully',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          example: 3,
          description: 'Number of texts loaded',
        },
      },
    },
  })
  async reload(): Promise<{ count: number }> {
    return this.textsService.reloadFromDisk();
  }
}

