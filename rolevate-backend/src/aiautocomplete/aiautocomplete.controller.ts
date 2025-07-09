import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiautocompleteService } from './aiautocomplete.service';
import { CompanyDescriptionRequestDto, CompanyDescriptionResponseDto } from './dto/company-description.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('aiautocomplete')
@UseGuards(JwtAuthGuard)
export class AiautocompleteController {
  constructor(private readonly aiautocompleteService: AiautocompleteService) {}

  @Post('companydescription')
  async generateCompanyDescription(
    @Body() requestDto: CompanyDescriptionRequestDto,
  ): Promise<CompanyDescriptionResponseDto> {
    return this.aiautocompleteService.generateCompanyDescription(requestDto);
  }
}