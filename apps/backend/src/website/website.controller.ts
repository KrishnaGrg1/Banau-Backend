import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { WebsiteService } from './webiste.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import type { CreateWebsiteDto } from '@repo/shared';
import { User } from 'src/common/decorators/user.decorator';

@UseGuards(AuthGuard)
@Controller('website')
export class WebsiteController {
  constructor(private readonly websitesService: WebsiteService) {}

  @Post()
  async create(@User('id') userId: string, @Body() dto: CreateWebsiteDto) {
    const data = await this.websitesService.addDomain(userId, dto);
    return ApiResponseDto.success(data, 'Domain added successfully');
  }

  @Put('publish')
  async publish(@User('id') userId: string) {
    const data = await this.websitesService.publishWebsite(userId);
    return ApiResponseDto.success(data, 'Website published successfully');
  }

  @Get()
  async getDetails(@User('id') userId: string) {
    const data = await this.websitesService.getWebsiteDetails(userId);
    return ApiResponseDto.success(
      data,
      'Website details retrieved successfully',
    );
  }

  @Get(':subdomain')
  async getBySubdomain(
    @User('id') userId: string,
    @Param('subdomain') subdomain: string,
  ) {
    const website = await this.websitesService.getWebsiteDetailsBySubdomain(
      userId,
      subdomain,
    );
    return ApiResponseDto.success(
      website,
      'Website details retrieved successfully',
    );
  }
}
