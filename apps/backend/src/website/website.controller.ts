import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { WebsiteService } from './webiste.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import type { CreateWebsiteDto, WebsiteResponse } from '@repo/shared';
import { ApiResponseDto } from 'src/common/dto/response.dto';

@Controller('website')
export class WebsiteController {
  constructor(private websitesService: WebsiteService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Request() req, @Body() dto: CreateWebsiteDto) {
    const data = await this.websitesService.addDomain(req.user.id, dto);
    return ApiResponseDto.success(data, 'Added Domain successfully');
  }

  @UseGuards(AuthGuard)
  @Put('publish')
  async publishWebsite(@Request() req) {
    const data = await this.websitesService.publishWebsite(req.user.id);
    return ApiResponseDto.success(data, 'Published website successfully');
  }

  @UseGuards(AuthGuard)
  @Get('')
  async getWebiste(@Request() req) {
    const data = await this.websitesService.getWebsiteDetails(req.user.id);
    return ApiResponseDto.success(
      data,
      `Retrieved user's website details successfully`,
    );
  }
}
