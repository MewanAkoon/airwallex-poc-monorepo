import { Module } from '@nestjs/common';
import { QuadernoService } from './quaderno.service';

@Module({
  providers: [QuadernoService],
  exports: [QuadernoService],
})
export class QuadernoModule {}
