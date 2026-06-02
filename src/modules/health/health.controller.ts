import { Controller, Get, HttpCode, HttpStatus, HttpException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard, seconds } from '@nestjs/throttler';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 60, ttl: seconds(60) } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async check() {
    const result = await this.healthService.check();
    if (result.status === 'error') {
      throw new HttpException(
        { status: 'error', timestamp: result.timestamp, database: 'disconnected' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return result;
  }
}
