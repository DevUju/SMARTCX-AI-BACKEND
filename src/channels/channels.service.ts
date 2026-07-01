import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from 'src/common/entities/channel.entity';
import { ChannelType } from 'src/common/enums/channel-type.enum';
import { ConnectChannelDto } from './dto/connect-channel.dto';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
  ) {}

  async list(businessId: string): Promise<Channel[]> {
    return this.channelRepository.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
    });
  }

  async connect(businessId: string, input: ConnectChannelDto): Promise<Channel> {
    const existing = await this.channelRepository.findOne({
      where: { businessId, type: input.type },
    });

    if (existing) {
      existing.credentials = input.credentials;
      existing.isConnected = true;
      existing.connectedAt = new Date();
      return this.channelRepository.save(existing);
    }

    const channel = this.channelRepository.create({
      businessId,
      type: input.type,
      credentials: input.credentials,
      isConnected: true,
      connectedAt: new Date(),
    });
    return this.channelRepository.save(channel);
  }

  async disconnect(businessId: string, type: ChannelType): Promise<Channel> {
    const existing = await this.channelRepository.findOne({
      where: { businessId, type },
    });

    if (existing) {
      existing.credentials = {};
      existing.isConnected = false;
      existing.connectedAt = null;
      return this.channelRepository.save(existing);
    }

    const channel = this.channelRepository.create({
      businessId,
      type,
      credentials: {},
      isConnected: false,
      connectedAt: null,
    });
    return this.channelRepository.save(channel);
  }
}