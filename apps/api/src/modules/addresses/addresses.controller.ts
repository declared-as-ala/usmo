import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { Address } from './address.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('me/addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  findMine(@Req() req: any) {
    return this.addressesService.findMine(req.user.sub);
  }

  @Post()
  create(@Req() req: any, @Body() body: Partial<Address>) {
    return this.addressesService.create(req.user.sub, body);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: Partial<Address>) {
    return this.addressesService.update(req.user.sub, id, body);
  }

  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    return this.addressesService.delete(req.user.sub, id);
  }
}
