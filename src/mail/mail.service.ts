import { Injectable } from '@nestjs/common';
import { Mail, Mailtype } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import DataMessage from './types/message';

@Injectable()
export class MailService {
  constructor(private prisma: PrismaService) {}

  async getMailByIdUser(idUser: string): Promise<Mail[] | null> {
    return await this.prisma.mail.findMany({ where: { idUser } });
  }

  async sendMail(content: DataMessage, type: string) {
    console.log('Email Type => ${type}');
    console.log('Email Content => ${JSON.stringfy[content]}');
    //TODO: implement method
  }
  async persistNotification(content: DataMessage, type: Mailtype) {
    const data = {
      idUser: content.idUser,
      mailDestination: this.getDestiantion(content.idUser),
      mailContent: this.makeContent(content.orderNumber, content.orderValue),
      mailType: type,
    };

    await this.prisma.mail.create({ data: { ...data } });
  }
  getDestiantion(idUser: string) {
    switch (idUser) {
      case '10':
        return 'user10@test.com';
      case '20':
        return 'user20@test.com';
      default:
        return 'userdefault@test.com';
    }
  }

  makeContent(orderNumber: number, orderValue: number) {
    return `Numero do pedido: ${orderNumber} \n\n
    Valordo pedido: ${orderValue}`;
  }
}
