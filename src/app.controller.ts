import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, MqttContext } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('lanzhu')
  getHello(@Ctx() context: MqttContext): string {
    const packet = context.getPacket();
    const buffer = packet.payload;
    const message = buffer.toString();

    console.log('received', message, 'from', packet.topic);

    return this.appService.getHello();
  }
}
