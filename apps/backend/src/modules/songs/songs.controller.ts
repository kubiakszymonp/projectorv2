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
import { SongsService } from './songs.service';
import { SongDoc } from '../../types';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { SongDocDto } from './dto/song-response.dto';

@ApiTags('Songs')
@Controller('api/songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all songs',
    description: 'Retrieve a list of all available songs with their metadata and content',
  })
  @ApiResponse({
    status: 200,
    description: 'List of songs retrieved successfully',
    type: [SongDocDto],
  })
  async findAll(): Promise<SongDoc[]> {
    return this.songsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get song by ID',
    description: 'Retrieve a single song by its ULID identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Song ULID identifier',
    example: '01HXZ3R8E7Q2V4VJ6T9G2J8N1P',
  })
  @ApiResponse({
    status: 200,
    description: 'Song found and returned',
    type: SongDocDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Song not found',
  })
  async findOne(@Param('id') id: string): Promise<SongDoc> {
    const song = await this.songsService.findById(id);
    if (!song) {
      throw new NotFoundException(`Song with id ${id} not found`);
    }
    return song;
  }

  @Post()
  @ApiOperation({
    summary: 'Create new song',
    description: 'Create a new song with complete metadata and content. A ULID will be automatically generated.',
  })
  @ApiBody({
    type: CreateSongDto,
    description: 'Song data to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Song created successfully',
    type: SongDocDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async create(@Body() createSongDto: CreateSongDto): Promise<SongDoc> {
    return this.songsService.create(createSongDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update song',
    description: 'Update an existing song. All fields are optional - only provided fields will be updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Song ULID identifier',
    example: '01HXZ3R8E7Q2V4VJ6T9G2J8N1P',
  })
  @ApiBody({
    type: UpdateSongDto,
    description: 'Song fields to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Song updated successfully',
    type: SongDocDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Song not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async update(
    @Param('id') id: string,
    @Body() updateSongDto: UpdateSongDto,
  ): Promise<SongDoc> {
    const song = await this.songsService.update(id, updateSongDto);
    if (!song) {
      throw new NotFoundException(`Song with id ${id} not found`);
    }
    return song;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete song',
    description: 'Delete a song by its ULID identifier. This operation is permanent.',
  })
  @ApiParam({
    name: 'id',
    description: 'Song ULID identifier',
    example: '01HXZ3R8E7Q2V4VJ6T9G2J8N1P',
  })
  @ApiResponse({
    status: 204,
    description: 'Song deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Song not found',
  })
  async delete(@Param('id') id: string): Promise<void> {
    const deleted = await this.songsService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Song with id ${id} not found`);
    }
  }

  @Post('reload')
  @ApiOperation({
    summary: 'Reload songs from disk',
    description: 'Reload all songs from disk files into memory. Useful after manual file changes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Songs reloaded successfully',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          example: 3,
          description: 'Number of songs loaded',
        },
      },
    },
  })
  async reload(): Promise<{ count: number }> {
    return this.songsService.reloadFromDisk();
  }
}

