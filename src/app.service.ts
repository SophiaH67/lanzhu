import { Injectable } from '@nestjs/common';
import { Protocol } from './types/Protocol';
import { connect } from 'async-mqtt';

type EntityHealthTracker = {
  [entity: string]: number; // Number gets incremented on hello, decremented on death
};
@Injectable()
export class AppService {
  private readonly CRITICAL_ENTITIES = ['mori-summer', 'klee', 'klee2'];

  private healths: EntityHealthTracker = {};
  public currentProtocol: Protocol = Protocol.LINK_TO_PILOT;

  private mqttClient = connect(process.env.MQTT_URL, {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
  });

  public getHello(): string {
    return 'Hello World!';
  }

  private calculateDeadEntities(): Set<string> {
    const deadEntities = new Set<string>();

    for (const entity in this.healths) {
      if (this.healths[entity] <= 0) {
        deadEntities.add(entity);
      }
    }

    return deadEntities;
  }

  private calculateCriticalEntities(): Set<string> {
    const deadEntities = this.calculateDeadEntities();
    const criticalEntities = new Set<string>();

    for (const entity of deadEntities) {
      if (this.CRITICAL_ENTITIES.includes(entity)) {
        criticalEntities.add(entity);
      }
    }

    return criticalEntities;
  }

  private recalculateProtocol() {
    const deadCriticalEntities = this.calculateCriticalEntities().size;
    const aliveCriticalEntities =
      this.CRITICAL_ENTITIES.length - deadCriticalEntities;

    // If half or more of the critical entities are dead, we need enter emergency mode
    if (aliveCriticalEntities <= this.CRITICAL_ENTITIES.length / 2)
      return this.setProtocol(Protocol.PROTECT_THE_PILOT);

    // Otherwise, if 1 or more critical entities are dead, we need to enter caution mode
    console.log(
      'deadCriticalEntities',
      deadCriticalEntities,
      ' > 0',
      deadCriticalEntities > 0,
    );
    if (deadCriticalEntities > 0)
      return this.setProtocol(Protocol.UPHOLD_THE_MISSION);

    // Otherwise, we can return to normal operations
    return this.setProtocol(Protocol.LINK_TO_PILOT);
  }

  private async setProtocol(protocol: Protocol) {
    if (this.currentProtocol === protocol)
      return console.warn('Protocol is already set to', protocol);

    await this.mqttClient.publish('pilot/protocol', protocol);
  }

  public onDeath(entity: string) {
    if (!this.healths[entity]) {
      this.healths[entity] = 1;
    }

    this.healths[entity]--;

    return this.recalculateProtocol();
  }

  public onHello(entity: string) {
    if (!this.healths[entity]) {
      this.healths[entity] = 0;
    }

    this.healths[entity]++;

    return this.recalculateProtocol();
  }

  public onProtocolChange(protocol: Protocol) {
    this.currentProtocol = protocol;
  }
}
