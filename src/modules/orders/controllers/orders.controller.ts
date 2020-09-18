import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Order } from 'modules/database/models/order';
import { AuthRequired } from 'modules/common/guards/token';
import { OrderRepository } from '../repositories/order';
import { OrdersService } from '../services/orders.service';
import { ListValidator } from '../validators/list';
import { SaveValidator } from '../validators/save';
import { enRoles } from 'modules/database/interfaces/user';

@AuthRequired([enRoles.admin])
@ApiTags('Admin: Orders')
@Controller()
export class OrdersController {
  constructor(private orderRepository: OrderRepository, private orderService: OrdersService) {}

  @Get()
  @ApiResponse({ status: 200, type: [Order] })
  public async list(@Query() model: ListValidator) {
    return this.orderRepository.list(model);
  }

  @Post()
  @ApiResponse({ status: 201, type: [Order] })
  public async save(@Body() model: SaveValidator) {
    return this.orderService.save(model);
  }

  @Put()
  @ApiResponse({ status: 200, type: Order })
  public async update(@Body() model: Order) {
    return this.orderService.save(model);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, type: String })
  public async delete(@Param('id') Id: number) {
    return this.orderService.remove(Id);
  }
}
