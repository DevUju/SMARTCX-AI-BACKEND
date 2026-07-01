import { ApiProperty } from '@nestjs/swagger';

export class TicketDraftResponseDto {
  @ApiProperty()
  draft!: string;
}