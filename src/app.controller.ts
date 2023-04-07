import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, MqttContext } from '@nestjs/microservices';
import { AppService } from './app.service';
import { Protocol } from './types/Protocol';

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

  @MessagePattern('death/+')
  async onDeath(@Ctx() context: MqttContext) {
    const packet = context.getPacket();

    const death = packet.topic.split('/')[1];
    console.log('death', death);

    await this.appService.onDeath(death);
  }

  @MessagePattern('hello/+')
  async onHello(@Ctx() context: MqttContext) {
    const packet = context.getPacket();

    const hello = packet.topic.split('/')[1];
    console.log('hello', hello);

    await this.appService.onHello(hello);
  }

  @MessagePattern('pilot/protocol')
  onProtocolChange(@Ctx() context: MqttContext): void {
    const packet = context.getPacket();
    const buffer = packet.payload;
    const message = buffer.toString();

    if (!Object.values(Protocol).includes(message as Protocol)) {
      console.error('Invalid protocol', message);
      return;
    }

    this.appService.onProtocolChange(message);
  }
}
