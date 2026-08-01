import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from './auditlog.schema';
import { AuditLogsService } from './auditlogs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  providers: [AuditLogsService],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
