import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export type TicketUpdatedPayload = {
  businessId: string;
  ticketId: string;
  status?: string;
  priority?: string;
  updatedAt: string;
};

export type IssueNewPayload = {
  businessId: string;
  issueId: string;
  priority: string;
  category: string;
  createdAt: string;
};

export type TicketAssignedPayload = {
  businessId: string;
  ticketId: string;
  assignedAgentId: string;
  assignedAt: string;
};

type JoinBusinessRoomBody = {
  businessId: string;
};

@WebSocketGateway({
  namespace: '/realtime',
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  handleConnection(client: Socket): void {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('business:join')
  async joinBusinessRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: JoinBusinessRoomBody,
  ): Promise<{ joined: string }> {
    const room = this.businessRoom(body.businessId);
    await client.join(room);
    return { joined: room };
  }

  emitTicketUpdated(payload: TicketUpdatedPayload): void {
    this.server.to(this.businessRoom(payload.businessId)).emit('ticket:updated', payload);
  }

  emitIssueNew(payload: IssueNewPayload): void {
    this.server.to(this.businessRoom(payload.businessId)).emit('issue:new', payload);
  }

  emitTicketAssigned(payload: TicketAssignedPayload): void {
    this.server.to(this.businessRoom(payload.businessId)).emit('ticket:assigned', payload);
  }

  private businessRoom(businessId: string): string {
    return `business:${businessId}`;
  }
}