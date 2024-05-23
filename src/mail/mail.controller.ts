import { Controller, Get, Logger, Query } from '@nestjs/common';
import { MailService } from './mail.service';
import { Mail, Mailtype } from '@prisma/client';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import DataMessage from './types/message';
import { channel } from 'diagnostics_channel';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  private readonly logger = new Logger(MailController.name);

  @Get('get')
  async getMail(@Query('idUser') idUser: string): Promise<Mail[] | null> {
    return await this.mailService.getMailByIdUser(idUser);
  }
  @MessagePattern('register')
  async readRegisterPayment(
    @Payload() payload: any,
    @Ctx() context: RmqContext,
  ) {
    try {
      this.logger.log(`data - register: ${JSON.stringify(payload)}`);
      const DataMessage: DataMessage = JSON.parse(payload.data.notification);
      const channel = context.getChannelRef();
      const originalMessage = context.getMessage();
      channel.ack(originalMessage);

      await this.mailService.sendMail(DataMessage, Mailtype.orderConfirmation);
      await this.mailService.persistNotification(
        DataMessage,
        Mailtype.orderConfirmation,
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  @MessagePattern('confirmation')
  async readConfirmationPayment(
    @Payload() payload: any,
    @Ctx() context: RmqContext,
  ) {
    try {
      this.logger.log(`data - confirmation: ${JSON.stringify(payload)}`);

      const DataMessage: DataMessage = JSON.parse(payload.data.notification);
      const channel = context.getChannelRef();
      const originalMessage = context.getMessage();

      channel.ack(originalMessage);

      await this.mailService.sendMail(DataMessage, Mailtype.orderConfirmation);
      await this.mailService.persistNotification(
        DataMessage,
        Mailtype.orderConfirmation,
      );
    } catch (error) {
      this.logger.error(error);
    }
  }
}
