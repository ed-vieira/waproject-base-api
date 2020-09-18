import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Order } from 'modules/database/models/order';
import { IOrder } from 'modules/database/interfaces/order';
import { OrderRepository } from '../repositories/order';

@Injectable()
export class OrdersService {
  constructor(private ordersRepository: OrderRepository) {}
  public async save(model: IOrder): Promise<Order> {
    if (model.id) return this.update(model);
    return this.create(model);
  }

  public async remove(Id: number): Promise<void> {
    const order = await this.ordersRepository.findById(Id);
    if (!order) {
      throw new NotFoundException('not-found');
    }
    return this.ordersRepository.remove(Id);
  }
  private async create(model: IOrder): Promise<Order> {
    return this.ordersRepository.insert(model);
  }
  private async update(model: IOrder): Promise<Order> {
    const order = await this.ordersRepository.findById(model.id);
    if (!order) throw new NotFoundException('not-found');
    return this.ordersRepository.update({ ...order, ...model });
  }
}
