import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.MQTT,
      options: {
        url: process.env.MQTT_URL,
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        will: {
          topic: 'lanzhu/lastwill',
          payload: 'Makasenasai!',
          qos: 0,
          retain: false,
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
